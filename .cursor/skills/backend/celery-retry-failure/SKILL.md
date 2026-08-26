---
name: celery-retry-failure
description: >
  Apply this skill whenever you are implementing retry logic for a Celery task,
  handling task failure callbacks, designing exponential backoff, or routing
  exhausted tasks to a dead-letter queue. Trigger on keywords: retry, backoff,
  max_retries, autoretry_for, self.retry, task failure, rate limit error,
  transient error, MaxRetriesExceededError, on_failure, DLQ, alert on failure.
---

# Celery Retry and Failure Handling

## When to Use This Skill
- You are adding retry logic to a task that calls an external API, sends email,
  or performs any operation that can fail transiently.
- You need to distinguish recoverable failures (network timeouts, rate limits)
  from unrecoverable ones (validation errors, missing records).
- You need to update a Django model status field when a task permanently fails.
- You need to propagate async errors back to API consumers via a polling
  endpoint or webhook notification.

## Core Concepts

Celery exposes two retry mechanisms. The declarative `autoretry_for` parameter
on `@shared_task` automatically retries the task when specified exception types
are raised. This is the preferred approach for uniform retry behavior. The
imperative `self.retry(exc=..., countdown=N)` gives fine-grained control per
exception type — use it when you need exponential backoff, different retry
delays per error type, or conditional retry logic.

The most critical design decision in retry handling is **classifying failures**.
Transient failures — network timeouts, HTTP 429/503 responses, temporary
database deadlocks — should be retried. Permanent failures — HTTP 400 bad
request, missing database records, business rule violations — must not be
retried because they will never succeed. Retrying a permanent failure wastes
resources and delays the `on_failure` callback that marks the record as failed
in the database.

**Exponential backoff with jitter** is the standard retry delay pattern for
tasks that call external services. Pure exponential backoff (`2 ** retries`)
can cause thundering herds when many workers retry simultaneously after a
shared service outage. Adding a random jitter term spreads the retry load
across the retry window. The formula is:
`countdown = (2 ** self.request.retries) + random.uniform(0, 1)`.

When a task exhausts all retries, Celery raises `MaxRetriesExceededError` and
calls the `on_failure` callback. The `on_failure` hook is the correct place to
mark the associated Django model record as permanently failed, emit an alert to
Sentry, and optionally route the task payload to a dead-letter queue for manual
inspection. Never let a permanently failed task silently disappear.

**API consumers** that trigger async work via a `202 Accepted` pattern need a
way to learn about failures. The polling endpoint (`GET /api/jobs/{task_id}/`)
should check `AsyncResult.state` and, when `FAILURE`, return the exception
message in the response. For long-running pipelines, use a webhook callback URL
stored on the job record and POST the failure details when `on_failure` fires.

## Decision Framework

1. Is the exception caused by an external system (network, third-party API,
   email provider, rate limiter)?
   - **Yes** — transient; retry with exponential backoff.
   - **No** — proceed to step 2.

2. Is the exception caused by bad input data, a missing DB record, or a
   business rule violation?
   - **Yes** — permanent; do not retry; call `on_failure` immediately.
   - **No** — proceed to step 3.

3. Has the task reached `max_retries`?
   - **Yes** — treat as permanent failure; update DB record, emit alert,
     optionally route to DLQ; see `../celery-retry-dead-letter-queue/SKILL.md`.
   - **No** — retry with `self.retry(exc=exc, countdown=backoff_seconds)`.

4. Does the failure need to be visible to the API consumer?
   - **Via polling** — ensure the task result backend stores the failure state.
   - **Via webhook** — POST failure details in the `on_failure` callback.
   - **Both** — do both; they are independent mechanisms.

5. Does the failure need an ops alert?
   - **Yes** — wire `task_failure` signal to Sentry; see the
     "Alerting on Permanent Failure" section below.

## Code Examples

```python
# shared/backoff.py
import random

MAX_BACKOFF_SECONDS = 600


def compute_backoff(retry_count: int) -> float:
    """Compute exponential backoff with full jitter.

    Args:
        retry_count: Current retry attempt number (0-based).

    Returns:
        Seconds to wait before the next retry attempt.
    """
    exponential_ceiling = min(2 ** retry_count, MAX_BACKOFF_SECONDS)
    return random.uniform(0, exponential_ceiling)
```

