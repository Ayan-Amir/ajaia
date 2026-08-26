# Decisions

| Situation | Prefer |
| --- | --- |
| Broad parent rerenders vs memo everywhere | Split components and colocate state first; add `memo` or `useCallback` only when profiler shows benefit |
| Long list vs pagination | Pagination or windowing when data is large; virtualize when you must show a long scrollable list |
| `public/` vs `src/` import for media | `public/` for large or cacheable static files that should not touch the JS bundle |
| New dependency vs in-house utility | In-house or existing stack first; new dependency only with bundle and maintenance justification |
| Debounce delay | Start around `200–300ms` for search; avoid exceeding `500ms` for typed input |
