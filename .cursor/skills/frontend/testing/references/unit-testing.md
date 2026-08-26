# Unit Testing — Utils & Custom Hooks

> **Setup:** If `src/tests/setup.ts` and `src/tests/utils/test-utils.tsx` don't exist yet, read `setup.md` first.

## File Location

Unit tests live **next to the file they test**:
```
src/utils/string.ts  →  src/utils/string.test.ts
src/hooks/useCounter.ts  →  src/hooks/useCounter.test.ts
```

---

## Test Anatomy — Arrange / Act / Assert

```typescript
import { describe, it, expect } from "vitest";

describe("slugify", () => {
  it("converts spaces to hyphens and lowercases", () => {
    const result = slugify("Hello World"); // Act
    expect(result).toBe("hello-world");   // Assert
  });

  it("returns empty string for null input", () => {
    expect(slugify(null)).toBe("");
  });
});
```

**Naming rules:** One `it` = one behaviour. Name reads as a sentence: `"returns 0 when total is 0"`. Never use `"tests null"` or `"handles edge case"`.

---

## Testing Utility Functions

```typescript
// src/utils/date.test.ts — fake timers for time-dependent functions
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDate, timeAgo, isToday } from "@/utils/date";

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers()); // MUST restore — broken if forgotten

  it("returns relative description for 2 hours ago", () => {
    expect(timeAgo(new Date("2026-04-09T10:00:00Z"))).toMatch(/2 hours ago/);
  });

  it("returns dash for null input", () => {
    expect(timeAgo(null)).toBe("—");
  });
});

describe("formatDate", () => {
  it("returns dash for null input",              () => expect(formatDate(null)).toBe("—"));
  it("returns 'Invalid date' for bad string",    () => expect(formatDate("bad")).toBe("Invalid date"));
  it("uses regex for timezone-safe assertion",   () => {
    expect(formatDate(new Date("2026-04-09T00:00:00Z"), "short")).toMatch(/Apr \d+, 2026/);
  });
});
```

---

## Testing Custom Hooks — `renderHook`

### Simple hook (no providers needed)

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "@/hooks/useCounter";

describe("useCounter", () => {
  it("initialises with provided value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments when increment() is called", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment()); // act() ensures state updates are processed
    expect(result.current.count).toBe(1);
  });

  it("does not go below 0", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(0);
  });
});
```

### Hook with React Query — use `createWrapper`

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { createWrapper } from "@/tests/utils/test-utils";
import { useUsers } from "@/hooks/useUsers";

describe("useUsers", () => {
  it("starts in loading state", () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it("returns user list after successful response", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2); // from default MSW handler
  });

  it("transitions to error on 500", async () => {
    server.use(http.get("/api/users", () =>
      HttpResponse.json({ message: "error" }, { status: 500 })
    ));
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

## Vitest Utilities

### Mocking modules

```typescript
// Mock entire module
vi.mock("@/lib/logger", () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

// Mock one export, keep the rest real
vi.mock("@/utils/string", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/string")>();
  return { ...actual, slugify: vi.fn().mockReturnValue("mocked-slug") };
});
```

### Spying

```typescript
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
// ...trigger error...
expect(spy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
spy.mockRestore(); // ALWAYS restore
```

### Fake timers (debounce / throttle)

```typescript
describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not call fn before wait time elapses", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);
    debouncedFn(); debouncedFn(); debouncedFn();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

---

## Assertion Quick Reference

```typescript
expect(result).toBe("hello");                              // strict ===
expect(result).toEqual({ id: 1 });                         // deep equality
expect(result).toMatchObject({ id: 1 });                   // partial match
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining(["a", "b"]));   // subset
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith("arg1", "arg2");
await expect(asyncFn()).rejects.toThrow("error message");
await expect(asyncFn()).resolves.toEqual({ data: "ok" });
```

---

## Rules
- **One behaviour per `it`** — if you need "and" in the name, split it
- **Always restore fake timers** — `vi.useRealTimers()` in `afterEach`
- **Always restore spies** — `spy.mockRestore()` after every `vi.spyOn()`
- **Use `createWrapper()`** for React Query hooks — never set up QueryClientProvider manually
- **Never mock `fetch` or `axios`** — use MSW handlers instead
- **Test edge cases** — null, undefined, empty arrays, zero, boundary values
