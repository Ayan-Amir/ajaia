# Patterns

## Parse defensively

- Branch on `event.data` type before decoding.
- Treat every payload as untrusted until it passes a schema, type guard, or equivalent validation step.
- Keep parse failure local to the message so one bad payload does not poison the socket runtime.

## Use a stable envelope

- Prefer a small envelope with `type`, `payload`, and optional ids, timestamps, versions, or sequence numbers.
- Keep unknown or future event types non-fatal so clients can fail safely during rolling deploys.

## Update UI carefully

- Route messages to narrow handlers rather than one giant mutable branch.
- Batch or coalesce bursty updates so state changes do not thrash layout or render loops.
- Keep event failures observable without logging sensitive payload details in production.

## Handle slow or bursty clients

- Decide whether non-critical events should be dropped, coalesced, or deferred.
- Use application-level resync when ordering gaps or backpressure mean the local state may be stale.
