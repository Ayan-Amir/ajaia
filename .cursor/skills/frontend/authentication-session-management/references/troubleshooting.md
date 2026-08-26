# Auth Session Troubleshooting

## Symptom: User appears logged in but API calls fail with `401`
Checks:
- Confirm token attach middleware/interceptor is active on the correct HTTP client.
- Confirm token read path uses `auth-service` contract.
- Confirm stale/invalid token is cleared on terminal auth failure.

## Symptom: Authenticated user is redirected to login on role-only failure
Checks:
- Confirm `403` path redirects to forbidden/unauthorized page, not login.
- Confirm session clear is only on `401` terminal auth failures.

## Symptom: Protected page briefly flashes before redirect
Checks:
- Confirm guard evaluates before protected page render.
- Confirm fallback/loading branch does not render protected content.

## Symptom: Logout returns to protected page on browser back
Checks:
- Confirm logout redirect uses history replacement.
- Confirm session clear and client cache invalidation happen before redirect completion.

## Symptom: Different behavior between direct URL and in-app navigation
Checks:
- Confirm guard logic is route-level and not component-local.
- Confirm router entries for private and role-restricted paths use the same guard composition.

## Escalation Rule
If behavior remains inconsistent after checks:
- Validate boundary ownership first (`types`, `services`, `routes`, `context/hooks`).
- Compare implementation against `references/patterns.md` and `references/decisions.md`.
- Do not patch with local exceptions; fix the shared boundary.
