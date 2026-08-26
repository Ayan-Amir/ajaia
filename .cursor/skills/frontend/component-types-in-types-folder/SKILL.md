---
name: component-types-in-types-folder
description: >-
  Keeps TypeScript interfaces and types for components (and their public props) in
  src/types/, not inline in .tsx files. Use when adding or reviewing component props,
  extracting types from components like CandidateGoogleSignInButton, or refactoring
  hooks that export typed shapes consumed by UI.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Component Types in `src/types/`

## Rule

**Do not define `interface` or `type` blocks in component files** (`src/components/**/*.tsx`, `src/pages/**/*.tsx`, `src/views/**/*.tsx`). Put them under `src/types/` and import via `#/types/...`.

Same rule for **`src/context/`** provider/value types and **`src/components/providers/`** (e.g. `AuthContextType`, `AppProvidersProps`).

```tsx
// BAD — CandidateGoogleSignInButton.tsx
interface CandidateGoogleSignInButtonProps {
  disabled?: boolean;
  className?: string;
}
export function CandidateGoogleSignInButton({ ... }: CandidateGoogleSignInButtonProps) { ... }
```

```tsx
// GOOD — src/types/auth/candidateGoogleSignInButton.types.ts
export interface CandidateGoogleSignInButtonProps {
  disabled?: boolean;
  className?: string;
}

// GOOD — CandidateGoogleSignInButton.tsx
import type { CandidateGoogleSignInButtonProps } from '#/types/auth/candidateGoogleSignInButton.types';

export function CandidateGoogleSignInButton({ disabled, className }: CandidateGoogleSignInButtonProps) { ... }
```

Use `import type` for props-only imports.

## Where to put files

| Type | Location | Example |
|------|----------|---------|
| Component props | `src/types/<feature>/<component>.types.ts` | `types/auth/candidateGoogleSignInButton.types.ts` |
| Route wrapper props | `src/types/routes.types.ts` | `PrivateRouteProps` (existing pattern) |
| API / domain contracts | `src/types/<feature>/*.api.types.ts`, `auth.types.ts` | See `type-definitions` |

Mirror the **feature** (`auth`, `home`, …), not necessarily the full `components/` tree. One focused `.types.ts` file per component (or per small group of related components) is fine.

## Naming

- Props: `ComponentNameProps` (PascalCase component name + `Props`)
- File: camelCase matching the component stem, e.g. `staffGoogleSignInButton.types.ts` for `StaffGoogleSignInButton`

## Allowed in `.tsx`

- `import type { ... }` from `#/types/`
- Inline generics on hooks (`useState<string>`) — not named exported types
- No new named `interface` / `type` declarations in the component module

## When to apply

- New components under `src/components/` or `src/pages/`
- PR feedback: inline props type in a `.tsx` file
- Extracting a component; move its props type to `src/types/` in the same PR

## Checklist

- [ ] No `interface` / `type` for props or shared UI shapes in `.tsx` component files
- [ ] Props type lives in `src/types/<feature>/` with a matching `*Props` name
- [ ] Component imports props with `import type`
- [ ] API and shared contracts still follow `type-definitions` (not duplicated in components)

## Related skills

- `type-definitions` — API, auth user, pagination, and service boundary types
- `one-component-per-file` — one JSX component per file (props types are **not** colocated in that file)
- `component-architecture` — folder ownership and composition; props **definitions** still live in `src/types/`
