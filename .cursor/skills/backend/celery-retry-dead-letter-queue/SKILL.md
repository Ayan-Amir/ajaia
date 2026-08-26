---
name: celery-retry-dead-letter-queue
description: >
  Apply when a Celery task has exhausted all retries and you need to capture
  the failed message for inspection, replay, or manual intervention. A
  dedicated DLQ receives exhausted tasks; operators can persist entries to DB
  and replay via Django admin or management command.
---

# Dead-Letter Queue

## Purpose

Apply this sub-skill when a Celery task has exhausted all its retries and you
need to capture the failed message for later inspection, replay, or manual
intervention rather than losing it silently. A dead-letter queue (DLQ) is a
dedicated Celery queue that receives tasks whose retry budgets are exhausted.
Operators can inspect, fix the root cause, and replay messages from the DLQ
without data loss.

## Implementation Pattern

1. **Declare a dedicated DLQ queue** (`celery.dlq`) in `CELERY_TASK_QUEUES`.
2. **Create a passthrough DLQ task** that simply stores the failed payload and
   raises an alert; it does not retry.
3. **In `on_failure`**, when `MaxRetriesExceededError` is raised, route the
   original task arguments to the DLQ task via `.apply_async(queue="celery.dlq")`.
4. **Start a separate DLQ worker** bound to the `celery.dlq` queue so that DLQ
   processing does not interfere with normal work queues.
5. **Persist DLQ entries to the database** using a `DeadLetterEntry` model so
   operators have a queryable audit trail and can trigger replays via the
   Django admin.

## Code Example

```python
# project/settings.py  (add DLQ queue; Redis broker)
CELERY_BROKER_URL = "redis://localhost:6379/0"

from kombu import Queue

CELERY_TASK_QUEUES = (
    Queue("default"),
    Queue("high_priority"),
    Queue("low_priority"),
    Queue("celery.dlq"),    # dead-letter queue — never mixed with live work
)
```

```python
# shared/models.py  (DLQ audit model)
from django.db import models


class DeadLetterEntry(models.Model):
    """Persists the payload of a permanently failed Celery task.

    Operators use this model to inspect failures and trigger replays
    via the Django admin or a management command.
    """

    task_name = models.CharField(max_length=255, db_index=True)
    task_id = models.CharField(max_length=255, unique=True)
    args = models.JSONField(default=list)
    kwargs = models.JSONField(default=dict)
    exception_class = models.CharField(max_length=255)
    exception_message = models.TextField()
    traceback = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    replayed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Dead Letter Entry"
        verbose_name_plural = "Dead Letter Entries"

    def __str__(self) -> str:
        return f"{self.task_name} [{self.task_id}]"
```

```python
# shared/tasks.py  (DLQ receiver task)
import logging

from celery import shared_task

from shared.models import DeadLetterEntry

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name="shared.dead_letter_receiver",
    # Never retry a DLQ task — it is the end of the line
    max_retries=0,
    acks_late=True,
)
def dead_letter_receiver_task(
    self,
    original_task_name: str,
    original_task_id: str,
    args: list,
    kwargs: dict,
    exception_class: str,
    exception_message: str,
    traceback_str: str,
) -> None:
    """Receive and persist a permanently failed task payload.

    Args:
        original_task_name: Dotted name of the failed task.
        original_task_id: Celery task ID of the original failed task.
        args: Positional arguments from the failed task call.
        kwargs: Keyword arguments from the failed task call.
        exception_class: Class name of the exception that caused failure.
        exception_message: Human-readable exception message.
        traceback_str: Full traceback string for debugging.
    """
    logger.error(
        "DLQ entry received",
        extra={
            "task_id": self.request.id,
            "original_task_name": original_task_name,
            "original_task_id": original_task_id,
            "exception_class": exception_class,
        },
    )
    DeadLetterEntry.objects.update_or_create(
        task_id=original_task_id,
        defaults={
            "task_name": original_task_name,
            "args": args,
            "kwargs": kwargs,
            "exception_class": exception_class,
            "exception_message": exception_message,
            "traceback": traceback_str,
        },
    )
```

