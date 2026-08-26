---
name: type-definitions
description: Use when defining or updating frontend TypeScript API contracts, domain types, shared service boundaries, and auth type file locations. Do NOT use for TanStack Query hooks, ErrorBoundary/logger implementations, RHF defaults, auth context logic, or folder naming conventions.
allowed-tools: Read, Write, Edit, Bash, Grep
model: sonnet
---

# Type Definitions

## Stack Context
- Framework: React + TypeScript (Vite-style frontend)
- Data boundaries: services, API clients, and feature hooks consume typed contracts
- Primary type location: `src/types/`
- Shared contracts: `src/types/common/`
- Auth type location: `src/types/auth/auth.types.ts` (this skill owns location guidance)

## When To Use
- Creating or changing API request/response interfaces
- Creating or changing feature domain/view-model types
- Defining shared error, pagination, route, env, or service option types
- Replacing `any` or unsafe assertions at service/hook boundaries
- Aligning auth type files with agreed folder location

## Do Not Use
- TanStack Query hook patterns; use `api-integration`
- `queryClient.ts`, logger, or Sentry abstraction; use `logging-monitoring` (toast behavior from `ui-states`)
- ErrorBoundary implementation; use `error-boundaries`
- RHF mode defaults (`onBlur`); use `validation-schemas`
- Auth context implementation; use `react-state-management`
- Folder naming conventions (lowercase, kebab-case); use `routing-navigation`

## Folder Structure
```text
src/
  types/
    auth/
      auth.types.ts
    common/
      api.types.ts
      error.types.ts
      pagination.types.ts
    <feature>/
      index.ts
      <feature>.types.ts
      <feature>.api.types.ts
    routes.types.ts
    services.types.ts
    env.d.ts
    index.ts
```

Placement rules:

- Store shared contracts only in `src/types/common/`.
- Store auth contracts only in `src/types/auth/auth.types.ts`.
- Store feature-specific contracts only in `src/types/<feature>/`.
- Keep backend-facing shapes in `<feature>.api.types.ts`.
- Keep UI/domain-facing shapes in `<feature>.types.ts`.
- Keep feature barrel exports in `<feature>/index.ts`.
- Keep routes, service options, and env typing in their dedicated root files.

## How To Apply
1. Identify the boundary: API contract, domain type, shared contract, auth type location, or service boundary.
2. Read `references/patterns.md` for placement and naming rules before editing.
3. Read `references/decisions.md` for edge-case choices (nullability, exports, API/domain split).
4. Use `references/examples.md` to implement complete, working type definitions.
5. Check `references/anti-patterns.md` to avoid cross-skill ownership overlap and unsafe typing.
6. Run `scripts/lint.sh` and `scripts/validate.sh` (execute scripts, do not read them).
7. Use `references/troubleshooting.md` if validation fails.

## References
- For canonical type placement and boundary rules: read `references/patterns.md`
- For complete working code examples: read `references/examples.md`
- For edge-case decisions and tradeoffs: read `references/decisions.md`
- For prohibited patterns and owner-skill handoff: read `references/anti-patterns.md`
- For common failures and fixes: read `references/troubleshooting.md`
- For system-level layout and flow: read `assets/diagrams/architecture.md`

## Scripts
- Environment bootstrap: run `scripts/setup.sh` (execute, do not read)
- Lint and static checks: run `scripts/lint.sh` (execute, do not read)
- Type/test validation: run `scripts/validate.sh` (execute, do not read)

## Pipeline
- Depends on: backend contract agreement, feature scope, and existing project `tsconfig` paths
- Feeds into: `api-integration`, `validation-schemas`, `component-architecture`, and `react-state-management`

## Human Check
- Confirm API field names and nullability match backend payloads exactly
- Confirm domain types do not leak backend-only naming by accident
- Confirm auth types remain in `src/types/auth/auth.types.ts`
- Confirm exported barrels expose only intended public contracts
- Confirm no `any` or unsafe type assertions remain at boundaries
- Confirm cross-skill ownership boundaries are respected
