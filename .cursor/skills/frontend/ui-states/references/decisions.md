# UI States — Decision Guide

## Which Loading UI to Use

| Situation | What to show |
|---|---|
| Initial page or section data load | `Skeleton` matching content shape |
| Button / form submission in progress | Inline `Spinner` inside button + `disabled` |
| Full-page auth or route transition | `PageLoader` |
| Query fails | Toast (automatic via queryClient) + inline `ErrorState` |
| Mutation fails | Toast (automatic via queryClient) |
| No data returned by API | `EmptyState` with helpful context |
| Background refetch (data already shown) | Nothing — do not interrupt UX |

---

## Skeleton vs Spinner — When to Choose

| Use `Skeleton` | Use `Spinner` |
|---|---|
| Content has a predictable layout (card, table, list, form) | Content shape is unknown or highly dynamic |
| First/initial load of a section | Inside a button during mutation |
| You want to reduce perceived load time | Full-page route transition (use `PageLoader`) |

**Rule:** Prefer `Skeleton` over `Spinner` for section-level loading. `Spinner` is for inline/button use only at section level unless shape is truly unknown.

---

## staleTime — Which Constant to Use

| Data type | Constant | Value |
|---|---|---|
| Notifications, activity feeds | `STALE_TIME.SHORT` | 30s |
| Standard lists, profiles, most API data | `STALE_TIME.MEDIUM` | 5m |
| Config, roles, enum-like reference data | `STALE_TIME.LONG` | 30m |
| Country lists, static lookup tables | `STALE_TIME.STATIC` | `Infinity` |

Global `queryClient` default is `STALE_TIME.MEDIUM`. Set per-query `staleTime` only when the data's freshness requirement differs from medium.

---

## retry — When to Override Global Default

| Query type | Setting |
|---|---|
| Authenticated resource (can return 401/403) | `retry: false` |
| Resource that may not exist (can return 404) | `retry: false` |
| Form submission feedback (can return 422) | `retry: false` |
| General data fetch (network could be flaky) | `retry: 2` (global default — no override needed) |

**Rule:** If an endpoint can return any 4xx, set `retry: false` on that query. Global `retry: 2` is for transient network failures only.
