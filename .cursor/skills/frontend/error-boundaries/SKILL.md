---
name: error-boundaries
description: Use when setting up crash isolation, wrapping routes or widgets with error boundaries, or handling unhandled render errors in React. Do NOT use for API failures or loading/empty states — use the ui-states skill for those. NOT for accessible error messaging or ARIA live regions on error states — use accessibility.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Error Boundaries

## Stack Context
- Framework: React 19 + TypeScript + Vite
- Library: `react-error-boundary` — functional-component-friendly wrapper
- UI primitives: Shadcn/ui (`Button`), `lucide-react` icons
- Logger: `@/lib/logger` — **owned by `logging-monitoring` skill**; boundaries call `logger.fatal` / `logger.error`, never import Sentry directly
- Router: `react-router-dom` — `PageErrorBoundary` uses `useLocation` for auto-reset
- Component location: `src/components/common/`
- Fallback location: `src/components/common/fallbacks/`

## When To Use
- Setting up the three-level boundary architecture for the first time
- Wrapping a new route with `PageErrorBoundary`
- Isolating a dashboard widget or card with `SectionBoundary`
- Forwarding a critical async error into the nearest boundary via `useErrorBoundary`
- A developer asks "what happens if this component crashes" or "how do I prevent one widget from taking down the page"

## Do Not Use
- API call failures — use `ui-states` skill (`QueryStateHandler`, `ErrorState`)
- Loading, empty, or skeleton states — use `ui-states` skill
- Logger or Sentry setup — use `logging-monitoring` skill
- Form validation errors — use `validation-schemas` skill
- Accessible error messaging or ARIA live regions on error states — use `accessibility` skill

## Folder Structure
```
src/
└── components/
    └── common/
        ├── RootErrorBoundary.tsx   # Level 1 — wraps entire app
        ├── PageErrorBoundary.tsx   # Level 2 — wraps each route
        ├── SectionBoundary.tsx     # Level 3 — wraps widgets/cards
        └── fallbacks/
            ├── RootFallback.tsx    # Full-screen crash UI
            ├── PageFallback.tsx    # Page-level crash UI
            └── SectionFallback.tsx # Inline card crash UI
```

## How To Apply
1. Read `references/patterns.md` for the three-level architecture and boundary component implementations
2. Build the three fallback components — see `references/examples.md`
3. Wire `RootErrorBoundary` as the outermost wrapper in `AppProviders`
4. Wrap each route with `PageErrorBoundary` + `Suspense` in the router
5. Add `SectionBoundary` around any widget, card, or data-heavy section that should fail independently
6. Use `useErrorBoundary().showBoundary(error)` only for unrecoverable async errors — not routine API failures
7. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For three-level architecture, boundary component code, Sentry/logger rules, and useErrorBoundary → read `references/patterns.md`
- For fallback component implementations, AppProviders wiring, router setup, and dashboard usage → read `references/examples.md`
- For which boundary level to use in each situation → read `references/decisions.md`
- For what NOT to do with corrected alternatives → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)
- To install dependency: run `scripts/setup.sh` (execute, do not read)

## Pipeline
- Depends on: `logging-monitoring` (`@/lib/logger` must exist — boundaries call `logger.fatal`/`logger.error`), `ui-states` (boundaries are for render crashes; API failures are handled there)
- Feeds into: `component-architecture` (all page and widget components are wrapped), `routing-navigation` (every route gets a `PageErrorBoundary`)

## Human Check
- Throw a deliberate error inside a wrapped component and confirm the correct fallback renders (not a blank screen)
- Confirm `SectionBoundary` crash does NOT affect sibling sections or the page layout
- Navigate away from a crashed page and back — confirm `PageErrorBoundary` has reset
- Open Sentry dashboard and confirm the crash appears with the correct severity (`fatal` for root, `error` for page, `warn` for section)
- Confirm no direct `import * as Sentry` exists outside `src/lib/logger/` files
- Run `yarn tsc --noEmit` and confirm zero errors
