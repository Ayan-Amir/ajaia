---
name: idempotency
description: >
  Apply (or audit against) this skill whenever you write or review code that
  mutates state — a Celery task, a DRF view, a service function, a signal
  handler, or a management command — to ensure running it twice produces the
  same result as running it once. Trigger on keywords: idempotent, duplicate,
  safe to re-run, retry-safe, replay, get_or_create, at-least-once, dedupe.
---

# Idempotency

Idempotency is not a Celery-only concern. Any code path that mutates state —
whether invoked by a DRF view, a service function, a signal handler, a Celery
task, or a management command — can be re-entered (user double-clicks, client
retries, broker redelivers, a `pre_save` signal re-fires). This skill teaches
how to design operations so that running them twice produces the same result
as running them once, and doubles as an audit checklist for PR review.

## When to Use This Skill
- You are writing any function that creates or updates a database record.
- You are reviewing code in a PR and need to verify it is safe to re-run.
- You are writing a Celery task, a DRF view, a management command, or a
  signal handler.
- You are calling an external API that may be retried on timeout.

## The 95% Rule

Almost every mutation we write is covered by two patterns. Reach for these
first; escalate only when they genuinely do not fit.

### Pattern 1 — `get_or_create` on a natural unique key

```python
# core/services.py
from core.models import UserProfile


def ensure_user_profile(user_id: int, display_name: str) -> UserProfile:
    """Create a profile if one does not already exist.

    Safe to re-run: repeated calls with the same ``user_id`` return the
    existing profile instead of creating a duplicate.
    """
    profile, _ = UserProfile.objects.get_or_create(
        user_id=user_id,                          # natural unique key
        defaults={"display_name": display_name},
    )
    return profile
```

The natural key is a business identifier that uniquely identifies the
logical operation — `email` on a User, `stripe_customer_id` on a Customer,
`external_reference` on a webhook event. **Enforce it at the DB level**
(`unique=True` or `UniqueConstraint`); application-level checks race under
concurrency.

### Pattern 2 — State-flag guard

```python
# core/tasks.py
from celery import shared_task

from core.models import Payment
from core.services import charge_payment_gateway


@shared_task(bind=True, name="core.charge_payment", max_retries=3)
def charge_payment_task(self, payment_pk: int) -> dict:
    """Charge a payment, guarded by a local state flag."""
    payment = Payment.objects.get(pk=payment_pk)

    if payment.is_charged:                        # inherent idempotency
        return {"payment_pk": payment_pk, "skipped": True}

    result = charge_payment_gateway(payment)

    payment.is_charged = True
    payment.transaction_id = result["transaction_id"]
    payment.save(update_fields=["is_charged", "transaction_id"])
    return {"payment_pk": payment_pk, "transaction_id": result["transaction_id"]}
```

The first successful run flips the flag; subsequent runs observe it and exit
cleanly. No dedup storage, no lock — correctness from the shape of the
operation.

## When `create()` or a Plain `update()` is Correct

`get_or_create` is the default when an operation might re-run. It is **not**
the right tool for every mutation. Prefer `.create()` / `.update()` when:

- **Append-only event / audit logs.** Each call is a distinct event; two
  calls legitimately mean two rows. No natural key applies.
- **Child rows under a de-duplicated parent.** If the parent is guarded,
  children under it can use `.create()` or `bulk_create()`.
- **One-shot bootstrap / data migrations / manually-run commands.** Document
  with a comment; rely on the execution contract.
- **Bulk ingestion with dedup enforced elsewhere** — e.g.
  `bulk_create(..., ignore_conflicts=True)` + a DB unique constraint.
- **Monotonic `.update()` writes** — `Order.objects.filter(pk=pk).update(is_exported=True)`
  converges to the same state on every run.
- **Caller already holds the idempotency boundary** — e.g. inside
  `transaction.atomic()` + `select_for_update()` + guard flag.

The rule is not "always use `get_or_create`". The rule is: **every mutation
must have a documented answer to "what if this runs twice?"** If the answer
is "two rows, and that is correct", add a one-line comment explaining why.

## Decision Framework

1. **Natural unique key exists?** → `get_or_create` / `update_or_create`.
2. **State transition on an existing record?** → state-flag guard.
3. **Append-only / monotonic / bulk with `ignore_conflicts`?** →
   `.create()` / `.update()` is correct; document intent.
4. **Calling an external API?** → send a stable `Idempotency-Key` header if
   the vendor supports it; see `../safe-external-calls/SKILL.md`.
5. **None of the above fit?** → escape hatch below (distributed lock).

## Escape Hatch: Distributed Lock (rarely needed)

Reach for this only when 1–4 above do not fit — typically, two
workers/requests that can legitimately hit the same logical operation
concurrently AND a single atomic DB statement cannot serialise them (e.g.
multi-step writes combined with an external call that must not happen
twice). Most services never need it.

Django's cache backend provides an atomic `cache.add`:

```python
# core/locking.py
from contextlib import contextmanager
from typing import Generator

from django.core.cache import cache


class LockNotAcquired(Exception):
    """Another caller holds the lock."""


@contextmanager
def acquire_lock(key: str, ttl_seconds: int) -> Generator[None, None, None]:
    """Atomic cache-backed lock. TTL must exceed expected operation duration."""
    # cache.add returns False if the key already exists — atomic, no race
    if not cache.add(key, "1", timeout=ttl_seconds):
        raise LockNotAcquired(key)
    try:
        yield
    finally:
        cache.delete(key)                         # release in finally — always
```

Rules: `CACHES` must be Redis/Memcached (not `LocMemCache`, which is
per-process); TTL must be ≥ 2× the operation's expected duration; always
release in `finally`.

## Audit Checklist (for code review)

- [ ] What happens if this runs twice with the same arguments?
- [ ] Is there a `.create()` that should be `.get_or_create()`? (Or is
      `.create()` intentional — append-only log, dedup elsewhere, inside a
      guarded critical section?)
- [ ] Is the natural unique key enforced at the DB level (`unique=True` /
      `UniqueConstraint`)?
- [ ] External API calls: gated by local state or an `Idempotency-Key`
      header (if the vendor supports it)?
- [ ] If a lock is used: released in `finally`; TTL ≥ 2× operation duration?

## Anti-Patterns to Avoid

- **`.create()` in a re-runnable path with a natural unique key.** Use
  `get_or_create`. The cases where `.create()` is correct are listed above.
- **Application-level "check then create"** without a DB unique constraint.
  Two concurrent callers both see "not exists"; both create.
- **Reaching for a lock before trying Patterns 1–2.** The lock is an
  escape hatch, not a default.

## Sub-Skills Index

| Sub-Skill            | File Path                                 | When to Consult                           |
|----------------------|-------------------------------------------|-------------------------------------------|
| Safe External Calls  | ../safe-external-calls/SKILL.md           | Making outbound HTTP calls retry-safe     |
