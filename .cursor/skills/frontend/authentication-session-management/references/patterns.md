# Auth Session Patterns

## Ownership Boundaries
- Canonical auth type ownership belongs to `type-definitions`; consume existing contracts.
- Keep token/session read-write operations in `src/services/auth-service.ts` and `src/services/localStorage.ts`.
- Keep route access decisions in `src/routes/PrivateRoute.tsx` and `src/routes/RoleRoute.tsx`.
- Auth context implementation ownership belongs to `react-state-management`; consume via `src/hooks/useAuth.ts`.
- Do not duplicate these responsibilities in feature modules.

## Token Lifecycle Contract
`auth-service.ts` must expose these capabilities:
- `getAccessToken`: read token from approved storage.
- `setAccessToken`: write token to approved storage.
- `clearSession`: clear all auth/session state.
- `isAuthenticated`: evaluate session availability.

Implementation rules:
- Keep storage keys centralized.
- Keep token serialization/parsing centralized.
- Keep session invalidation deterministic.
- Keep route and API layers dependent on service contracts, not storage internals.

## API Auth Behavior Pattern
- Attach access token through centralized HTTP client middleware/interceptor.
- Handle terminal authentication failure (`401`) in one centralized location.
- Handle authorization failure (`403`) in one centralized location.
- Avoid per-component auth error handlers for shared flows.
- Do not define query client, logger, or telemetry abstractions here (owner: `logging-monitoring` and `api-integration-data-layer`).

## Guard and Routing Pattern
- Route protection must happen before page render.
- Private routes must redirect unauthenticated users to login.
- Role routes must redirect unauthorized authenticated users to forbidden/unauthorized page.
- Wildcard handling must be deterministic for both authenticated and unauthenticated users.

## Logout Pattern
- Clear session through service contract.
- Invalidate client-side cache/state dependent on auth identity.
- Redirect using history replacement to avoid returning to protected pages.
