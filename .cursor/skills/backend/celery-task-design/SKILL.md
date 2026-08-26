---
name: celery-task-design
description: >
  Apply this skill whenever you are deciding whether to move logic into a
  Celery background task, choosing the right Celery primitive (task, chain,
  chord, group), or wiring a DRF view to dispatch async work. Trigger on
  keywords: async task, background job, deferred processing, file upload,
  webhook dispatch, email sending, Celery, task_id, 202 Accepted.
---

# Celery Task Design

## When to Use This Skill
- You are writing code in *any* layer — a DRF view or serializer, a service
  function, a signal handler, a management command — that performs I/O, sends
  email, calls a third-party API, or processes a file, and its result is not
  needed in the HTTP response.
- You need to return a response immediately and defer work to a worker.
- You are choosing between `task`, `chain`, `chord`, or `group` primitives.
- You are configuring Django's Celery settings (`CELERY_*` keys) for the first
  time or adding a new queue/worker pool.

## Core Concepts

A Celery **task** is the smallest unit of deferred work. It runs in a separate
process (worker) outside the HTTP request cycle. The primary signal to extract
logic into a task is any operation that would cause the HTTP response to block
for more than ~200 ms or that involves unreliable external systems (email
providers, S3, payment gateways, third-party REST APIs).

The **request/response boundary** is the most important concept. Code that
runs inside `APIView.post()` or `Serializer.save()` is synchronous and blocks
the Gunicorn/uWSGI worker until it returns. Any I/O that does not need to be
reflected in the immediate HTTP response must be pushed past this boundary into
a Celery task. The view then returns `202 Accepted` with a `task_id` the client
can use to poll for completion.

Celery provides four **composition primitives** beyond a plain task call. A
`chain` pipes the output of one task as the input of the next — use it for
ordered, sequential pipelines (e.g., parse → validate → persist). A `group`
runs multiple tasks in parallel with no dependency between them. A `chord` is a
`group` followed by a callback that receives all results — use it for fan-out
work that must be aggregated (e.g., process N rows in parallel, then write a
summary). Use the simplest primitive that fits; prefer a plain task call over a
chain if there is only one step.

**Serialization safety** is a hard rule: pass only JSON-serialisable
primitives as task arguments — PKs, strings, numbers, booleans, and small
dicts or lists of those. Never pass Django ORM instances, querysets, file
handles, or bare `datetime` objects; ORM instances fail to serialise (or
silently capture a stale snapshot) and datetimes need explicit ISO-format
strings. Re-fetch from the database inside the task body using the PK.

**Dispatch after commit.** Calling `.delay()` inside a Django transaction is
unsafe: the worker can pick the message up before the surrounding transaction
commits, causing a `DoesNotExist` when the task tries to read the just-created
row. Wrap dispatches in `transaction.on_commit(lambda: my_task.delay(pk))`
whenever the caller is inside `transaction.atomic()` or a DRF view that opens
an implicit transaction (the default when `ATOMIC_REQUESTS=True`).

Django settings must declare a **Celery app** in `celery.py` at the project
root and include the `CELERY_*` configuration block in `settings.py`. Always
set `CELERY_TASK_SERIALIZER = "json"` and `CELERY_RESULT_BACKEND` to a Redis
URL so task results can be polled by the API.

## Decision Framework

1. Does the caller (HTTP client, calling service) need the result of this
   operation before it can return its own response?
   - **Yes** — keep synchronous.
   - **No** — proceed to step 2.

2. Is the operation independent of the caller's response lifecycle (email,
   webhook, file processing, non-critical third-party call)?
   - **Yes** — extract to a Celery task. If called from a DRF view, return
     `202 Accepted` with `task_id`.
   - **No** — re-evaluate step 1; if result is needed, keep sync.

3. Is the operation slow (>200 ms) or flaky (external network, rate limits)?
   Some third-party calls are fast and reliable enough to stay sync (auth
   token verification, feature-flag lookup). Move to async when the call is
   slow, flaky, or not in the critical response path.

4. Does this task depend on the result of another task?
   - **Yes** — use `chain(task_a.s(args), task_b.s())`.
   - **No** — proceed to step 5.

5. Does this task fan out into parallel sub-tasks whose results must be
   collected?
   - **Yes** — use `chord(group(...), callback.s())`.
   - **Fan-out with no aggregation** — use `group(...)`.
   - **Single unit of work** — plain `.delay()` / `.apply_async()`.

6. Does this task need to run on a specific worker pool or have priority?
   - **Yes** — consult `../celery-task-design-task-routing/SKILL.md`.

## Code Examples

