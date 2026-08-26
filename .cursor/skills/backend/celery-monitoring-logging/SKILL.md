---
name: celery-monitoring-logging
description: >
  Apply this skill whenever you are adding observability to Celery workers and
  tasks — including structured JSON logging, correlation ID propagation from
  DRF requests into async tasks, Celery lifecycle signals, NewRelic APM, or
  worker health-check commands. Trigger on keywords: task logging, structured
  logs, correlation ID, task_prerun, task_postrun, task_failure signal, NewRelic,
  worker health, queue depth, celery inspect, python-json-logger.
---

# Celery Monitoring and Logging

## When to Use This Skill
- You are adding or improving logging inside Celery tasks and need JSON output
  compatible with log aggregation services (Datadog, ELK, CloudWatch).
- You need to trace a request from its DRF entry point through one or more
  async Celery tasks using a shared correlation ID.
- You are wiring Celery lifecycle signals (`task_prerun`, `task_postrun`,
  `task_failure`) to emit structured events.
- You need APM metrics for task duration, retry count, or failure rate (NewRelic).
- You need a Django management command to verify worker health and queue depth.

## Core Concepts

**Structured JSON logging** replaces human-readable log lines with
machine-parseable JSON objects. Each log record includes standard fields
(`timestamp`, `level`, `logger`, `message`) plus task-specific context fields
(`task_id`, `task_name`, `user_id`, `correlation_id`). The `python-json-logger`
library (package: `python-json-logger`) wraps Python's standard `logging`
module with a `JsonFormatter` and requires only a `settings.py` change to the
`LOGGING` dict.

**Correlation IDs** solve the problem of tracing a user action through
multiple services and async hops. A DRF middleware generates or reads an
`X-Correlation-ID` header, stores it in `threading.local()`, and a custom
Celery task base class reads it from thread-local storage and injects it into
the task's `headers` dict when calling `.apply_async()`. Inside the worker,
the `task_prerun` signal reads the header back and stores it in thread-local
storage again so all log statements within the task include the same ID.

**Celery signals** are the correct hook for cross-cutting concerns like logging
task lifecycle events or triggering alerts. The signals `task_prerun`,
`task_postrun`, `task_retry`, and `task_failure` cover the full task lifecycle.
Wire them in `AppConfig.ready()` to ensure they are registered before any task
runs.

**NewRelic APM** provides task metrics (duration, retry count, failure rate)
automatically via the NewRelic Python agent. Install `newrelic` and configure
`NEW_RELIC_LICENSE_KEY`; the agent instruments Celery workers without manual
counters or histograms.

A **health-check management command** is the operational tool operators and
orchestration systems use to verify that Celery workers are alive and queues
are not backing up. It calls `celery_app.control.inspect().ping()` to verify
worker responsiveness and queries Redis directly for queue lengths. The command
exits with a non-zero code if health checks fail, making it suitable for use
in Kubernetes liveness probes.

## Decision Framework

1. Are task log lines currently unstructured (plain text)?
   - **Yes** — configure `python-json-logger` in `LOGGING` (see
     example below).

2. Is it hard to trace a user request through async task logs?
   - **Yes** — implement correlation ID middleware and task header propagation.

3. Are you missing visibility into task lifecycle (start, complete, fail)?
   - **Yes** — wire `task_prerun`, `task_postrun`, `task_failure` signals in
     `AppConfig.ready()` (see example below).

4. Do you need time-series metrics for task performance and failure rates?
   - **Yes** — use an APM that auto-instruments Celery (NewRelic, Datadog,
     Sentry performance). If the project already exposes a Django `/health/`
     (or similar) endpoint, prefer extending it with a Celery ping rather
     than writing a bespoke `check_celery_health` management command.

## Code Examples

```python
# project/settings.py  (structured JSON logging configuration)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            # Fields included in every log record automatically
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "celery": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}
```

