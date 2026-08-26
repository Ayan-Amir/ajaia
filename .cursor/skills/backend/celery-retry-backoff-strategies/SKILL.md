---
name: celery-retry-backoff-strategies
description: >
  Apply when choosing a retry delay formula for a Celery task. Implements
  linear, exponential, and decorrelated jitter strategies to space out retries
  and avoid thundering herds when many workers retry after a shared outage.
  Always cap the maximum delay.
---

# Backoff Strategies

## Purpose

Apply this sub-skill when choosing a retry delay formula for a Celery task.
The goal is to space out retries enough for a failing external service to
recover while avoiding thundering herds — the scenario where many workers retry
simultaneously after a shared outage, overwhelming the recovering service.
Three main strategies exist: linear, exponential, and decorrelated jitter.

## Implementation Pattern

1. **Linear backoff**: fixed increment per retry (`base * retries`). Simple
   but can still cause herd effects at high concurrency.
2. **Exponential backoff**: doubles with each retry (`base ** retries`). Good
   isolation per worker but synchronised workers produce bursts.
3. **Full jitter** (recommended for most cases): randomise in `[0, 2^retries]`.
   Smooths retry load across the time window.
4. **Decorrelated jitter** (best for high-concurrency): `sleep = min(cap,
   random.uniform(base, prev_sleep * 3))`. Produces a wider spread than full
   jitter.
5. **Cap the maximum delay**: always clamp to a max value (e.g., 600 s) to
   prevent retries from being delayed by hours.
6. **Apply via `self.retry(countdown=backoff)`** to pass the computed delay to
   Celery's scheduler.

## Code Example

```python
# shared/backoff.py
import random
import logging

logger = logging.getLogger(__name__)

# Never wait more than 10 minutes between retries
_MAX_BACKOFF_SECONDS = 600
_BASE_DELAY_SECONDS = 1


def linear_backoff(retry_count: int, increment: float = 30.0) -> float:
    """Return a linearly increasing delay.

    Args:
        retry_count: Current retry number (0-based).
        increment: Seconds to add per retry.

    Returns:
        Delay in seconds.
    """
    return min(increment * (retry_count + 1), _MAX_BACKOFF_SECONDS)


def exponential_backoff(retry_count: int) -> float:
    """Return exponential delay without jitter (deterministic).

    Use only when workers are isolated and concurrency is low.

    Args:
        retry_count: Current retry number (0-based).

    Returns:
        Delay in seconds.
    """
    return min(2 ** retry_count, _MAX_BACKOFF_SECONDS)


def full_jitter_backoff(retry_count: int) -> float:
    """Return exponential backoff with full jitter (recommended default).

    Distributes retries uniformly across [0, 2^retries], preventing
    thundering herds in high-concurrency worker pools.

    Args:
        retry_count: Current retry number (0-based).

    Returns:
        Delay in seconds.
    """
    ceiling = min(2 ** retry_count, _MAX_BACKOFF_SECONDS)
    jitter = random.uniform(0, ceiling)
    logger.debug(
        "Computed full jitter backoff",
        extra={"retry_count": retry_count, "delay_seconds": jitter},
    )
    return jitter


def decorrelated_jitter_backoff(
    retry_count: int,
    previous_sleep: float = _BASE_DELAY_SECONDS,
) -> float:
    """Return decorrelated jitter backoff (best for high concurrency).

    Based on the AWS architecture blog formula:
    sleep = min(cap, random.uniform(base, prev_sleep * 3))

    Args:
        retry_count: Current retry number (0-based, unused directly but
            kept for API consistency with other strategies).
        previous_sleep: The delay used on the last retry attempt.

    Returns:
        Delay in seconds.
    """
    new_sleep = min(
        _MAX_BACKOFF_SECONDS,
        random.uniform(_BASE_DELAY_SECONDS, previous_sleep * 3),
    )
    logger.debug(
        "Computed decorrelated jitter backoff",
        extra={
            "retry_count": retry_count,
            "previous_sleep": previous_sleep,
            "new_sleep": new_sleep,
        },
    )
    return new_sleep
```

```python
# integrations/tasks.py  (applying backoff strategies)
import logging

from celery import shared_task

from integrations.exceptions import RateLimitError, TransientAPIError
from integrations.services import call_external_api
from shared.backoff import full_jitter_backoff

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="integrations.api_call", max_retries=6)
def api_call_task(self, resource_pk: int) -> dict:
    """Call an external API with full-jitter exponential backoff on failure.

    Args:
        resource_pk: PK of the resource to sync with the external API.

    Returns:
        API response dict on success.
    """
    from integrations.models import Resource

    resource = Resource.objects.get(pk=resource_pk)

    try:
        return call_external_api(resource)
    except (TransientAPIError, RateLimitError) as transient_error:
        countdown = full_jitter_backoff(self.request.retries)
        logger.warning(
            "Transient API error; retrying with backoff",
            extra={
                "task_id": self.request.id,
                "resource_pk": resource_pk,
                "retry_number": self.request.retries,
                "countdown_seconds": countdown,
                "error": str(transient_error),
            },
        )
        raise self.retry(exc=transient_error, countdown=countdown)
```

## Pitfalls

- **No maximum cap**: Without capping, `2 ** 20` is over 12 days. Always clamp
  to a sensible maximum (300–600 s for most APIs).
- **Using `default_retry_delay` without backoff**: `default_retry_delay` is a
  fixed value applied to all retries. It ignores retry count. Use
  `self.retry(countdown=...)` with a backoff function for progressive delays.
- **Ignoring jitter at scale**: If 100 workers all fail on the same request and
  retry with pure exponential backoff, they all retry at the same second. Full
  jitter is the minimum safety net.

## See Also

- Parent skill: `../../celery-retry-failure/SKILL.md`
- Dead-letter queue for tasks that exhaust retries: `../dead-letter-queue/SKILL.md`
- Alerting on final failure: see "Alerting on Permanent Failure" in
  `../../celery-retry-failure/SKILL.md`
