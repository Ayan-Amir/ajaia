# Decisions

## Unknown-event policy

| Situation | Prefer |
| --- | --- |
| Rolling deploys or version skew are possible | Ignore unknown events and log a safe metric |
| Unknown event means the UI is now stale | Trigger a resync path instead of throwing |
| The event is security-critical | Fail closed and surface a controlled error path |

## Ordering strategy

- Use sequence numbers or ids when the server can reorder or duplicate events.
- If strict order matters, detect gaps and request a resync instead of guessing.
- If order does not matter, prefer idempotent handlers that can safely process duplicates.

## Backpressure strategy

- Drop non-critical events when freshness matters more than completeness.
- Coalesce to the latest state for ticker-like streams or rapidly changing counters.
- Defer heavy decoding or transformation work off the hot path when large payloads arrive.
