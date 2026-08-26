# Component Testing — React Testing Library

> **Setup:** If `src/tests/setup.ts` and `src/tests/utils/test-utils.tsx` don't exist yet, read `setup.md` first.

## Query Priority — How to Find Elements

| Priority | Query | Use when |
|---|---|---|
| 1st | `getByRole` | Buttons, inputs, headings, links, checkboxes, dialogs |
| 2nd | `getByLabelText` | Form fields with an associated `<label>` |
| 3rd | `getByPlaceholderText` | Inputs with placeholder but no label |
| 4th | `getByText` | Non-interactive text — paragraphs, spans |
| Last | `getByTestId` | Only when nothing else works |

## `getBy` vs `findBy` vs `queryBy`

| Variant | Returns | Throws? | When to use |
|---|---|---|---|
| `getBy*` | Element | Yes (immediately) | Element must be in DOM right now |
| `findBy*` | Promise\<Element\> | Yes (after timeout) | Element appears after fetch or state update |
| `queryBy*` | Element \| null | No | Asserting element is **not** present |

```typescript
screen.getByRole("button", { name: /sign in/i });  // must exist now
await screen.findByText("Alice");                   // wait for async content
expect(screen.queryByText("Error")).not.toBeInTheDocument(); // absence check
```

---

## userEvent — Always Use Over fireEvent

```typescript
const user = userEvent.setup(); // declare once at describe level

await user.click(button);
await user.type(input, "hello");
await user.keyboard("{Enter}");
await user.tab();
await user.clear(input);
await user.selectOptions(select, "option-value");

// ❌ Never use fireEvent — misses pointer/focus events
fireEvent.click(button);
```

---

## Component Test Template

```typescript
// src/components/common/MyComponent.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  const user = userEvent.setup();

  it("renders without crashing", () => { /* ... */ });
  it("shows expected content", () => { /* ... */ });
  it("responds to user interaction", async () => { /* ... */ });

  // For data-fetching components:
  it("shows loading indicator before data arrives", () => { /* ... */ });
  it("displays data after successful fetch", async () => { /* ... */ });
  it("shows error state when fetch fails", async () => { /* ... */ });
  it("shows empty state when API returns no data", async () => { /* ... */ });

  it("has no accessibility violations", async () => {
    const { container } = render(<MyComponent />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

---

## Display Component Example

```typescript
describe("Badge", () => {
  it("renders label text", () => {
    render(<Badge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("updates when prop changes", () => {
    const { rerender } = render(<Badge label="Pending" />);
    rerender(<Badge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Badge label="Active" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

---

## Form Testing

```typescript
describe("LoginForm", () => {
  const user = userEvent.setup();

  it("shows required errors when submitted empty", async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    // findBy waits — RHF validates async
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("calls onSubmit with correct values when form is valid", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com", password: "Password1!",
    }));
  });

  it("disables submit while submitting", async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => {})); // never resolves
    render(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });
});
```

---

## Component with React Query

```typescript
describe("UserCard", () => {
  it("shows loading before data arrives", () => {
    render(<UserCard userId="1" />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("renders name and email after fetch", async () => {
    render(<UserCard userId="1" />);
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows error when API returns 500", async () => {
    server.use(http.get("/api/users/1", () =>
      HttpResponse.json({ message: "error" }, { status: 500 })
    ));
    render(<UserCard userId="1" />);
    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    );
  });

  it("has no violations after data loads", async () => {
    const { container } = render(<UserCard userId="1" />);
    await screen.findByText("Alice"); // wait before axe
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

---

## `within` — Scope Queries to a Subtree

```typescript
import { within } from "@/tests/utils/test-utils";

const aliceRow = screen.getByRole("row", { name: /alice/i });
within(aliceRow).getByRole("button", { name: /edit/i }); // scoped to Alice's row
```

---

## Rules
- **Import `render` from `@/tests/utils/test-utils`** — never from RTL directly
- **Use `userEvent` over `fireEvent`** — always
- **Declare `userEvent.setup()` at `describe` level** — one session per test group
- **Use `findBy` for async content** — never `getBy` for elements that appear after fetch
- **Use `queryBy` only for asserting absence**
- **Run axe after async content loads** — `await screen.findByX(...)` before axe
- **Test all states for data-fetching components** — loading, success, empty, error