```python
# integrations/tasks.py  (routing to DLQ in on_failure)
import logging

from celery import shared_task
from celery.exceptions import MaxRetriesExceededError

from integrations.exceptions import TransientAPIError
from shared.backoff import full_jitter_backoff
from shared.tasks import dead_letter_receiver_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="integrations.sync_resource", max_retries=5)
def sync_resource_task(self, resource_pk: int) -> dict:
    """Sync a resource with the external API.

    Args:
        resource_pk: PK of the resource to sync.

    Returns:
        Sync result dict.
    """
    from integrations.services import sync_resource
    from integrations.models import Resource

    resource = Resource.objects.get(pk=resource_pk)
    try:
        return sync_resource(resource)
    except TransientAPIError as transient_error:
        countdown = full_jitter_backoff(self.request.retries)
        raise self.retry(exc=transient_error, countdown=countdown)


@sync_resource_task.on_failure
def on_sync_resource_failure(
    exc: Exception,
    task_id: str,
    args: list,
    kwargs: dict,
    einfo: object,
) -> None:
    """Route permanently failed task to the dead-letter queue.

    Args:
        exc: Exception that caused the final failure.
        task_id: Celery task ID.
        args: Positional task arguments.
        kwargs: Keyword task arguments.
        einfo: Celery ExceptionInfo object with traceback details.
    """
    logger.error(
        "Task exhausted retries; routing to DLQ",
        extra={
            "task_id": task_id,
            "task_name": "integrations.sync_resource",
            "exception_class": type(exc).__name__,
        },
    )
    # Route failed payload to DLQ queue for audit and potential replay
    dead_letter_receiver_task.apply_async(
        kwargs={
            "original_task_name": "integrations.sync_resource",
            "original_task_id": task_id,
            "args": list(args),
            "kwargs": kwargs,
            "exception_class": type(exc).__name__,
            "exception_message": str(exc),
            "traceback_str": str(einfo.traceback) if einfo else "",
        },
        queue="celery.dlq",   # isolated DLQ queue
    )
```

```python
# shared/management/commands/replay_dlq.py
# Run with: python manage.py replay_dlq --task-name integrations.sync_resource
import logging

from django.core.management.base import BaseCommand, CommandParser
from django.utils import timezone

from shared.models import DeadLetterEntry

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Replay unresolved dead-letter queue entries."""

    help = "Replay DLQ entries for a given task name."

    def add_arguments(self, parser: CommandParser) -> None:
        """Add CLI arguments.

        Args:
            parser: Django management command argument parser.
        """
        parser.add_argument(
            "--task-name",
            required=True,
            help="Dotted task name to replay (e.g. integrations.sync_resource)",
        )

    def handle(self, *args: object, **options: object) -> None:
        """Replay all un-replayed DLQ entries for the specified task.

        Args:
            *args: Unused positional args.
            **options: Parsed command options including task_name.
        """
        from celery import current_app

        task_name: str = options["task_name"]
        entries = DeadLetterEntry.objects.filter(
            task_name=task_name,
            replayed_at__isnull=True,
        )

        replayed_count = 0
        for entry in entries:
            task = current_app.tasks.get(task_name)
            if task is None:
                logger.error(
                    "Task not found for replay",
                    extra={"task_name": task_name},
                )
                continue
            task.apply_async(args=entry.args, kwargs=entry.kwargs)
            entry.replayed_at = timezone.now()
            entry.save(update_fields=["replayed_at"])
            replayed_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Replayed {replayed_count} DLQ entries for '{task_name}'."
            )
        )
```

## Pitfalls

- **Running DLQ tasks on normal queues**: If the DLQ worker crashes or is
  absent, DLQ tasks will pile up and consume broker memory. Always bind a
  dedicated worker: `celery -A project worker -Q celery.dlq -c 1`.
- **Retrying inside the DLQ task**: A DLQ task must never retry; it is a
  terminal handler. Set `max_retries=0`.
- **Not persisting DLQ entries to DB**: Relying solely on broker storage means
  entries are lost if the broker is flushed. Always persist to `DeadLetterEntry`.

## See Also

- Parent skill: `../../celery-retry-failure/SKILL.md`
- Alerting when entries arrive in the DLQ: see "Alerting on Permanent
  Failure" in `../../celery-retry-failure/SKILL.md`
- Backoff strategies before a task reaches the DLQ: `../backoff-strategies/SKILL.md`
