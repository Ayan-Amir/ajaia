# Patterns

## JSON-LD first

- Prefer JSON-LD inside `<script type="application/ld+json">` blocks for search-facing schema markup.
- Keep the schema aligned with visible page content and stable URLs.
- Use absolute URLs for ids, canonical references, logos, images, and offer links.

## Entity alignment

- Choose schema types that match the primary entity shown on the page.
- Keep required and recommended fields together so validation happens against a coherent entity definition.
- Regenerate markup when CMS content, prices, dates, or other entity data changes.

## Validation mindset

- Fix hard errors first because invalid markup is often ignored entirely.
- Treat warnings as real review items when the page depends on rich-result eligibility.
- Avoid multiple conflicting graphs that describe the same entity differently.
