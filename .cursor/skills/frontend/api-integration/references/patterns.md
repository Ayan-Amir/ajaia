# Patterns — API layer

## Layering

Components import hooks from `src/data/<feature>/`. Hooks call `performRequest`. `axiosInstance` stays in services.

## `performRequest`

Typed wrapper around `axiosInstance.request`:

- Always specify `method`, `url`, and generics for response/payload/params when non-trivial.
- Return `res.data` only; interceptors handle case conversion.

## Axios instance

- `baseURL` from env (`VITE_BACKEND_BASE_URL`).
- Request interceptor: attach bearer token from storage; snake_case keys on `data`/`params` (skip `FormData`).
- Response interceptor: camelCase `response.data` and error payloads.

## Constants

- `apiEndpoints`: path strings or builders `(id) => ...`
- `queryKeys`: string tokens reused as first element of `queryKey` arrays
- `GET` / `POST` / `PUT` / `DELETE` lowercase literals from `generic.ts`

## Query hook shape

- Export `useGetThing` from `getThing.ts` (file name **without** `use` prefix).
- `queryKey` includes params objects when list filters vary: `[queryKeys.POSTS, params]`.
- Use `enabled` for dependent IDs.

## Mutation hook shape

- Invalidate or update caches in `onSuccess` / `onSettled` / optimistic handlers.
- Prefer `mutate(data, { onSuccess })` at call sites for UI toasts (v5-friendly).

## Infinite scroll

- Prefer `useInfiniteScrollQuery` from `networkRequestService` when listing pages.
- Align `getNextPageParam` with backend shape; use `getNextPageParamHelper` for common array/paginated objects.

## Errors

- Surface `isError` / `error` in UI; configure `retry` thoughtfully (`false` for deterministic 4xx).
