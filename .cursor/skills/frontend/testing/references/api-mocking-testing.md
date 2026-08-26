# API Mocking — MSW v2

> **Setup:** If `src/tests/mocks/handlers.ts` and `src/tests/mocks/server.ts` don't exist yet, read `setup.md` first.

MSW intercepts HTTP requests at the **network level**. Components and hooks make real `fetch`/`axios` calls — MSW catches them before they leave Node and returns your mock responses.

**Never mock `fetch`, `axios`, `queryClient`, or individual query functions.** Only define what the API returns.

---

## Handler Patterns

```typescript
import { http, HttpResponse } from "msw";

// GET list
http.get("/api/users", () =>
  HttpResponse.json([{ id: "1", name: "Alice" }])
),

// GET with path param
http.get("/api/users/:id", ({ params }) => {
  if (params.id === "999") return HttpResponse.json({ message: "Not found" }, { status: 404 });
  return HttpResponse.json({ id: params.id, name: "Alice" });
}),

// GET with query string
http.get("/api/products", ({ request }) => {
  const url = new URL(request.url);
  const page  = Number(url.searchParams.get("page")  ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "10");
  return HttpResponse.json({ items: [], total: 0, page, limit });
}),

// POST — read body
http.post("/api/users", async ({ request }) => {
  const body = await request.json() as Record<string, unknown>;
  return HttpResponse.json({ id: "99", ...body }, { status: 201 });
}),

// PUT
http.put("/api/users/:id", async ({ params, request }) => {
  const body = await request.json() as Record<string, unknown>;
  return HttpResponse.json({ id: params.id, ...body });
}),

// DELETE
http.delete("/api/users/:id", () => new HttpResponse(null, { status: 204 })),
```

---

## Status Code Reference

```typescript
HttpResponse.json({ data: "ok" })                                  // 200
HttpResponse.json({ id: "1" }, { status: 201 })                    // 201 Created
new HttpResponse(null, { status: 204 })                            // 204 No Content
HttpResponse.json({ message: "Invalid" }, { status: 400 })         // 400 Bad Request
HttpResponse.json({ message: "Unauthorized" }, { status: 401 })    // 401
HttpResponse.json({ message: "Forbidden" }, { status: 403 })       // 403
HttpResponse.json({ message: "Not found" }, { status: 404 })       // 404
HttpResponse.json({ message: "Duplicate" }, { status: 409 })       // 409 Conflict
HttpResponse.json({ message: "Server error" }, { status: 500 })    // 500
HttpResponse.error()                                                // Network failure
```

---

## Per-Test Handler Overrides

Use `server.use()` inside a test to override one handler for that test only. `setup.ts` calls `server.resetHandlers()` in `afterEach` — you don't need to clean up yourself.

```typescript
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";

it("shows error state when API returns 500", async () => {
  server.use(
    http.get("/api/users", () =>
      HttpResponse.json({ message: "Internal server error" }, { status: 500 })
    )
  );
  render(<UserList />);
  await waitFor(() =>
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  );
});

it("shows empty state when API returns empty array", async () => {
  server.use(http.get("/api/users", () => HttpResponse.json([])));
  render(<UserList />);
  expect(await screen.findByText(/no users/i)).toBeInTheDocument();
});
```

---

## Simulating Network Delay (Loading States)

```typescript
import { http, HttpResponse, delay } from "msw";

it("shows skeleton while loading", async () => {
  server.use(
    http.get("/api/users", async () => {
      await delay(200); // pause so skeleton is visible
      return HttpResponse.json([{ id: "1", name: "Alice" }]);
    })
  );

  render(<UserList />);
  expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  expect(await screen.findByText("Alice")).toBeInTheDocument();
  expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument();
});
```

---

## Inspecting the Request Body in Tests

```typescript
it("sends correct payload on form submit", async () => {
  let capturedBody: unknown;

  server.use(
    http.post("/api/orders", async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json({ id: "order-1" }, { status: 201 });
    })
  );

  // render form, fill, submit...
  const user = userEvent.setup();
  render(<OrderForm />);
  await user.type(screen.getByLabelText(/address/i), "123 Main St");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(capturedBody).toMatchObject({ shippingAddress: "123 Main St" });
  });
});
```

---

## Rules
- **Default handlers go in `src/tests/mocks/handlers.ts`** — per-test overrides use `server.use()` inside the test
- **Never use `server.use()` outside a test** — it will affect other tests
- **`server.resetHandlers()` runs automatically in `afterEach`** — you don't need to reset manually
- **Use `HttpResponse.error()` for network failures**, not a 500 status — they test different things
- **Use `delay()` to test loading states** — assert the skeleton before `findBy` resolves
- **Always read body with `await request.json()`** — mark the handler `async` when doing so