```python
# shared/middleware.py  (correlation ID DRF middleware)
import threading
import uuid
import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

# Thread-local storage for the correlation ID
_local = threading.local()

_CORRELATION_ID_HEADER = "HTTP_X_CORRELATION_ID"
_RESPONSE_HEADER = "X-Correlation-ID"


def get_correlation_id() -> str:
    """Return the current thread's correlation ID, or empty string.

    Returns:
        Correlation ID string set by the middleware for this request.
    """
    return getattr(_local, "correlation_id", "")


def set_correlation_id(correlation_id: str) -> None:
    """Set the correlation ID for the current thread.

    Args:
        correlation_id: ID string to associate with this thread.
    """
    _local.correlation_id = correlation_id


class CorrelationIDMiddleware(MiddlewareMixin):
    """DRF middleware that reads or generates a correlation ID per request.

    Stores the ID in thread-local storage so it can be injected into
    Celery task headers when tasks are dispatched from this request.
    """

    def process_request(self, request: object) -> None:
        """Extract or generate a correlation ID for this request.

        Args:
            request: Django HTTP request object.
        """
        incoming_id = getattr(request, "META", {}).get(_CORRELATION_ID_HEADER, "")
        correlation_id = incoming_id or str(uuid.uuid4())
        set_correlation_id(correlation_id)
        logger.debug(
            "Correlation ID set",
            extra={"correlation_id": correlation_id},
        )

    def process_response(self, request: object, response: object) -> object:
        """Echo the correlation ID back in the response header.

        Args:
            request: Django HTTP request object.
            response: Django HTTP response object.

        Returns:
            The response object with correlation ID header added.
        """
        correlation_id = get_correlation_id()
        if correlation_id:
            response[_RESPONSE_HEADER] = correlation_id
        return response
```

```python
# shared/celery_base.py  (custom task base class for correlation ID propagation)
import logging

from celery import Task

from shared.middleware import get_correlation_id

logger = logging.getLogger(__name__)

_HEADER_KEY = "x_correlation_id"


class CorrelatedTask(Task):
    """Celery Task subclass that injects the correlation ID into task headers.

    Use as the base class for tasks that should carry the correlation ID
    from the request that dispatched them:

        @shared_task(bind=True, base=CorrelatedTask, name="myapp.my_task")
        def my_task(self, ...): ...
    """

    def apply_async(self, args=None, kwargs=None, **options):
        """Inject correlation ID into task headers before dispatch.

        Args:
            args: Positional task arguments.
            kwargs: Keyword task arguments.
            **options: Additional apply_async options passed through.

        Returns:
            AsyncResult from the parent apply_async call.
        """
        correlation_id = get_correlation_id()
        if correlation_id:
            headers = options.get("headers") or {}
            headers[_HEADER_KEY] = correlation_id
            options["headers"] = headers
        return super().apply_async(args=args, kwargs=kwargs, **options)
```

```python
# shared/celery_signals.py  (full lifecycle signal module)
import logging
import time
import threading

from celery.signals import task_failure, task_postrun, task_prerun, task_retry

logger = logging.getLogger(__name__)

_local = threading.local()
_HEADER_KEY = "x_correlation_id"


def _on_task_prerun(
    sender: object,
    task_id: str,
    task: object,
    args: list,
    kwargs: dict,
    **signal_kwargs: object,
) -> None:
    """Log task start; extract and store correlation ID from task headers.

    Args:
        sender: Task class.
        task_id: Celery task ID.
        task: Task instance.
        args: Positional task arguments.
        kwargs: Keyword task arguments.
        **signal_kwargs: Extra signal keyword arguments.
    """
    correlation_id = (task.request.headers or {}).get(_HEADER_KEY, "")
    _local.correlation_id = correlation_id
    _local.task_start_time = time.monotonic()

    logger.info(
        "Task started",
        extra={
            "task_id": task_id,
            "task_name": getattr(sender, "name", "unknown"),
            "correlation_id": correlation_id,
        },
    )


def _on_task_postrun(
    sender: object,
    task_id: str,
    task: object,
    args: list,
    kwargs: dict,
    retval: object,
    state: str,
    **signal_kwargs: object,
) -> None:
    """Log task completion with duration.

    Args:
        sender: Task class.
        task_id: Celery task ID.
        task: Task instance.
        args: Positional task arguments.
        kwargs: Keyword task arguments.
        retval: Task return value.
        state: Final task state string (e.g., "SUCCESS").
        **signal_kwargs: Extra signal keyword arguments.
    """
    start_time = getattr(_local, "task_start_time", None)
    duration_ms = (
        round((time.monotonic() - start_time) * 1000) if start_time else None
    )

    logger.info(
        "Task completed",
        extra={
            "task_id": task_id,
            "task_name": getattr(sender, "name", "unknown"),
            "state": state,
            "duration_ms": duration_ms,
            "correlation_id": getattr(_local, "correlation_id", ""),
        },
    )


def _on_task_failure(
    sender: object,
    task_id: str,
    exception: Exception,
    args: list,
    kwargs: dict,
    traceback: object,
    einfo: object,
    **signal_kwargs: object,
) -> None:
    """Log permanent task failure with exception details.

    Args:
        sender: Task class.
        task_id: Celery task ID.
        exception: Exception that caused failure.
        args: Positional task arguments.
        kwargs: Keyword task arguments.
        traceback: Traceback object.
        einfo: Celery ExceptionInfo wrapper.
        **signal_kwargs: Extra signal keyword arguments.
    """
    logger.error(
        "Task permanently failed",
        extra={
            "task_id": task_id,
            "task_name": getattr(sender, "name", "unknown"),
            "exception_class": type(exception).__name__,
            "exception_message": str(exception),
            "correlation_id": getattr(_local, "correlation_id", ""),
        },
    )


def connect_signals() -> None:
    """Register all task lifecycle signal handlers.

    Call from AppConfig.ready() to ensure registration before tasks run.
    """
    task_prerun.connect(_on_task_prerun)
    task_postrun.connect(_on_task_postrun)
    task_failure.connect(_on_task_failure)
    logger.info("Celery monitoring signal handlers connected.")
```

