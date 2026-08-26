# Auth Session Anti-Patterns

## Forbidden Patterns
- Storing tokens directly in components, pages, or feature hooks.
- Handling `401`/`403` ad hoc in multiple components.
- Relying on hidden UI elements instead of route guards for access control.
- Duplicating auth type definitions across feature folders.
- Writing session state directly from feature modules without service boundaries.
- Leaving wildcard/unmatched routes without deterministic redirects.

## Boundary Violations
- Component-level token parsing or storage key usage.
- Feature-level route auth checks that bypass shared guard components.
- Multiple independent logout flows with inconsistent redirect/cache behavior.

## Review Rejection Conditions
Reject changes if any of the following are present:
- Auth/session logic duplicated in pages that should live in services/routes/context.
- Inconsistent behavior between direct URL access and in-app navigation.
- `401` and `403` handled as equivalent outcomes.
- Unauthorized users can briefly render protected content before redirect.
