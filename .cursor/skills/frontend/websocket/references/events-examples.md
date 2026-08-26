# Examples

## Typed envelope parsing

```javascript
function parseServerMessage(raw) {
  if (typeof raw !== "string") return { ok: false, error: "non-text" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid-json" };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, error: "not-object" };
  if (typeof parsed.type !== "string") return { ok: false, error: "missing-type" };
  return { ok: true, value: parsed };
}
```

## Router map with isolated handler failure

```javascript
const handlers = {
  "chat.message": (payload) => {
    /* update messages */
  },
  "presence.update": (payload) => {
    /* update roster */
  },
};

function onMessage(event) {
  const result = parseServerMessage(event.data);
  if (!result.ok) return;

  const { type, payload } = result.value;
  const run = handlers[type];
  if (!run) return;

  try {
    run(payload);
  } catch (err) {
    console.error("handler failed", type, err);
  }
}
```

## Dedupe by sequence id

```javascript
let lastSeq = -1;

function onOrderedMessage(envelope) {
  const seq = envelope.seq;
  if (typeof seq !== "number") {
    apply(envelope);
    return;
  }
  if (seq <= lastSeq) return;
  if (seq !== lastSeq + 1 && lastSeq !== -1) {
    /* optional: request resync from server */
  }
  lastSeq = seq;
  apply(envelope);
}
```

## Batch bursty UI updates

```javascript
let pending = null;
let scheduled = false;

function scheduleFlush(applyState) {
  pending = applyState;
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    const fn = pending;
    pending = null;
    fn?.();
  });
}
```

## Decode Blob payloads

```javascript
socket.addEventListener("message", async (event) => {
  if (event.data instanceof Blob) {
    const text = await event.data.text();
    onMessage({ ...event, data: text });
    return;
  }
  onMessage(event);
});
```
