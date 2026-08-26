# Troubleshooting

## UI never reflects a successful mutation

- Confirm `queryKey` used in `invalidateQueries` matches the list/detail key prefix.
- Check optimistic `setQueryData` shape matches what selectors expect.

## Duplicate network calls

- Look for `refetchOnWindowFocus` combined with aggressive keys.
- Ensure `enabled` guards dependent queries until IDs exist.

## Infinite query stuck / wrong page

- Verify `getNextPageParam` / `getNextPageParamHelper` logic against real payload (array vs `{ data, total }`).

## Type errors around `performRequest`

- Pass all three generics when payload/params are not empty objects: `performRequest<Response, Payload, Params>`.

## Case mismatch with backend

- Remember interceptors convert camelCase ↔ snake_case; send JS objects in camelCase in app code.