```python
# shared/apps.py
from django.apps import AppConfig


class SharedConfig(AppConfig):
    """AppConfig for the shared utility application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "shared"

    def ready(self) -> None:
        """Wire signal handlers on startup."""
        from shared.celery_signals import connect_signals

        connect_signals()
```

```python
# project/settings.py  (NewRelic APM for Celery)
# Install: pip install newrelic
# Set NEW_RELIC_LICENSE_KEY in environment
# NewRelic auto-instruments Celery workers; no manual metrics needed
```

## Sub-Skills Index

All the detail needed for structured logging, signal wiring, and health
checks lives in this parent skill above — there are no separate sub-skills
for this topic. Worker liveness and queue-depth monitoring are handled by
APM (NewRelic/Sentry) and the project's existing health endpoint; do not reinvent.

## Anti-Patterns to Avoid

- **Plain-text log formatting in production**: Unstructured logs cannot be
  parsed by log aggregation tools. Always use `JsonFormatter` in production.
- **Logging inside task body instead of signals**: Duplicates instrumentation
  across every task. Use signals for cross-cutting logging; keep task bodies
  focused on business logic.
- **Generating a new correlation ID inside the worker**: The correlation ID
  must travel from the originating HTTP request. Generating a fresh one in the
  worker breaks the trace chain. Always propagate via task headers.
- **Skipping APM configuration**: NewRelic (or similar) provides visibility
  into task performance and failures without manual instrumentation.
- **Using `print()` instead of `logger`**: `print()` bypasses the logging
  framework entirely and is invisible to log aggregation. Always use the module
  logger.

## Django/DRF Integration Notes

- Add `CorrelationIDMiddleware` to `MIDDLEWARE` before `SessionMiddleware` so
  it runs on every request including unauthenticated ones.
- Install `python-json-logger` (`pip install python-json-logger`) and
  `newrelic` (`pip install newrelic`) in requirements.
- For Kubernetes deployments, wire the management command `check_celery_health`
  as a liveness probe: exit code 0 = healthy, non-zero = unhealthy.
- `CELERY_TASK_TRACK_STARTED = True` is required so that `task_prerun` fires
  before the task result is stored, giving accurate `STARTED` state in the
  result backend.

## Checklist

- [ ] `python-json-logger` configured in `LOGGING` with `JsonFormatter`
- [ ] `CorrelationIDMiddleware` added to `MIDDLEWARE` in settings
- [ ] `CorrelatedTask` used as base class for all tasks that need tracing
- [ ] `task_prerun`, `task_postrun`, `task_failure` signals wired in `AppConfig.ready()`
- [ ] NewRelic APM configured (`newrelic-admin run-program` or `NEW_RELIC_APP_NAME` in env)
- [ ] All log calls use `extra={}` dict for structured context fields
