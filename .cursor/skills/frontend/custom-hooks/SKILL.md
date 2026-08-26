---
name: custom-hooks
description: Use when creating or refactoring custom React hooks, effects, dependency arrays, cleanup, or useMemo/useCallback/useRef. Do NOT use for TanStack Query query/mutation hooks (api-integration), form/RHF hooks (forms-validation), or global store setup (react-state-management). NOT for pure utility functions with no React dependency (useState, useEffect, etc.) — use reusable-helpers instead.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Custom Hooks

## Stack Context

- Framework: React 19 + TypeScript + Vite
- Data fetching hooks: TanStack Query — owned by **api-integration** skill (`src/data/<feature>/`)
- Shared hooks: `src/hooks/`
- Feature hooks: `src/features/<feature>/hooks/`
- Lint: ESLint `react-hooks` plugin (exhaustive-deps)

## When To Use

- New shared `use*` utilities (debounce, toggle, localStorage, media query)
- Feature-specific hooks that wrap UI logic (not server or forms)
- `useEffect` / `useLayoutEffect` with correct deps and cleanup
- Memoization choices (`useMemo`, `useCallback`, `useRef` patterns)
- Refactoring component logic into a hook

## Do Not Use

- TanStack Query `useQuery` / `useMutation` / infinite query wrappers → **api-integration**
- React Hook Form + Zod wiring → **forms-validation**
- Zustand stores or auth Context providers → **react-state-management**
- Routing (`useParams`, loaders) → **routing-navigation**
- Pure utility functions with no React dependency (`useState`, `useEffect`, etc.) → **reusable-helpers**

## Folder Structure

```text
src/
├── hooks/
│   ├── useToggle.ts
│   └── useDebounce.ts
└── features/
    └── <feature>/
        └── hooks/
            └── use<Feature>.ts
```

## How To Apply

1. Decide shared vs feature scope; place the file under `src/hooks/` or `src/features/.../hooks/`.
2. For effect or memo work, read `references/patterns.md` for rules of thumb.
3. For copy-paste shapes, read `references/examples.md`.
4. For dependency / stale-closure pitfalls, read `references/anti-patterns.md`.
5. After edits, run `scripts/lint.sh` (execute from repo root context; do not read the script for instructions).

## References

- Core rules, naming, cleanup, memoization → read `references/patterns.md`
- Annotated TypeScript examples → read `references/examples.md`
- Bad vs good dependency and reference patterns → read `references/anti-patterns.md`
- ESLint / infinite re-render symptoms → read `references/troubleshooting.md`

## Scripts

- Lint: run `scripts/lint.sh` (execute, do not read)
- Typecheck: run `scripts/typecheck.sh` (execute, do not read)
- Build smoke: run `scripts/test.sh` (execute, do not read)

## Pipeline

- **Depends on:** `type-definitions` (hook args/return types); optional coordination with `react-state-management` when mixing with global client state
- **Feeds into:** `component-architecture` (components consume hooks)

## Human Check

- No `react-hooks/exhaustive-deps` warnings after changes
- Unmount paths: timers, listeners, subscriptions aborted
- Hooks only at top level of components or custom hooks
- Naming: `use` prefix; file name matches exported hook
- Run project lint from repo root and confirm a clean pass
