# Error Boundaries — Decision Guide

## Which Boundary to Use

| Situation | Solution |
|---|---|
| App-wide catastrophic render crash | `RootErrorBoundary` in `AppProviders` |
| Page/route render crash | `PageErrorBoundary` wrapping each route |
| Dashboard widget or data card crash | `SectionBoundary label="..."` |
| Non-critical widget (hide silently on crash) | `SectionBoundary silent` |
| Critical async error (unrecoverable) | `useErrorBoundary().showBoundary(error)` |
| API call fails / 4xx / 5xx response | `ui-states` skill — not error boundaries |
| Loading / empty / skeleton states | `ui-states` skill — not error boundaries |

---

## Which Log Level per Boundary

| Boundary | Log level | Reason |
|---|---|---|
| `RootErrorBoundary` | `logger.fatal` | App-breaking, highest severity |
| `PageErrorBoundary` | `logger.error` | Page broken, but app structure intact |
| `SectionBoundary` | `logger.warn` | Isolated failure, user can continue |

---

## silent vs label on SectionBoundary

| Prop | Use when |
|---|---|
| `label="..."` (default) | Widget is important — show a try-again fallback with a descriptive label |
| `silent` | Widget is supplementary — a blank space is better than an error card |

Examples of `silent` candidates: promotional banners, recent activity feeds, recommendation carousels.
Examples of `label` candidates: revenue charts, user stats, main data tables.

---

## useErrorBoundary — When to Use

| Scenario | Use showBoundary? |
|---|---|
| API call fails (404, 500) | ❌ — let `queryClient.ts` toast handle it |
| Auth token expired | ❌ — redirect to login in auth interceptor |
| Critical config fetch fails (app cannot function) | ✅ — `showBoundary(error)` |
| Broken initialisation that leaves app in invalid state | ✅ — `showBoundary(error)` |

---

## Boundary vs try/catch

| Catches | Error boundary | try/catch |
|---|---|---|
| Render errors (thrown during React rendering) | ✅ | ❌ |
| Errors in event handlers | ❌ | ✅ |
| Errors in async functions | ❌ (use showBoundary) | ✅ |
| Errors outside the React tree | ❌ | ✅ |