```python
# integrations/tasks.py
import logging

from celery import shared_task

from integrations.exceptions import RateLimitError, TransientAPIError
from integrations.models import SyncJob, SyncJobStatus
from integrations.services import call_external_api
from shared.backoff import compute_backoff

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name="integrations.sync_job",
    # autoretry_for handles simple transient errors automatically
    autoretry_for=(TransientAPIError,),
    max_retries=5,
    default_retry_delay=30,
    # acks_late ensures the message is not acked until the task succeeds,
    # preventing message loss if the worker crashes mid-execution
    acks_late=True,
)
def sync_job_task(self, job_pk: int) -> dict:
    """Synchronise a job record with the external API.

    Args:
        job_pk: PK of the SyncJob instance to synchronise.

    Returns:
        Dict with sync_status and external_id keys on success.
    """
    job = SyncJob.objects.get(pk=job_pk)
    job.status = SyncJobStatus.RUNNING
    job.save(update_fields=["status"])

    try:
        result = call_external_api(job)
    except RateLimitError as rate_limit_error:
        # Rate limit is transient but needs a longer backoff than default
        backoff_seconds = compute_backoff(self.request.retries)
        logger.warning(
            "Rate limit hit; scheduling retry",
            extra={
                "task_id": self.request.id,
                "job_pk": job_pk,
                "retry_in": backoff_seconds,
                "error": str(rate_limit_error),
            },
        )
        raise self.retry(exc=rate_limit_error, countdown=backoff_seconds)
    except ValueError as permanent_error:
        # ValueError indicates bad data — do not retry
        logger.error(
            "Permanent validation error in sync job",
            extra={"task_id": self.request.id, "job_pk": job_pk},
        )
        job.status = SyncJobStatus.FAILED
        job.error_message = str(permanent_error)
        job.save(update_fields=["status", "error_message"])
        # Re-raise without retry so Celery marks task FAILURE immediately
        raise

    job.status = SyncJobStatus.COMPLETED
    job.external_id = result["external_id"]
    job.save(update_fields=["status", "external_id"])

    logger.info(
        "Sync job completed",
        extra={"task_id": self.request.id, "job_pk": job_pk},
    )
    return result


@sync_job_task.on_failure
def on_sync_job_failure(
    exc: Exception,
    task_id: str,
    args: list,
    kwargs: dict,
    einfo: object,
) -> None:
    """Handle permanent task failure after all retries are exhausted.

    Args:
        exc: The exception that caused the final failure.
        task_id: Celery task ID.
        args: Positional task arguments (first element is job_pk).
        kwargs: Keyword task arguments.
        einfo: Celery ExceptionInfo object with traceback.
    """
    job_pk = args[0] if args else kwargs.get("job_pk")
    logger.error(
        "Sync job permanently failed",
        extra={"task_id": task_id, "job_pk": job_pk, "error": str(exc)},
    )

    if job_pk:
        SyncJob.objects.filter(pk=job_pk).update(
            status=SyncJobStatus.FAILED,
            error_message=str(exc),
        )
```

```python
# integrations/models.py  (status field used by on_failure)
from django.db import models


class SyncJobStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    RUNNING = "running", "Running"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"


class SyncJob(models.Model):
    """Represents an async synchronisation job with an external system."""

    status = models.CharField(
        max_length=20,
        choices=SyncJobStatus.choices,
        default=SyncJobStatus.PENDING,
        db_index=True,
    )
    error_message = models.TextField(blank=True, default="")
    external_id = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Do NOT set Meta.ordering here: a default ordering forces ORDER BY on
    # every queryset, including places that do not need it, adding database
    # overhead. Order explicitly at the query site, e.g.
    #     SyncJob.objects.filter(...).order_by("-created_at")
```

