---
name: one-component-per-file
description: >-
  Requires one React component per file; do not define extra components in the same file
  as a parent (e.g. AuthBrandHeader inside StaffAuthCard.tsx). Use when creating or
  reviewing components under src/components/, extracting subpieces, or refactoring multi-
  export component files. Colocate related files in the same folder; props types belong in
  src/types/ per component-types-in-types-folder.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# One Component Per File

## Rule

**Each React component lives in its own file.** The file name matches the component name (`AuthBrandHeader.tsx` → `AuthBrandHeader`).

Do **not** add secondary components in the same file as a parent:

```tsx
// BAD — StaffAuthCard.tsx
export function AuthBrandHeader() { ... }
export function StaffAuthCard() { ... }
```

```tsx
// GOOD — AuthBrandHeader.tsx
export function AuthBrandHeader() { ... }

// GOOD — StaffAuthCard.tsx
import { AuthBrandHeader } from '#/components/auth/AuthBrandHeader';
export function StaffAuthCard() { ... }
```

## Allowed in the same file

- **`import type`** for props from `src/types/` (`component-types-in-types-folder`)
- **Non-component helpers** (pure functions with no JSX) used only by that component — prefer `utils` if reused
- **Constants** private to one component — or move to `#/utils/constants` / `#/constants` per `utils-constants` / `constants-and-ui-patterns`

## Not allowed in the same file

- A second `function` / `const` that returns JSX and is used as a component (including “small” headers, footers, list rows)
- Multiple `export function Foo` components in one module

## Where to put files

| Scope | Path |
|-------|------|
| Feature/auth UI | `src/components/auth/ComponentName.tsx` |
| Shared across features | `src/components/common/ComponentName.tsx` |
| Shadcn primitives | `src/components/ui/` (CLI only) |

Keep extracted pieces in the **same folder** as the parent when they are only used there. Promote to `common/` when a second feature imports them.

## When To Apply

- Creating any new component under `src/components/`
- Reviewing a file with more than one component export
- Extracting markup blocks (brand header, empty state, row) from a growing file
- PR feedback: “split this component”

## How To Extract

1. Create `ComponentName.tsx` with the single component; add `ComponentNameProps` in `src/types/<feature>/`.
2. Import it from the parent; remove the inline definition.
3. Do not add a barrel `index.ts` unless the folder already uses one — import by full path (`#/components/auth/AuthBrandHeader`).

## Checklist

- [ ] At most one JSX component export per `.tsx` file
- [ ] File name equals component name
- [ ] Parent imports child from sibling file, not from duplicate exports

## Related Skills

- `component-types-in-types-folder` — props and component-related types in `src/types/`
- `component-architecture` — folder ownership (`ui` vs feature vs `common`)
- `named-event-handlers` — handlers inside each component file, still named
- `constants-and-ui-patterns` — where shared strings live

## Anti-pattern → fix

**Before:** `StaffAuthCard.tsx` contains `AuthBrandHeader` + `StaffAuthCard`.

**After:**

- `AuthBrandHeader.tsx` — brand block only
- `StaffAuthCard.tsx` — card layout; imports `AuthBrandHeader`
