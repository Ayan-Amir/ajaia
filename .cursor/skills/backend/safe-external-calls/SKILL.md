---
name: safe-external-calls
description: >
  Apply when a Celery task makes HTTP calls to external APIs (payment gateways,
  messaging services, webhooks) that may be executed more than once due to
  at-least-once delivery. Sends a stable Idempotency-Key header so the external
  service can deduplicate requests; treats HTTP 409 as success.
---

# Safe External Calls

## Purpose

Apply this sub-skill when a Celery task makes HTTP calls to external APIs
(payment gateways, messaging services, webhooks, data providers) that may
be executed more than once due to Celery's at-least-once delivery. The goal
is to send a stable `Idempotency-Key` header so the external service can
deduplicate requests on its end, and to prefer `PUT` over `POST` semantics
where the API supports it. This sub-skill assumes the task is already
protected by inherent idempotency (Pattern 1 or 2 in the parent skill) for
the local DB side.

## Implementation Pattern

**Check the vendor's API documentation first.** The `Idempotency-Key`
pattern only works if the external service honors the header — Stripe,
Adyen, and some modern APIs do; many older or in-house APIs do not. If the
vendor does not support idempotency keys, the header is ignored and you get
no protection from it. In that case fall back to pre-call deduplication
via a local state check (Pattern 2 in the parent skill) so a retry never
makes the call twice in the first place.

Once you have confirmed vendor support:

1. **Derive a stable idempotency key** from task-specific inputs using SHA-256.
   The same task arguments must always produce the same key.
2. **Pass the key as `Idempotency-Key: <key>` header** on every HTTP request.
3. **Prefer `PUT` or `PATCH`** over `POST` when the API supports it, as PUT is
   semantically idempotent (repeated calls with the same body yield the same
   result).
4. **Treat HTTP 2xx and HTTP 409 (Conflict / duplicate)** as success — a 409
   means the external service already processed this key.
5. **Do not generate a new key on retry** — the same logical operation must
   always use the same key so the external service can deduplicate.

## Code Example

```python
# core/http.py  (idempotent HTTP client helper)
import hashlib
import logging
from typing import Any

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

_DEFAULT_TIMEOUT_SECONDS = 10


def build_idempotency_key(*parts: Any) -> str:
    """Derive a deterministic idempotency key from arbitrary inputs.

    The same inputs always produce the same key, making this safe to call
    on every retry without changing the key.

    Args:
        *parts: Values joined with '|' and hashed via SHA-256.

    Returns:
        64-character hex digest string.
    """
    raw = "|".join(str(part) for part in parts)
    return hashlib.sha256(raw.encode()).hexdigest()


def post_idempotent(
    url: str,
    json_body: dict,
    idempotency_key: str,
    extra_headers: dict | None = None,
    timeout: float = _DEFAULT_TIMEOUT_SECONDS,
) -> httpx.Response:
    """POST to an external API with an Idempotency-Key header.

    Treats HTTP 409 as a success (duplicate request already processed).

    Args:
        url: Full URL of the external API endpoint.
        json_body: JSON-serialisable request body dict.
        idempotency_key: Stable key for this logical operation.
        extra_headers: Optional additional headers to include.
        timeout: Request timeout in seconds.

    Returns:
        httpx.Response object.

    Raises:
        httpx.HTTPStatusError: For 4xx/5xx responses other than 409.
        httpx.TimeoutException: If the request exceeds the timeout.
    """
    headers = {
        "Idempotency-Key": idempotency_key,
        "Content-Type": "application/json",
        **(extra_headers or {}),
    }

    logger.debug(
        "Making idempotent POST request",
        extra={"url": url, "idempotency_key": idempotency_key},
    )

    response = httpx.post(url, json=json_body, headers=headers, timeout=timeout)

    # 409 Conflict means the external service already processed this key;
    # treat it as success to allow clean task completion on retry
    if response.status_code == 409:
        logger.info(
            "Idempotent duplicate detected by external service",
            extra={"url": url, "idempotency_key": idempotency_key},
        )
        return response

    response.raise_for_status()
    return response
```

