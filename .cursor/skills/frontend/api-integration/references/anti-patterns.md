# Anti-patterns

| Do not | Do instead |
| --- | --- |
| Import `axiosInstance` in route/page components | Export a `data/<feature>` hook wrapping `performRequest` |
| Duplicate server rows in Zustand | Keep server data in React Query cache only |
| Skip invalidation after mutations that affect lists | `invalidateQueries` / targeted `setQueryData` |
| Use `any` for API payloads | Define DTO interfaces under `src/types` |
| Put `onSuccess` UI toasts only inside shared hooks | Allow call-site callbacks for UX variation |
| Name files `useGetPosts.ts` under `data/` | File `getPosts.ts`, export `useGetPosts` |
| Ignore `isError` in UI | Render error state + logging as per project standards |
