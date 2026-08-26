---
name: authentication-session-management
description: Use for frontend auth/session behavior in React apps, including route protection, unauthorized handling, and token/session boundaries. Do NOT use for backend auth issuance/policy, OAuth server callbacks, or domain-specific permission matrices. NOT for route guard component files or redirect logic — use routing-navigation.
allowed-tools: Read, Write, Edit, Bash, Grep
model: sonnet
---

# Authentication and Session Management

## Stack Context
- Framework: React + React Router
- Language: TypeScript
- Libraries/Tools: Axios, browser storage, route guards
- Primary location: `src/routes/`
- Secondary location(s): `src/services/`, `src/Context/`, `src/hooks/`, `src/types/auth/`

## When To Use
- Adding or changing login/logout/session behavior.
- Adding token attach/refresh handling in API clients.
- Implementing auth state consumed by route guards (useAuth hook, token handling, session persistence).
- Defining frontend `401` and `403` handling behavior.
- Refactoring auth/session ownership across routes, services, and hooks.

## Do Not Use
- Backend token issuance, rotation, revocation, or DB auth policy.
- OAuth provider server callback implementation.
- Feature-level permission matrices owned by domain/business rules.
- Auth context implementation internals owned by `react-state-management`.
- Canonical auth type location decisions owned by `type-definitions`.

## Folder Structure
```text
src/
├── types/
│   └── auth/
│       └── auth.types.ts
├── Context/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── routes/
│   ├── createBrowserRouter.tsx
│   └── index.ts
├── services/
│   ├── auth-service.ts
│   └── localStorage.ts
└── pages/
    ├── auth/
    │   └── LoginPage.tsx
    ├── ForbiddenPage.tsx
    └── UnauthorizedPage.tsx
```

## How To Apply
1. Map the requested change to one of: token lifecycle, session persistence, route guard, unauthorized flow.
2. Keep ownership boundaries intact (`services`, `routes`) and consume context/types from owner skills.
3. Apply guard-first enforcement for protected entries before page-level logic.
4. Apply centralized API auth behavior for token attach and terminal auth failures.
5. Validate boundary integrity, redirect behavior, and persona-based route access.
6. Run scripts in this folder for lint/type checks/tests.

## References
- For token lifecycle contracts and session helper boundaries: read `references/patterns.md`.
- For `401` vs `403`, redirect outcomes, and edge-case choices: read `references/decisions.md`.
- For forbidden implementations and ownership violations: read `references/anti-patterns.md`.
- For common auth failures and recovery steps: read `references/troubleshooting.md`.
- For system-level auth/session flow and boundaries: read `assets/diagrams/architecture.md`.
- For practical implementation scenarios: read `references/examples.md`.

## Scripts
- To prepare environment and dependencies: run `scripts/setup.sh` (execute, do not read).
- To lint auth-related changes: run `scripts/lint.sh` (execute, do not read).
- To run type checks and tests together: run `scripts/validate.sh` (execute, do not read).

## Pipeline
- Depends on:
  - `react-state-management` for shared context/state governance
  - `type-definitions` for canonical auth type contracts
  - `routing-navigation` for route naming and router conventions
  - `api-integration` for TanStack Query and API client ownership
  - `logging-monitoring` for logger/Sentry/queryClient ownership
  - `error-boundaries` for ErrorBoundary ownership
  - `validation-schemas` for RHF mode defaults ownership
- Feeds into:
  - API integration and data-layer skills
  - Error handling and resilience skills
  - Role-based access enforcement across feature modules

## Human Check
- Verify private/admin routes are inaccessible by direct URL for anonymous users.
- Verify `401` clears session and redirects to login.
- Verify `403` does not clear session and redirects to forbidden/unauthorized page.
- Verify logout clears session state and blocks back-navigation into protected screens.
- Verify auth state is consumed via `useAuth` and not rewritten in feature/page components.
- Verify no duplicate auth types are introduced outside `src/types/auth/auth.types.ts`.
- Verify no new `AuthContext` implementation was introduced in this skill scope.
- Verify no queryClient/logger/ErrorBoundary/RHF-default logic was added here.
