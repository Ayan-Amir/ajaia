# Patterns

## Open the connection deliberately

- Build the WebSocket URL explicitly and align `ws` or `wss` with the page protocol and deployment rules.
- Pass subprotocols only when the server contract expects them.
- Keep auth handoff short-lived and scoped to the connection model the backend actually supports.

## While connected

- Register connection listeners once per socket instance.
- Guard sends by `readyState` and choose whether to queue, retry, or drop non-sendable messages according to product rules.
- If the server expects heartbeats, start the interval only after open and stop it on close.

## Close and clean up

- Close intentionally when the feature unmounts, the route no longer needs the socket, or the user logs out.
- Clear timers, remove listeners, and stop retry loops on every terminal path.
- Reconnect only when the closure was unintentional and the feature still wants live data.

## Page and tab lifecycle

- Decide whether page hide should pause heartbeats, close the socket, or do nothing.
- Reopen deliberately on page show when fresh data is required.
- Use a shared-connection strategy or backend policy when multiple tabs should not create competing sockets.
