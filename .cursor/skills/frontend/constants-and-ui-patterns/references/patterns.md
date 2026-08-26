# Constants & UI Patterns — Rules & Placement

## Naming Rules

| Type | Convention | Example |
|---|---|---|
| Constant objects / plain values | `SCREAMING_SNAKE_CASE` | `ROUTES`, `Z_INDEX`, `MESSAGES` |
| Enum names | `PascalCase` | `UserRole`, `OrderStatus` |
| Enum values | `PascalCase` | `UserRole.Admin`, `OrderStatus.Pending` |
| Display label maps | `SCREAMING_SNAKE_CASE` | `ORDER_STATUS_LABELS`, `USER_ROLE_LABELS` |

- Route paths always start with `/`
- Never put business logic in constants — only static values
- No `any` types — every constant must be fully typed or use `as const`

---

## When to Centralize vs Keep Local

| Situation | Decision |
|---|---|
| Used in 1 file only | Keep local in that file |
| Used in 2+ files | Move to `src/constants/` |
| A route path | Always in `routes.ts` from day one |
| An API endpoint | Always in `api.ts` from day one |
| A status / role value | Always in `enums.ts` from day one |
| A regex pattern | Always in `regex.ts` from day one |
| A z-index / breakpoint / duration | Always in `ui.ts` from day one |
| A user-facing string | Always in `messages.ts` from day one |

---

## Component Placement Rules

### `src/components/ui/` — Shadcn ONLY ⚠️
- Never create custom components here
- Only Shadcn-generated primitives (`Button`, `Input`, `Badge`, `Dialog`, etc.)
- Add via CLI: `npx shadcn@latest add button`
- Minor style tweaks are allowed; no business logic

### `src/components/common/` — Custom shared components
Any component you wrote that is used across 2 or more pages or features.
Both pure UI and logic-bearing components belong here.

Examples: `Spinner`, `PageLoader`, `EmptyState`, `ErrorState`, `QueryStateHandler`,
`OrderStatusBadge`, `UserAvatar`, `RootErrorBoundary`

### `src/components/[feature]/` — Feature-scoped components
Components shared only within one feature's sub-components.
Do not pre-emptively promote to `common/` — wait until a second feature needs it.

Examples: `ProductFilterBar` (products only), `InvoiceLineItem` (invoices only)

### Decision Table

| Component | Shared across features? | Goes in |
|---|---|---|
| Shadcn primitive (Button, Input…) | — | `ui/` via CLI only |
| Custom component used in 2+ features | Yes | `common/` |
| Feature-specific shared component | No (1 feature) | `components/[feature]/` |
| Page-specific, used once | No | `pages/[page]/components/` |

**Rule: Promote, don't pre-optimise.**
Start every custom component inside the feature folder. Move to `common/` only when a second feature needs it.

---

## Barrel Import — Always Use

```typescript
// ✅ Always import from the barrel
import { ROUTES, API, UserRole, REGEX, MESSAGES, STALE_TIME, Z_INDEX } from "@/constants";

// ❌ Never import from individual files
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/enums";
```