```python
# payments/tasks.py  (safe external charge call with idempotency key)
import logging

from celery import shared_task

from payments.models import Payment
from core.http import build_idempotency_key, post_idempotent
from core.locking import LockNotAcquiredError, acquire_task_lock

logger = logging.getLogger(__name__)

_CHARGE_API_URL = "https://api.paymentprovider.example.com/v1/charges"


@shared_task(
    bind=True,
    name="payments.charge_card",
    max_retries=4,
    acks_late=True,
)
def charge_card_task(self, payment_pk: int) -> dict:
    """Charge a card via the external payment gateway idempotently.

    Uses a stable Idempotency-Key so repeated calls caused by retries or
    redelivery do not create duplicate charges.

    Args:
        payment_pk: PK of the Payment record to charge.

    Returns:
        Dict with transaction_id and status from the gateway.
    """
    from core.backoff import full_jitter_backoff

    lock_key = f"charge_card:{payment_pk}"

    try:
        with acquire_task_lock(lock_key, timeout_seconds=480):
            payment = Payment.objects.get(pk=payment_pk)

            if payment.transaction_id:
                logger.info(
                    "Payment already charged; skipping",
                    extra={"task_id": self.request.id, "payment_pk": payment_pk},
                )
                return {"transaction_id": payment.transaction_id, "skipped": True}

            # Key is stable: same payment_pk always produces the same key
            idempotency_key = build_idempotency_key(
                "charge_card", payment_pk, str(payment.amount)
            )

            try:
                response = post_idempotent(
                    url=_CHARGE_API_URL,
                    json_body={
                        "amount": str(payment.amount),
                        "currency": payment.currency,
                        "card_token": payment.card_token,
                    },
                    idempotency_key=idempotency_key,
                )
            except Exception as http_error:
                # Transient network/gateway errors → retry with backoff
                countdown = full_jitter_backoff(self.request.retries)
                logger.warning(
                    "Gateway call failed; retrying",
                    extra={
                        "task_id": self.request.id,
                        "payment_pk": payment_pk,
                        "countdown_seconds": countdown,
                        "error": str(http_error),
                    },
                )
                raise self.retry(exc=http_error, countdown=countdown)

            response_data = response.json()
            payment.transaction_id = response_data["transaction_id"]
            payment.status = "charged"
            payment.save(update_fields=["transaction_id", "status"])

            logger.info(
                "Card charged successfully",
                extra={
                    "task_id": self.request.id,
                    "payment_pk": payment_pk,
                    "transaction_id": payment.transaction_id,
                },
            )
            return response_data

    except LockNotAcquiredError:
        logger.info(
            "Duplicate charge task skipped",
            extra={"task_id": self.request.id, "payment_pk": payment_pk},
        )
        return {"payment_pk": payment_pk, "skipped": True}
```

## Pitfalls

- **Generating a new key on each retry**: If the idempotency key changes per
  retry attempt (e.g., using `uuid.uuid4()`), the external service sees each
  retry as a new request and charges the card multiple times. Always derive the
  key from stable inputs.
- **Ignoring HTTP 409**: Some external APIs return 409 when they detect a
  duplicate. Treating this as an error causes infinite retries on what is
  actually a successful operation.
- **Using POST when PUT is available**: Many REST APIs support PUT with a
  client-supplied resource ID. PUT is idempotent by definition; prefer it over
  POST whenever the API supports it.
- **Short timeout causing spurious retries**: If the HTTP timeout fires before
  the external API responds, the task retries with the same idempotency key —
  which is correct. But if the timeout is too short (< 3 s), false timeouts
  generate excessive retries. Use 10 s as a default minimum.

## See Also

- Parent skill: `../idempotency/SKILL.md`
- Retry backoff when gateway calls fail:
  `../celery-retry-backoff-strategies/SKILL.md`
