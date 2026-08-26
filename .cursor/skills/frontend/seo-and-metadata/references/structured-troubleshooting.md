# Troubleshooting

## Validator reports errors

- Check for invalid JSON, missing quotes, trailing commas, or stringified values that should be objects or arrays.
- Confirm required fields for the chosen schema type are present and match the expected format.

## Rich results do not appear

- Verify the markup type is actually eligible for the rich result you expect.
- Confirm the visible page content supports the same claims as the schema.
- Resolve warnings that affect the target result, especially around offers, dates, ratings, or images.

## Duplicate or conflicting graphs

- Look for multiple emitters writing schema for the same entity.
- Reuse stable ids and a single owner when organization or publisher data is shared across pages.
