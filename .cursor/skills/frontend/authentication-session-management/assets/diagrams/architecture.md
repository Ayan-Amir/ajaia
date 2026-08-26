# Auth Session Architecture

Use this reference when the task requires end-to-end auth/session flow reasoning across routing, context, and API behavior.

## Mermaid Diagram

```mermaid
flowchart TD
  A[User Navigates] --> B{Route Type}
  B -->|Public| C[Render Public Page]
  B -->|Private| D[PrivateRoute Guard]
  B -->|Role Restricted| E[RoleRoute Guard]

  D --> F{isAuthenticated}
  F -->|No| G[Redirect to Login]
  F -->|Yes| H[Render Protected Page]

  E --> I{Has Required Role}
  I -->|No| J[Redirect to Forbidden/Unauthorized]
  I -->|Yes| H

  H --> K[HTTP Client Request]
  K --> L[Attach Token via Interceptor]
  L --> M{Response Status}

  M -->|2xx| N[Continue]
  M -->|401| O[clearSession]
  O --> P[Redirect to Login]
  M -->|403| Q[Keep Session]
  Q --> J

  R[Logout Action] --> O
```

## Boundary Notes
- Route guards own access entry decisions.
- Auth service owns token/session read-write and session clearing.
- HTTP client middleware owns token attachment and centralized `401/403` handling.
- Feature/page components consume `useAuth`; they do not own session persistence.
