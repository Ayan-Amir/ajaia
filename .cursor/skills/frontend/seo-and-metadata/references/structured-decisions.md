# Decisions

## Choose the schema shape

| Situation | Prefer |
| --- | --- |
| One dominant entity on the page | A single clear schema type |
| Sitewide identity plus page-specific content | A small `@graph` with stable ids |
| Reusable publisher or organization identity | Shared ids that page-level types can reference |

## Choose the markup owner

- Emit sitewide organization and website markup from a stable layout boundary.
- Emit page-specific schema from the route or template that owns the entity data.
- Avoid splitting one entity across several components unless the assembly path is very clear.

## Choose the update timing

- Generate markup server-side when search engines need the final content on first response.
- For client-generated pages, ensure schema is inserted from stable data and updated whenever the visible entity changes.
