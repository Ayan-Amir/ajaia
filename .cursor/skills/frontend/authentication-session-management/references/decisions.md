# Auth Session Decisions

## Decision Table

| Situation | Required Decision | Rationale |
|---|---|---|
| API returns `401` and user is no longer authenticated | Clear session and redirect to login | Authentication is invalid; continue flow is unsafe |
| API returns `403` while user is authenticated | Keep session and redirect to forbidden/unauthorized page | Identity is valid, access is denied |
| Route is marked private and user is anonymous | Block route and redirect to login | Private content must never render for anonymous users |
| Route is role-restricted and user lacks role | Block route and redirect to forbidden/unauthorized page | Role access must be enforced at route boundary |
| User logs out | Clear session, invalidate dependent client state, redirect with replace | Prevent back-navigation into stale protected views |
| Unknown path (`*`) and user is authenticated | Redirect to default private/home route | Preserve authenticated navigation intent |
| Unknown path (`*`) and user is anonymous | Redirect to login | Keep unauthorized users out of private app shell |

## Conflict Resolution
- If route guard behavior conflicts with page-level checks, route guard wins.
- If service contract conflicts with ad-hoc storage use, service contract wins.
- If auth type location conflicts with local types, canonical auth types win.

## Cross-Skill Boundary
- Auth context implementation governance belongs to `react-state-management`; consume its conventions.
- Canonical auth type ownership aligns with `type-definitions`; coordinate before introducing new auth type files.
- Route naming and router conventions align with `routing-navigation`.
