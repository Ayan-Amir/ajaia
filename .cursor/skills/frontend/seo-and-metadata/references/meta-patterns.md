# Patterns

## Core tags per indexable route

- Provide one clear `<title>` for each important URL.
- Add `meta name="description"` with a concise page summary rather than keyword stuffing.
- Use `link rel="canonical"` when multiple URLs can resolve to the same content.
- Apply `meta name="robots"` only when the page should intentionally diverge from normal indexing behavior.
- Keep the viewport tag mobile-friendly and avoid blocking zoom unless a reviewed accessibility exception exists.

## Rendering and update behavior

- Prefer SSR or framework metadata APIs when crawlers need the correct tags on first response.
- In SPAs, update head metadata on route change through a single owner so tags do not duplicate.
- Keep a clear source of truth for metadata values when routes can be driven by CMS content, route params, or static defaults.

## Dedupe rules

- Replace existing tags instead of appending duplicates.
- Keep title, description, and canonical ownership at the route or page boundary rather than scattering updates across nested components.
