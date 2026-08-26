# Accessibility Testing — axe + Keyboard Navigation

> **Setup:** If `src/tests/setup.ts` doesn't exist yet, read `setup.md` first. `vitest-axe/extend-expect` must be imported in `setup.ts`.

---

## What axe Checks Automatically

| Category | Examples caught by axe |
|---|---|
| Images | Missing `alt` attributes |
| Forms | Inputs without labels, errors not linked via `aria-describedby` |
| Buttons | Buttons with no text or `aria-label` |
| ARIA | Invalid roles, duplicate IDs, invalid attribute values |
| Color contrast | Text failing WCAG AA ratio |
| Headings | Skipped heading levels (h1 → h3) |

**axe does NOT check:** Focus order logic, screen reader announcements, `prefers-reduced-motion`.

---

## The Minimum — One axe Check Per Component

```typescript
import { axe } from "vitest-axe";

it("has no accessibility violations", async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations(); // always await
});
```

---

## Test Every State — Not Just Default

```typescript
describe("LoginForm — accessibility", () => {
  const user = userEvent.setup();

  it("has no violations in default state", async () => {
    const { container } = render(<LoginForm onSubmit={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when errors are shown", async () => {
    const { container } = render(<LoginForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByText(/email is required/i); // wait for errors
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations while submitting", async () => {
    const { container } = render(<LoginForm onSubmit={vi.fn(() => new Promise(() => {}))} />);
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

// For async components — always wait for data before running axe
it("has no violations after data loads", async () => {
  const { container } = render(<UserCard userId="1" />);
  await screen.findByText("Alice"); // wait before axe
  expect(await axe(container)).toHaveNoViolations();
});
```

---

## Keyboard Navigation — Focus Management

```typescript
describe("Modal — focus management", () => {
  const user = userEvent.setup();

  it("moves focus to first focusable element when opened", () => {
    render(<Modal isOpen onClose={vi.fn()} title="Confirm">
      <button>First Action</button>
      <button>Second Action</button>
    </Modal>);
    expect(screen.getByRole("button", { name: /first action/i })).toHaveFocus();
  });

  it("traps focus inside modal — Tab cycles through modal only", async () => {
    render(<Modal isOpen onClose={vi.fn()} title="Settings">
      <button>Save</button>
      <button>Cancel</button>
    </Modal>);

    await user.tab();
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveFocus();

    await user.tab(); // wraps back
    expect(screen.getByRole("button", { name: /save/i })).toHaveFocus();
  });

  it("closes and returns focus to trigger when Escape is pressed", async () => {
    render(
      <div>
        <button id="trigger">Open Modal</button>
        <Modal isOpen onClose={vi.fn()} title="Confirm">
          <button>Action</button>
        </Modal>
      </div>
    );
    await user.keyboard("{Escape}");
    expect(document.getElementById("trigger")).toHaveFocus();
  });
});
```

---

## Keyboard Navigation — Interactive Elements

```typescript
describe("Dropdown — keyboard nav", () => {
  const user = userEvent.setup();

  it("opens with Enter or Space", async () => {
    render(<Dropdown label="Options" options={["Edit", "Delete"]} />);
    const trigger = screen.getByRole("button", { name: /options/i });
    trigger.focus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("navigates options with arrow keys", async () => {
    render(<Dropdown label="Options" options={["Edit", "Delete"]} />);
    screen.getByRole("button", { name: /options/i }).focus();
    await user.keyboard("{Enter}");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /edit/i })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /delete/i })).toHaveFocus();
  });

  it("closes with Escape", async () => {
    render(<Dropdown label="Options" options={["Edit"]} />);
    await user.click(screen.getByRole("button", { name: /options/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
```

---

## ARIA Roles Cheat Sheet

```typescript
// Common roles used in getByRole / toHaveRole
screen.getByRole("button")
screen.getByRole("link")
screen.getByRole("textbox")            // <input type="text">
screen.getByRole("checkbox")
screen.getByRole("radio")
screen.getByRole("combobox")           // <select> or custom dropdown
screen.getByRole("listbox")            // dropdown option list
screen.getByRole("option")             // individual dropdown item
screen.getByRole("dialog")             // modal
screen.getByRole("alertdialog")        // modal requiring immediate attention
screen.getByRole("alert")              // error/warning message
screen.getByRole("status")             // non-critical status update
screen.getByRole("heading", { level: 1 })
screen.getByRole("navigation")
screen.getByRole("main")
screen.getByRole("table")
screen.getByRole("row")
screen.getByRole("cell")
screen.getByRole("columnheader")
screen.getByRole("searchbox")
screen.getByRole("spinbutton")         // <input type="number">
```

---

## Rules
- **Run axe on every component test file** — at least one `axe(container)` per file
- **Test every meaningful state** — default, error, loading, disabled, open/closed
- **Wait for async content before running axe** — `await screen.findByX(...)` first
- **Test focus management for modals and overlays** — focus must move in and return on close
- **Test keyboard navigation for interactive widgets** — dropdowns, tabs, date pickers
- **Use `getByRole` with `{ name: ... }`** — if axe finds an issue here, the component may not be accessible
