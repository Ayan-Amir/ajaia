# Troubleshooting

## Duplicate sockets or listeners

- Check whether strict mode, fast refresh, or repeated mounts create more than one socket without cleanup.
- Make the connection owner explicit so only one feature path can instantiate the socket.

## Reconnect storm

- Verify the retry loop stops on auth failures and intentional closes.
- Confirm backoff resets only after a successful open, not after every failed attempt.

## Leaked timers or stale auth

- Clear heartbeat and retry timers on every close path.
- Re-check whether tokens or cookies expire while a reconnect loop keeps trying old credentials.

## Transport mismatch

- Confirm `wss` is used on HTTPS pages unless a reviewed local-development exception exists.
- Verify proxy, host, and path configuration match the server's accepted endpoint.