```python
# project/celery.py
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

app = Celery("project")

# namespace="CELERY" means all celery config keys in settings start with CELERY_
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every INSTALLED_APP
app.autodiscover_tasks()
```

```python
# project/__init__.py
# Ensures the Celery app is loaded when Django starts (required for signals)
from .celery import app as celery_app

__all__ = ("celery_app",)
```

```python
# project/settings.py  (Celery configuration block)
import os

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND")
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True        # exposes STARTED state in polling
CELERY_TASK_TIME_LIMIT = 300            # hard kill after 5 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 240       # raises SoftTimeLimitExceeded at 4 min
CELERY_WORKER_PREFETCH_MULTIPLIER = 1   # fair dispatch for long-running tasks
```

```python
# uploads/tasks.py
import logging

from celery import shared_task

from uploads.models import UploadedFile
from uploads.services import run_file_processing

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,                    # gives access to self.request, self.retry
    name="uploads.process_file",  # explicit name avoids rename surprises
    max_retries=3,
    default_retry_delay=30,
)
def process_file_task(self, file_pk: int) -> dict:
    """Process an uploaded file asynchronously.

    Args:
        file_pk: Primary key of the UploadedFile instance to process.

    Returns:
        A dict with status and output_path keys.
    """
    logger.info(
        "Starting file processing",
        extra={"task_id": self.request.id, "file_pk": file_pk},
    )
    # Re-fetch from DB — never pass the ORM object itself as an argument
    uploaded_file = UploadedFile.objects.get(pk=file_pk)
    result = run_file_processing(uploaded_file)
    logger.info(
        "File processing complete",
        extra={"task_id": self.request.id, "file_pk": file_pk},
    )
    return result
```

```python
# uploads/views.py
import logging
import uuid

from celery.result import AsyncResult
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from uploads.serializers import UploadedFileSerializer
from uploads.tasks import process_file_task

logger = logging.getLogger(__name__)


class FileUploadView(APIView):
    """Accept a file upload and dispatch background processing."""

    parser_classes = [MultiPartParser]

    def post(self, request: Request) -> Response:
        """Handle file upload, persist metadata, dispatch async task.

        Args:
            request: DRF request containing the uploaded file.

        Returns:
            202 Accepted with task_id for client polling.
        """
        from django.db import transaction

        serializer = UploadedFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.save(uploaded_by=request.user)

        # Dispatch AFTER the surrounding transaction commits. Under
        # ATOMIC_REQUESTS=True (or any explicit transaction.atomic block),
        # calling .delay() mid-transaction lets the worker pick the task up
        # before the row is visible and fail with DoesNotExist. on_commit
        # defers the enqueue until commit — no result handle is returned.
        transaction.on_commit(lambda: process_file_task.delay(uploaded_file.pk))

        # If the caller needs a task_id to return to the client, generate
        # one up-front with uuid4() and pass it via apply_async(task_id=...)
        # inside the on_commit lambda. See the polling section below.
        task_id = str(uuid.uuid4())
        transaction.on_commit(
            lambda: process_file_task.apply_async(
                args=[uploaded_file.pk], task_id=task_id
            )
        )
        async_result = AsyncResult(task_id)

        logger.info(
            "File upload dispatched",
            extra={"task_id": async_result.id, "file_pk": uploaded_file.pk},
        )
        response = Response(
            {"task_id": async_result.id, "status": "queued"},
            status=status.HTTP_202_ACCEPTED,
        )
        response["Location"] = f"/api/jobs/{async_result.id}/"
        return response


class TaskStatusView(APIView):
    """Poll a Celery task for its current status and result."""

    def get(self, request: Request, task_id: str) -> Response:
        """Return current task state, result, or error detail.

        Args:
            request: Incoming DRF request.
            task_id: Celery AsyncResult ID from the original 202 response.

        Returns:
            JSON with state, result, and optional error fields.
        """
        result = AsyncResult(task_id)
        payload: dict = {"task_id": task_id, "state": result.state}

        if result.successful():
            payload["result"] = result.get()
        elif result.failed():
            payload["error"] = str(result.result)

        return Response(payload)
```

```python
# uploads/services.py  (dispatch from a service-layer function, not a view)
from django.db import transaction

from uploads.models import UploadedFile
from uploads.tasks import process_file_task


def ingest_uploaded_file(file_pk: int) -> None:
    """Kick off background processing for an already-persisted upload.

    Service functions dispatch tasks the same way views do. Use
    ``transaction.on_commit`` whenever the caller is inside an atomic
    block so the worker does not race the commit.

    Args:
        file_pk: PK of an ``UploadedFile`` row that has been saved.
    """
    with transaction.atomic():
        UploadedFile.objects.filter(pk=file_pk).update(status="queued")
        # Deferred enqueue ensures the row is visible when the worker reads it
        transaction.on_commit(lambda: process_file_task.delay(file_pk))
```

