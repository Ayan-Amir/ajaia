# Decisions

## `staleTime`

| Data profile | Guidance |
| --- | --- |
| Feeds / notifications | Default `0` (always stale) |
| Profile / settings | ~5 minutes |
| Rarely changing lookups | `Infinity` |

Also tune `gcTime` when large lists should leave memory quickly after unmount.

## Retries

- Keep React Query default (`3`) for transient network failures.
- Set `retry: false` for deterministic `4xx` where replaying is harmful or useless.

## Mutation side effects

- Prefer `mutate(vars, { onSuccess, onError })` at the call site for UI-specific work.
- Shared invalidation can live in the hook’s `onSuccess` when every caller needs the same cache behavior.

## Optimistic updates

- Use when perceived latency matters; always snapshot prior cache and roll back in `onError`.
- Always refetch or invalidate in `onSettled` when server is source of truth.

## Query key shape

- Lists: `[queryKeys.RESOURCE, paramsObject]`
- Detail: `[queryKeys.RESOURCE_DETAIL, id]`
- Related: `[queryKeys.RELATED, parentId, childParams]`
