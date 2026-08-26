---
name: celery-task-design-task-decomposition
description: >
  Apply when a single Celery task has grown too large to reason about, test,
  or retry independently. Uses chain for sequential steps, group for parallel
  work, and chord for aggregation. Improves retry granularity — failed
  sub-tasks retry without re-running completed steps.
---

# Task Decomposition

## Purpose

Apply this sub-skill when a single Celery task has grown too large to reason
about, test, or retry independently. A task should do one thing. When you
identify sequential dependencies between steps, use `chain`. When steps are
independent and can run concurrently, use `group`. When parallel work must be
aggregated before continuing, use `chord`. Decomposition also improves
retry granularity — a failed sub-task can be retried without re-running
already-completed steps.

## Implementation Pattern

1. **Identify step boundaries**: split the task body wherever the unit of work
   changes (e.g., fetch → transform → persist → notify).
2. **Check for data dependencies**: if step B needs the return value of step A,
   use `chain`; if steps are independent, use `group`.
3. **Check for aggregation**: if you must wait for all parallel steps before
   proceeding, wrap the `group` in a `chord` with a callback task.
4. **Ensure each step is idempotent**: decomposed tasks are retried
   independently; each must be safe to re-run.
5. **Pass only primitive data between tasks**: Celery pipes return values as
   the first positional argument to the next task in a chain. Ensure the
   type is JSON-serialisable (list, dict, int, str).

## Code Example

```python
# reports/tasks.py
from celery import chain, chord, group, shared_task

from reports.models import Report
from reports.services import (
    aggregate_report_data,
    fetch_raw_data,
    notify_report_ready,
)


@shared_task(bind=True, name="reports.fetch_raw_data")
def fetch_raw_data_task(self, report_pk: int) -> dict:
    """Fetch raw data required to build a report.

    Args:
        report_pk: PK of the Report instance.

    Returns:
        Raw data payload dict passed downstream via chain.
    """
    report = Report.objects.get(pk=report_pk)
    return fetch_raw_data(report)


@shared_task(bind=True, name="reports.build_section")
def build_section_task(self, raw_data: dict, section_name: str) -> dict:
    """Build a single report section from raw data.

    Args:
        raw_data: Output piped in from fetch_raw_data_task via chain.
        section_name: Which section of the report to build.

    Returns:
        Completed section dict.
    """
    from reports.services import build_section

    return build_section(raw_data, section_name)


@shared_task(bind=True, name="reports.aggregate_sections")
def aggregate_sections_task(self, sections: list, report_pk: int) -> int:
    """Aggregate all parallel section results into the final report.

    This is the chord callback — it receives the list of results from
    the group of build_section_task calls.

    Args:
        sections: List of section dicts collected by the chord.
        report_pk: PK to associate the completed report with.

    Returns:
        PK of the saved report.
    """
    return aggregate_report_data(sections, report_pk)


@shared_task(bind=True, name="reports.notify_ready")
def notify_ready_task(self, report_pk: int) -> None:
    """Send a notification that the report is ready.

    Args:
        report_pk: PK of the completed report.
    """
    notify_report_ready(report_pk)


# Pipeline composition: call from view or service with chain(...).apply_async()
# e.g. chain(fetch_raw_data_task.s(pk), chord(group(...), aggregate_sections_task.s(pk)), notify_ready_task.si(pk)).apply_async()
```

## Pitfalls

- **Giant chain result payloads**: If each step returns a large dict and chains
  are long, the broker stores all intermediate results in the result backend,
  consuming memory. Pass only the minimum data (e.g., a PK) and re-fetch in
  each step.
- **Chord with failing tasks**: If any task in a chord's group raises an
  exception, the chord callback is never called by default. Set
  `CELERY_CHORD_PROPAGATES = True` (default) and handle failures in the
  callback or via `on_failure`.
- **Deeply nested chains**: A chain of 10+ tasks is hard to debug. Prefer
  extracting a service layer and keeping the chain shallow (3–5 steps).
- **`.s()` vs `.si()` confusion**: `.si()` (immutable signature) ignores the
  result piped in from the previous chain step. Use `.si()` for notification or
  side-effect tasks that do not need upstream data.

## See Also

- Parent skill: `../../celery-task-design/SKILL.md`
- Task routing for assigning chord callbacks to specific queues:
  `../task-routing/SKILL.md`
- Serialisation rules for what to pipe between tasks: see the
  "Serialization safety" guidance in `../../celery-task-design/SKILL.md`