```python
# uploads/tasks.py  (chain + chord composition example)
from celery import chain, chord, group, shared_task


@shared_task(bind=True, name="uploads.parse_csv")
def parse_csv_task(self, file_pk: int) -> list:
    """Parse CSV rows from an uploaded file.

    Args:
        file_pk: PK of the uploaded file.

    Returns:
        List of row dicts ready for validation.
    """
    from uploads.services import parse_csv  # lazy import avoids circular deps

    return parse_csv(file_pk)


@shared_task(bind=True, name="uploads.validate_row")
def validate_row_task(self, row: dict) -> dict:
    """Validate a single CSV row.

    Args:
        row: Dict representing one parsed CSV row.

    Returns:
        Validated and normalised row dict.
    """
    from uploads.services import validate_row

    return validate_row(row)


@shared_task(bind=True, name="uploads.persist_rows")
def persist_rows_task(self, validated_rows: list, file_pk: int) -> int:
    """Persist all validated rows to the database.

    Args:
        validated_rows: Collected by chord callback.
        file_pk: PK used to associate rows with the parent upload.

    Returns:
        Count of rows saved.
    """
    from uploads.services import bulk_save_rows

    return bulk_save_rows(validated_rows, file_pk)
```

## Sub-Skills Index

| Sub-Skill            | File Path                          | When to Consult                               |
|----------------------|------------------------------------|-----------------------------------------------|
| Task Decomposition   | ../celery-task-design-task-decomposition/SKILL.md   | Splitting a large task into chain/chord/group |
| Task Routing         | ../celery-task-design-task-routing/SKILL.md         | Assigning tasks to queues or worker pools     |

## Anti-Patterns to Avoid

- **Passing non-primitive args**: ORM instances, querysets, file handles, and
  bare datetime objects either fail to serialise or silently capture stale
  state. Pass only PKs, strings, numbers, booleans, and small dicts/lists of
  those; re-fetch inside the task.
- **`.delay()` inside `transaction.atomic()`**: worker may pick up the task
  before the transaction commits and fail with `DoesNotExist`. Wrap in
  `transaction.on_commit(...)` or dispatch after the transaction closes.
- **Calling `.get()` inside a running task**: Can deadlock the worker pool.
  Use `chain` or `chord` to compose dependent tasks instead.
- **`CELERY_ALWAYS_EAGER = True` in production**: Runs tasks synchronously,
  masking broker failures. Reserve for unit tests only.
- **No time limits**: A hung task blocks a worker indefinitely. Always set
  both `CELERY_TASK_TIME_LIMIT` and `CELERY_TASK_SOFT_TIME_LIMIT`.
- **Single queue for all tasks**: Slow tasks starve fast ones. Use dedicated
  queues via `CELERY_TASK_ROUTES`; see `../celery-task-design-task-routing/SKILL.md`.
- **Omitting `CELERY_RESULT_BACKEND`**: Without it, `AsyncResult.state` always
  returns `PENDING`; polling endpoints become useless.

## Django/DRF Integration Notes

- Import the Celery app in `project/__init__.py` to ensure it is loaded when
  Django starts (required for signals and task autodiscovery).
- Call `.delay()` after `serializer.save()` and pass `instance.pk`, not the
  instance itself.
- Return `202 Accepted` and set the `Location` header pointing to the polling
  endpoint so REST clients can follow the standard async pattern.
- Set `CELERY_TASK_TRACK_STARTED = True` so the polling endpoint can
  distinguish `PENDING` (not yet picked up) from `STARTED` (in progress).

## Checklist

- [ ] All task functions use `@shared_task(bind=True, name="app.task_name")`
- [ ] Task arguments are JSON-serialisable primitives only (PKs, strings,
      numbers, booleans, small dicts/lists of primitives) — never ORM
      instances, querysets, files, or bare datetime objects
- [ ] Dispatches inside a transaction are wrapped in `transaction.on_commit(...)`
- [ ] `CELERY_TASK_SERIALIZER = "json"` and `CELERY_RESULT_BACKEND` configured
- [ ] View returns `202 Accepted` with `task_id` and `Location` header
- [ ] `CELERY_TASK_TIME_LIMIT` and `CELERY_TASK_SOFT_TIME_LIMIT` set
- [ ] Polling endpoint handles PENDING / STARTED / SUCCESS / FAILURE states
- [ ] `celery.py` imported in `project/__init__.py`
- [ ] `app.autodiscover_tasks()` called so all `tasks.py` modules are found
