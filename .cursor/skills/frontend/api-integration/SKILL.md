---
name: api-integration
description: Use when adding or changing TanStack Query hooks, Axios `performRequest` usage, cache invalidation, infinite lists, or `data/<feature>/` API layer files. Do NOT use for global UI Zustand/Context (react-state-management), generic custom hooks without HTTP (custom-hooks), or RHF forms (forms-validation). NOT for real-time WebSocket connections or event-driven server communication — use websocket.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# API Integration & Data Layer

## Stack Context

- Framework: React + TypeScript + Vite
- HTTP: Axios via `src/services/axiosInstance.ts` (interceptors, `change-object-case`)
- API helper: `performRequest` in `src/services/apiClient.ts`
- Server state: `@tanstack/react-query` v5
- Endpoints / keys: `src/constants/apiEndpoints.ts`, `src/constants/queryKeys.ts`, HTTP verbs in `src/constants/generic.ts`
- Hooks (no `use` in filenames): `src/data/<feature>/queries/*.ts`, `src/data/<feature>/mutations/*.ts`
- Pagination helper: `src/services/networkRequestService.ts` (`useInfiniteScrollQuery`); `getNextPageParamHelper` in `src/utils/helperFunctions.ts` when applicable

## When To Use

- New GET/POST/PUT/DELETE flows through `performRequest`
- New `useQuery` / `useMutation` / infinite query wrappers
- Query key design and invalidation after writes
- Wiring list/detail cache updates (including optimistic updates)

## Do Not Use

- Auth Context / token UI → **react-state-management** (this skill may consume typed responses only)
- Local component-only hooks with no HTTP → **custom-hooks**
- Form field mapping and Zod → **forms-validation**
- Logger / Sentry abstraction ownership → **logging-monitoring** (per org skill matrix)
- Real-time WebSocket connections or event-driven server communication → **websocket**

## Folder Structure

```text
src/
├── constants/
│   ├── apiEndpoints.ts
│   ├── queryKeys.ts
│   └── generic.ts
├── services/
│   ├── apiClient.ts
│   ├── axiosInstance.ts
│   └── networkRequestService.ts
├── data/
│   └── <feature>/
│       ├── queries/
│       │   └── getPosts.ts
│       └── mutations/
│           └── createPost.ts
├── types/
│   └── <feature>/
│       └── api.types.ts
└── utils/
    └── helperFunctions.ts
```

## How To Apply

1. Add or reuse endpoint + `queryKeys` entries; keep keys hierarchical arrays.
2. Define request/response types under `src/types/<feature>/`.
3. Implement `queryFn` / `mutationFn` via `performRequest` only — not raw `axios` in components.
4. For behavior choices (stale time, retry, callbacks), read `references/decisions.md`.
5. Copy shapes from `references/examples.md`; avoid anti-patterns in `references/anti-patterns.md`.
6. Run `scripts/lint.sh` and `scripts/typecheck.sh` (execute, do not read).

## References

- Architecture + client patterns → `references/patterns.md`
- End-to-end TypeScript examples, mutation patterns, offline queue → `references/examples.md`
- Stale time, retry, mutation callback placement → `references/decisions.md`
- Guardrails and “never” rules → `references/anti-patterns.md`
- Cache misses, wrong data, errors → `references/troubleshooting.md`

## Scripts

- Lint: `scripts/lint.sh`
- Typecheck: `scripts/typecheck.sh`
- Build smoke: `scripts/test.sh`

## Pipeline

- **Depends on:** `type-definitions` (DTOs), env base URL for Axios
- **Feeds into:** UI components, **forms-validation** (submit calls mutations), global error UX

## Human Check

- No `axiosInstance` imports inside presentational components
- Query keys unique and stable; invalidation covers all affected lists/details
- Optimistic flows roll back correctly on failure
- `onSuccess` / `onError` for mutations passed at **call site** (`mutate(vars, { onSuccess })`), not embedded in reusable hook defaults when avoidable
- Manual API smoke for pagination (`hasNext`) if using infinite helpers
