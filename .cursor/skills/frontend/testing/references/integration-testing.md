# Integration Testing — Full User Flows

> **Setup:** If `src/tests/setup.ts` and `src/tests/utils/test-utils.tsx` don't exist yet, read `setup.md` first.

Integration tests verify **multi-step user flows** across one or more pages. They sit above component tests — they test the full path a user takes, not individual components in isolation.

**File location:** `src/tests/integration/` (not co-located with source files)

---

## When to Write an Integration Test

| Situation | Integration test? |
|---|---|
| User logs in and lands on a protected page | Yes |
| User creates an item and sees it in the list | Yes |
| User fills a form, submits, gets a toast | Yes |
| User deletes an item with a confirm dialog | Yes |
| Testing one isolated component | No — use component test |
| Testing a utility function | No — use unit test |

---

## What to Render

```typescript
// Render <App /> when the test involves navigation between routes
render(<App />, { initialRoute: "/login" });

// Render a page directly when no navigation is needed
render(<UsersPage />);
```

---

## Login Flow Example

```typescript
// src/tests/integration/LoginFlow.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { App } from "@/App";

describe("Login Flow", () => {
  const user = userEvent.setup();

  it("logs in and redirects to dashboard", async () => {
    render(<App />, { initialRoute: "/login" });
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument()
    );
    expect(screen.queryByRole("heading", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("shows error toast for invalid credentials", async () => {
    render(<App />, { initialRoute: "/login" });

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from protected routes to login", async () => {
    render(<App />, { initialRoute: "/dashboard" });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument()
    );
  });
});
```

---

## CRUD Flow Example

```typescript
// src/tests/integration/UsersPage.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { UsersPage } from "@/pages/UsersPage";

describe("Users Page", () => {
  const user = userEvent.setup();

  it("loads and displays users", async () => {
    render(<UsersPage />);
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty state when list is empty", async () => {
    server.use(http.get("/api/users", () => HttpResponse.json([])));
    render(<UsersPage />);
    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
  });

  it("creates a new user and shows success toast", async () => {
    render(<UsersPage />);
    await screen.findByText("Alice");

    await user.click(screen.getByRole("button", { name: /add user/i }));
    await user.type(screen.getByLabelText(/name/i), "Carol");
    await user.type(screen.getByLabelText(/email/i), "carol@example.com");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(screen.getByText(/user created/i)).toBeInTheDocument()
    );
  });

  it("deletes user after confirming dialog", async () => {
    render(<UsersPage />);
    await screen.findByText("Alice");

    // Use within() to scope the delete button to Alice's row
    const aliceRow = screen.getByRole("row", { name: /alice/i });
    await user.click(within(aliceRow).getByRole("button", { name: /delete/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));

    await waitFor(() =>
      expect(screen.queryByText("Alice")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("keeps user when deletion is cancelled", async () => {
    render(<UsersPage />);
    await screen.findByText("Alice");

    const aliceRow = screen.getByRole("row", { name: /alice/i });
    await user.click(within(aliceRow).getByRole("button", { name: /delete/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

---

## Rules
- **Always start with the happy path** — then empty state, error state, edge cases
- **Use `within()` for scoped queries** — prevents matching wrong rows in lists
- **Use `await screen.findByX(...)` before asserting** — never assert before data loads
- **Use `waitFor()` for multiple assertions** — check several things after async updates
- **One `userEvent.setup()` per `describe` block** — maintains user session across interactions
- **Integration tests go in `src/tests/integration/`** — not co-located with components
