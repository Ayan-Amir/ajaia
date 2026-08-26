# Decisions

## Auth handoff

| Situation | Prefer |
| --- | --- |
| Same-site app with session cookies | Cookie-backed auth |
| Backend requires a token at connect time | Short-lived token in query or protocol if the server contract supports it |
| Backend supports post-connect auth message | Authenticate immediately after open and expire fast on failure |

## Retry policy

- Retry only when the feature still needs live data and the close reason was not intentional.
- Use exponential backoff with jitter to avoid retry storms.
- Stop retrying after auth failure, logout, or explicit user opt-out.

## Shared connection strategy

- Keep one owner per logical channel when duplicate sockets would amplify load or duplicate messages.
- Use a shared browser-tab coordination strategy only when the product truly benefits from a singleton connection.
