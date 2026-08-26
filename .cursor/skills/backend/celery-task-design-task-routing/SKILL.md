---
name: celery-task-design-task-routing
description: >
  Apply when you need to direct tasks to specific Celery worker pools or
  queues. Isolates workloads (fast vs slow tasks), sets priority, and
  enables independent scaling. Uses CELERY_TASK_QUEUES, CELERY_TASK_ROUTES,
  and apply_async(queue=...) for one-off overrides.
---

# Task Routing

## Purpose

Apply this sub-skill when you need to direct tasks to specific Celery worker
pools or queues. Without explicit routing, all tasks share a single default
queue, causing slow tasks (file processing, report generation) to block fast
tasks (email, webhooks). Routing isolates workloads, sets priority, and enables
independent scaling of worker pools per queue.

## Implementation Pattern

1. **Define named queues** in `CELERY_TASK_QUEUES` using `Queue(name)` (Redis broker).
2. **Set default queue** via `CELERY_TASK_DEFAULT_QUEUE`.
3. **Map task names to queues** in `CELERY_TASK_ROUTES`.
4. **Start workers with `-Q` flag** to bind each worker process to its queue.
5. **Assign priorities** using separate named queues as priority tiers (Redis
   does not support native queue priorities).
6. **Use `apply_async(queue=...)` for one-off queue overrides** without
   changing the global route config.

## Code Example

```python
# project/settings.py  (Celery routing configuration with Redis broker)
CELERY_BROKER_URL = "redis://localhost:6379/0"

# Redis broker: queues are Redis lists; define with Queue(name) for routing
from kombu import Queue

CELERY_TASK_QUEUES = (
    Queue("default"),        # catch-all for unrouted tasks
    Queue("high_priority"),  # fast, user-facing tasks (email, webhooks)
    Queue("low_priority"),   # slow, batch tasks (reports, file processing)
    Queue("celery_beat"),    # scheduled/periodic tasks only
)

CELERY_TASK_DEFAULT_QUEUE = "default"

# Route by task name — keys are dotted task names, values are queue names
CELERY_TASK_ROUTES = {
    # High-priority: user-facing, must complete quickly
    "notifications.send_email": {"queue": "high_priority"},
    "notifications.send_webhook": {"queue": "high_priority"},

    # Low-priority: batch work, can afford queuing delay
    "uploads.process_file": {"queue": "low_priority"},
    "reports.fetch_raw_data": {"queue": "low_priority"},
    "reports.build_section": {"queue": "low_priority"},
    "reports.aggregate_sections": {"queue": "low_priority"},
    "reports.notify_ready": {"queue": "high_priority"},  # final step is fast

    # Scheduled tasks stay on their own queue
    "project.tasks.daily_cleanup": {"queue": "celery_beat"},
}

# Optional: limit concurrency per queue by running workers with -c flag
# Start workers per queue:
#   celery -A project worker -Q high_priority -c 8 --loglevel=info
#   celery -A project worker -Q low_priority -c 4 --loglevel=info
#   celery -A project worker -Q default -c 4 --loglevel=info
```

```python
# uploads/tasks.py  (per-call queue override with apply_async)
from celery import shared_task


@shared_task(bind=True, name="uploads.process_file")
def process_file_task(self, file_pk: int) -> dict:
    """Process an uploaded file.

    Args:
        file_pk: PK of the file to process.

    Returns:
        Processing result dict.
    """
    from uploads.services import run_file_processing
    from uploads.models import UploadedFile

    return run_file_processing(UploadedFile.objects.get(pk=file_pk))


# Callers override the default route with apply_async(queue="high_priority")
# e.g. process_file_task.apply_async(args=[file_pk], queue="high_priority")
```

```python
# project/settings.py  (rate limiting per task)

# Limit a specific task to 100 executions per minute across all workers
CELERY_TASK_ANNOTATIONS = {
    "notifications.send_email": {"rate_limit": "100/m"},
    "integrations.call_external_api": {"rate_limit": "50/m"},
}
```

## Pitfalls

- **All tasks on the default queue**: Slow tasks will delay fast tasks with no
  easy workaround other than re-routing. Define queue separation from day one.
- **Starting a worker without `-Q`**: A worker without a `-Q` flag consumes
  from all queues, defeating isolation. Always specify `-Q queue_name`.
- **Using priority with Redis broker**: Redis does not support native queue
  priorities. Use separate named queues as priority tiers instead.
- **Forgetting to update `CELERY_TASK_ROUTES` after renaming a task**: The
  old name will no longer match any route and tasks will fall to the default
  queue silently. Keep routes and task names in sync.

## See Also

- Parent skill: `../../celery-task-design/SKILL.md`
- Task decomposition for building pipelines that span multiple queues:
  `../task-decomposition/SKILL.md`
