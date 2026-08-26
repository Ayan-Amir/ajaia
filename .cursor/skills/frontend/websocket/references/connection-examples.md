# Examples

## Open, heartbeat, and explicit cleanup

```javascript
function connectRealtime({ url, onMessage }) {
  const ws = new WebSocket(url);
  let heartbeat = null;
  let pongTimer = null;

  const clearTimers = () => {
    if (heartbeat) clearInterval(heartbeat);
    if (pongTimer) clearTimeout(pongTimer);
    heartbeat = pongTimer = null;
  };

  const dispose = () => {
    clearTimers();
    ws.removeEventListener("open", onOpen);
    ws.removeEventListener("message", onMessageWrapped);
    ws.removeEventListener("error", onError);
    ws.removeEventListener("close", onClose);
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, "client dispose");
    }
  };

  const send = (data) => {
    if (ws.readyState !== WebSocket.OPEN) return false;
    ws.send(typeof data === "string" ? data : JSON.stringify(data));
    return true;
  };

  function onOpen() {
    heartbeat = setInterval(() => {
      if (pongTimer) clearTimeout(pongTimer);
      send({ type: "ping", t: Date.now() });
      pongTimer = setTimeout(() => {
        ws.close(4000, "heartbeat timeout");
      }, 10_000);
    }, 25_000);
  }

  function onMessageWrapped(ev) {
    try {
      const msg = JSON.parse(ev.data);
      if (msg?.type === "pong" && pongTimer) clearTimeout(pongTimer);
    } catch {
      /* non-json heartbeats ignored */
    }
    onMessage(ev);
  }

  function onError() {
    /* prefer close details in onclose; avoid logging raw events in prod */
  }

  function onClose() {
    clearTimers();
  }

  ws.addEventListener("open", onOpen);
  ws.addEventListener("message", onMessageWrapped);
  ws.addEventListener("error", onError);
  ws.addEventListener("close", onClose);

  return { ws, send, dispose };
}
```

## Reconnect with backoff

```javascript
function connectWithBackoff(url, { shouldRetry, onSocket }) {
  let attempt = 0;
  let disposed = false;
  let socket = null;
  let retryTimer = null;

  const maxDelayMs = 30_000;

  const connect = () => {
    if (disposed) return;
    socket = new WebSocket(url);
    onSocket?.(socket);

    socket.addEventListener("close", () => {
      if (disposed || !shouldRetry?.()) return;
      const exp = Math.min(maxDelayMs, 1000 * 2 ** attempt++);
      const jitter = Math.floor(Math.random() * 500);
      retryTimer = setTimeout(connect, exp + jitter);
    });

    socket.addEventListener("open", () => {
      attempt = 0;
    });
  };

  connect();

  return () => {
    disposed = true;
    if (retryTimer) clearTimeout(retryTimer);
    socket?.close(1000, "client stopped");
  };
}
```