```python
# integrations/views.py  (polling endpoint returning failure detail)
from celery.result import AsyncResult
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from integrations.models import SyncJob


class SyncJobStatusView(APIView):
    """Return status and result for a submitted sync job."""

    def get(self, request: Request, task_id: str) -> Response:
        """Poll a sync job task for its current state.

        Args:
            request: Incoming DRF request.
            task_id: Celery task ID from the original 202 response.

        Returns:
            JSON with state, result or error, and database status.
        """
        celery_result = AsyncResult(task_id)
        payload: dict = {
            "task_id": task_id,
            "celery_state": celery_result.state,
        }

        if celery_result.successful():
            payload["result"] = celery_result.get()
        elif celery_result.failed():
            payload["error"] = str(celery_result.result)

        # Also include DB-level status for richer client feedback
        job = SyncJob.objects.filter(
            # task_id stored on model for cross-reference
        ).first()
        if job:
            payload["job_status"] = job.status
            payload["job_error"] = job.error_message

        return Response(payload)
```

## Alerting on Permanent Failure

Tasks that exhaust retries should surface to the operator, not just to a log
file. **Prefer an APM integration over hand-wired signal handlers.** Sentry's
`CeleryIntegration` auto-captures every task failure (final exception, task
name, args, traceback, plus any attached user/tag context). NewRelic and
Datadog provide equivalent Celery integrations. Configure the APM once and
task failures are reported without any per-project signal wiring.

```python
# project/settings.py  (Sentry example)
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[DjangoIntegration(), CeleryIntegration()],
    # CeleryIntegration hooks task_failure + task_retry signals internally
)
```

Only hand-wire `task_failure` if you need an additional transport the APM
does not cover (Slack, PagerDuty, SMS). Gate it by severity so every
retry-exhaustion does not page, and keep the handler side-effect-free
(no DB writes) so it cannot itself fail the signal pipeline.

## Sub-Skills Index

| Sub-Skill          | File Path                      | When to Consult                                     |
|--------------------|--------------------------------|-----------------------------------------------------|
| Backoff Strategies | ../celery-retry-backoff-strategies/SKILL.md | Choosing linear, exponential, or jitter formula   |
| Dead-Letter Queue  | ../celery-retry-dead-letter-queue/SKILL.md  | Routing exhausted tasks for manual inspection     |

## Anti-Patterns to Avoid

- **Retrying on every exception**: `autoretry_for=(Exception,)` will retry
  `ValueError`, `KeyError`, and other permanent errors forever. Always be
  explicit about which exception types are transient.
- **Fixed retry delay**: `default_retry_delay=30` for all retries causes
  thundering herds after outages. Use `compute_backoff()` from `shared/backoff` with jitter.
- **Silent `on_failure`**: Not updating the DB record status in `on_failure`
  leaves jobs stuck in `RUNNING` forever, confusing operators and clients.
- **`max_retries=None`**: Unlimited retries can fill the broker queue. Always
  set an explicit upper bound; move exhausted tasks to a DLQ.
- **Not setting `acks_late=True`**: Default early-ack means a task message is
  removed from the queue before the task completes. If the worker crashes, the
  message is lost. Use `acks_late=True` for important tasks.

## Django/DRF Integration Notes

- Add a `task_id` field to job/status models so the polling endpoint can look
  up both the Celery result and the DB record in one view.
- Use `update_fields=["status", "error_message"]` in `on_failure` to avoid
  overwriting other fields on the model.
- Set `CELERY_TASK_REJECT_ON_WORKER_LOST = True` alongside `acks_late=True` to
  re-queue messages if a worker is killed mid-execution.
- For `autoretry_for`, import only your own exception classes to keep the
  exception taxonomy explicit and avoid catching unexpected errors.

## Checklist

- [ ] Transient and permanent exception types are explicitly classified
- [ ] Exponential backoff with jitter applied via `shared.backoff.compute_backoff()`
- [ ] `max_retries` has a finite value on every task with `autoretry_for`
- [ ] `on_failure` callback updates DB record status to FAILED
- [ ] `on_failure` logs error with `logger.error()` including context
- [ ] Polling endpoint returns error detail when `celery_result.failed()`
- [ ] `acks_late=True` set on tasks that must not be lost on worker crash
- [ ] Dead-letter queue configured for tasks that exhaust retries
