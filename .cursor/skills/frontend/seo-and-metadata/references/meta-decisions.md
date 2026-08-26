# Decisions

## SSR or SPA updates

| Situation | Prefer |
| --- | --- |
| Search-critical page with public content | SSR or framework metadata API |
| Authenticated page with client-only routing | SPA update may be enough if the page is not indexed |
| Mixed routing model | Keep one clear owner per route to avoid duplicate tags |

## Canonical policy

- Use a canonical when parameters, aliases, or duplicate paths can reach the same content.
- Keep the canonical absolute and aligned with the chosen host and trailing-slash policy.
- Do not point every faceted or paginated page at the homepage unless that behavior is intentional and reviewed.

## Robots policy

- Omit robots tags when the page should follow default index behavior.
- Use `noindex` deliberately for private, thin, or staging content.
- Treat authenticated routes as a separate policy decision rather than assuming public defaults are safe.
