---
name: ui-states
description: Use when adding loading, empty, error, or skeleton UI to React Query components, or setting up QueryStateHandler and global toast. Do NOT use for form validation errors, auth errors, or non-async UI states. NOT for frontend logging setup, logger initialization, or Sentry configuration — use logging-monitoring.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# UI States

## Stack Context
- Framework: React 19 + TypeScript + Vite
- Async state: TanStack React Query (`isLoading`, `isError`, `data`)
- UI primitives: Shadcn/ui (`Skeleton`, `Alert`, `Button`)
- Toast: `react-toastify`
- Logger: `@/lib/logger` — **owned by the `logging-monitoring` skill**; must be set up before using this skill
- Constants: `@/constants` — exports `MESSAGES` and `STALE_TIME`
- Utilities: `@/utils/cn`
- Components: `src/components/common/`
- Skeletons: `src/components/common/skeletons/`
- Query client: `src/lib/queryClient.ts`

## When To Use
- Adding loading, skeleton, empty, or error UI to a data-fetching component
- Setting up or using `QueryStateHandler`
- Wiring global toast notifications for query/mutation failures
- Setting up `queryClient.ts` with global defaults
- A component fetches data but has no empty or error state
- A developer writes inline `if (isLoading) return <div>Loading...</div>`

## Do Not Use
- Form validation errors — use `validation-schemas` skill
- Auth-specific error handling — use `authentication-session-management` skill
- Non-async UI states (disabled buttons, toggles)
- `ErrorBoundary` implementation — use `error-boundaries` skill
- TanStack Query hook patterns — use `api-integration` skill
- Frontend logging setup, logger initialization, or Sentry configuration — use `logging-monitoring` skill

## Folder Structure
```
src/
├── components/common/
│   ├── Spinner.tsx
│   ├── PageLoader.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── QueryStateHandler.tsx
│   └── skeletons/
│       ├── CardSkeleton.tsx
│       ├── TableSkeleton.tsx
│       ├── ListSkeleton.tsx
│       └── FormSkeleton.tsx
└── lib/
    └── queryClient.ts
```

## How To Apply
1. Confirm `@/lib/logger` exists (logging-monitoring skill) — queryClient depends on it
2. Add `STALE_TIME` to `@/constants` if missing — see `references/patterns.md` for values
3. Wire `queryClient.ts` with global toast, logger, staleTime, and retry defaults — rules in `references/patterns.md`
4. Create or locate `QueryStateHandler` in `src/components/common/` — implementation in `references/examples.md`
5. Build skeleton component matching content shape — examples in `references/examples.md`
6. Use `QueryStateHandler` in every data-fetching component — never inline `isLoading` checks
7. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For four-state rule, queryClient config, STALE_TIME constants, logger, retry/staleTime rules → read `references/patterns.md`
- For full component code (Spinner, PageLoader, EmptyState, ErrorState, QueryStateHandler, skeletons) → read `references/examples.md`
- For when to use Skeleton vs Spinner vs PageLoader → read `references/decisions.md`
- For what NOT to do with corrected alternatives → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)

## Pipeline
- Depends on: `logging-monitoring` (logger and Sentry abstraction must exist), `api-integration` (`isLoading`/`isError`/`data` query patterns)
- Feeds into: `component-architecture` (QueryStateHandler used in all data-fetching components), `logging-monitoring` (error logging from queryClient), `error-boundaries` (global boundary wraps QueryStateHandler failures)

## Human Check
- Verify skeleton visually matches the shape of the real content it replaces
- Confirm empty state triggers when API returns zero items (not just `undefined`)
- Confirm error state shows both inline `ErrorState` AND toast simultaneously
- Test that `retry: false` is set on any query that can receive 4xx responses
- Verify per-query `staleTime` overrides work independently of the global fallback
- Confirm `@/lib/logger` is initialized before `queryClient.ts` runs
- Run `yarn tsc --noEmit` and confirm zero errors
