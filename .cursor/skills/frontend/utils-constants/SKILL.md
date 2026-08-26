---
name: utils-constants
description: >-
  Centralize UI condition literals (variant === 'success') and component-level magic numbers
  in frontend/src/constants/generic.ts (with HTTP verbs). Use when adding switches, variant
  checks, status comparisons, timeouts, limits, or numeric thresholds. Import from
  #/constants. Do NOT use src/utils/constants.ts. User-facing copy uses messages.ts;
  routes/API/query keys use other files under src/constants/.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# UI & Generic Constants (`src/constants/generic.ts`)

## Purpose

Keep **branch/compare literals** and **magic numbers** out of components and hooks. Live alongside **HTTP method** constants in one file, exported from `#/constants`.

| Belongs in `generic.ts` | Other `src/constants/` files |
|-------------------------|------------------------------|
| `GET`, `POST`, `PUT`, `DELETE` | `ROUTES`, `apiEndpoints`, `QUERY_KEY` |
| `TOAST_VARIANT`, `TOAST.*` | `MESSAGES` |
| UI/status tokens in `if` / `switch` | Domain-specific enums in dedicated files when added |

Import: `import { TOAST_VARIANT, TOAST, POST } from '#/constants';`

## When To Use

- New `variant`, `status`, `mode`, or `type` string compared with `===` or `switch`
- Record/map keys that mirror those tokens (`Record<ToastVariant, string>`)
- Numeric literals in JSX or hooks (`4500`, `4`, …)
- Refactoring repeated condition literals or magic numbers

## Do Not Use

- **`frontend/src/utils/constants.ts`** — removed; do not recreate under `utils/`
- Route or API path strings (other constant files)
- User-facing message strings (`messages.ts`)

## File Rules

1. Add UI tokens and numeric groups to **`src/constants/generic.ts`** (or split to `constants/ui.ts` only if this file grows past ~150 lines).
2. **`as const` objects** + derived types from values.
3. **SCREAMING_SNAKE** keys; name units in numeric keys (`AUTO_CLOSE_MS`).

## Patterns

```typescript
import { TOAST_VARIANT, type ToastVariant, TOAST } from '#/constants';

if (variant === TOAST_VARIANT.SUCCESS) { /* ... */ }

autoClose={TOAST.AUTO_CLOSE_MS}
```

## Checklist

- [ ] No new raw strings in `===` / `switch` for enumerated UI states
- [ ] No unexplained numeric literals in touched files
- [ ] Imports from `#/constants`, not `#/utils/constants`

## Related Skills

- `constants-and-ui-patterns` — barrel layout, messages, routes
- `centralized-messages` — copy in `messages.ts` only
