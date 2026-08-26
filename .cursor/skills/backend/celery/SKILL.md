---
name: celery
description: >
  Umbrella dispatcher for Celery work in a Django/DRF project — task design, retry/failure handling, and worker observability. Use when the request mentions Celery generally ("I'm working on Celery", "set up a Celery task", "review this Celery code") or when it's not yet clear which lifecycle stage applies. Trigger on keywords: Celery, async task, background job, worker, broker, queue, task_id, deferred processing, RabbitMQ, Redis broker. Once the task narrows to designing/dispatching, retrying/failing, or logging/monitoring, defer to the specific child skill listed below.
---

# Celery

Umbrella for the Celery skill family. Each entry below covers one lifecycle stage or refinement. Read this skill to pick the right one, then follow the linked SKILL.md.

## Routing Matrix

| Concern | Skill | Trigger |
|---------|-------|---------|
| Deciding whether work belongs in a task, choosing between `task`/`chain`/`chord`/`group`, wiring a DRF view to dispatch async work, passing args safely, dispatching after a DB transaction commits | [../celery-task-design/SKILL.md](../celery-task-design/SKILL.md) | "Should this be async?", "How do I trigger this from a view?", `.delay()`, `apply_async`, `task_id`, `202 Accepted` |
| Implementing retries, exponential backoff with jitter, `max_retries`, `autoretry_for`, `on_failure` callbacks, routing exhausted tasks to a dead-letter queue | [../celery-retry-failure/SKILL.md](../celery-retry-failure/SKILL.md) | `self.retry`, `MaxRetriesExceededError`, transient errors, rate-limit handling, DLQ |
| Structured JSON logs from workers, correlation IDs across the request → task boundary, Celery signals, NewRelic APM, queue-depth and worker health monitoring | [../celery-monitoring-logging/SKILL.md](../celery-monitoring-logging/SKILL.md) | `task_prerun`, `task_postrun`, `task_failure`, correlation ID, NewRelic, `celery inspect`, queue depth alerts |
| Picking linear vs exponential vs jitter formula for `self.retry` | [../celery-retry-backoff-strategies/SKILL.md](../celery-retry-backoff-strategies/SKILL.md) | `countdown=`, exponential backoff, jitter, retry interval |
| Routing exhausted tasks for manual inspection or replay | [../celery-retry-dead-letter-queue/SKILL.md](../celery-retry-dead-letter-queue/SKILL.md) | DLQ, dead-letter, `on_failure`, manual replay |
| Splitting a large task into `chain` / `chord` / `group` | [../celery-task-design-task-decomposition/SKILL.md](../celery-task-design-task-decomposition/SKILL.md) | task chain, chord, group, fan-out, aggregation |
| Assigning tasks to dedicated queues or worker pools via `CELERY_TASK_ROUTES` | [../celery-task-design-task-routing/SKILL.md](../celery-task-design-task-routing/SKILL.md) | queue routing, worker pool, `CELERY_TASK_ROUTES`, priority queue |

## Cross-Domain References

- **Idempotency**: every task must be safe to re-run (broker redeliveries, manual replays, retries). See [../idempotency/SKILL.md](../idempotency/SKILL.md) for the 95% rule and audit checklist.
- **External calls inside tasks**: see [../safe-external-calls/SKILL.md](../safe-external-calls/SKILL.md) before adding outbound HTTP calls to a task.
