# Reusable Helpers — Writing Rules & Patterns

## Rules for Every Helper

- **Pure functions** — no side effects; input → output only (exception: `storage.ts`, `async.ts`)
- **Fully typed** — no `any`; use generics where needed
- **JSDoc required** — every exported function needs `@example` showing input → output
- **One domain per file** — don't mix string helpers into array.ts, etc.
- **No third-party libs** — pure TypeScript only (exception: the project's existing date library)
- **Date adapter pattern** — `date.ts` wraps `dayjs` or `moment`; check which is installed first

---

## JSDoc Format

```typescript
/**
 * One-line description of what the function does.
 * @param paramName - what it expects
 * @returns what it gives back
 * @example functionName("input") // "expected output"
 */
export function functionName(paramName: string): string { ... }
```

---

## Barrel Export — `src/utils/index.ts`

Every domain file must be re-exported here. This is the only file consumers import from.

```typescript
export * from "./date";
export * from "./string";
export * from "./number";
export * from "./array";
export * from "./validation";
export * from "./storage";
export * from "./url";
export * from "./async";
```

**Import pattern** — always use the barrel, never individual files:
```typescript
// ✅ Correct
import { formatDate, truncate, formatCurrency, groupBy, debounce } from "@/utils";

// ❌ Never — bypasses the barrel and breaks tree-shaking expectations
import { formatDate } from "@/utils/date";
```

---

## Usage Quick Reference

```typescript
import {
  formatDate, timeAgo,           // date
  truncate, slugify, maskString, // string
  formatCurrency, formatBytes,   // number
  groupBy, sortBy, chunk,        // array
  storage,                       // storage
  buildQueryString,              // url
  debounce, retry,               // async
} from "@/utils";

// Date
formatDate(user.createdAt, "short")   // "Apr 9, 2026"
timeAgo(post.publishedAt)             // "3 hours ago"

// String
truncate(desc, 120)                   // "Long text that gets cut..."
slugify("My Blog Post!")              // "my-blog-post"
maskString("4111111111111111", 4)     // "············1111"

// Number
formatCurrency(29.99, "USD")          // "$29.99"
formatBytes(1048576)                  // "1 MB"

// Array
groupBy(users, "role")                // { admin: [...], user: [...] }
sortBy(products, "price", "asc")

// Storage
storage.set("cart", cartItems)
storage.get<CartItem[]>("cart")

// URL
buildQueryString({ page: 1, search: "react", filter: null }) // "?page=1&search=react"

// Async
const debouncedSearch = useCallback(debounce(handleSearch, 300), [])
```

---

## When to Extract to utils vs Keep in Component

| Scenario | Decision |
|---|---|
| Logic used in 2+ components or hooks | Extract to `src/utils/` |
| Logic that transforms data with no React dependency | Extract to `src/utils/` |
| Logic with `useState`, `useEffect`, or JSX | Keep in component or extract to a hook |
| Logic that calls an API | Keep in API service layer, not utils |
| Complex Zod schema | Use `validation-schemas` skill, not `validation.ts` |
