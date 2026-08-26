# Troubleshooting

## Invalid JSON or decode mismatch

- Confirm the server is really sending the format the client expects.
- Check whether binary, Blob, or text payloads are being decoded in the wrong branch.

## Handler crashes kill useful updates

- Keep exceptions inside the per-message handler boundary so one event failure does not block later events.
- Add safe instrumentation without logging sensitive payload content.

## UI is stale or updates the wrong screen

- Check whether handlers still target mounted state after route changes.
- Verify duplicate or out-of-order events are being deduped or resynced correctly.

## Bursty traffic freezes the page

- Measure whether every message triggers a full render, toast, or layout recalculation.
- Batch, coalesce, or drop non-critical events before they reach the UI layer.
