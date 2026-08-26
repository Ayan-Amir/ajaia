# Custom hook patterns

## Naming

- Shared utilities: `useToggle`, `useDebounce`, `useLocalStorage`
- Feature hooks: `useProfile`, `useDashboard`
- Query/mutation hooks live under `src/data/` and follow **api-integration** naming (`useGetPosts` exported from `getPosts.ts`)

## Principle

Extract reusable logic into hooks; keep components focused on rendering.

## Dependencies

- List every value from component scope used inside `useEffect` / `useCallback` / `useMemo` in the dependency array.
- For unstable objects, depend on primitives (`options.page`) or memoize the object in the parent.

## Stable references

- Passing callbacks into effects: parent should `useCallback`, or hold latest fn in `useRef` and read `.current` inside the effect so the effect deps stay minimal.

## Cleanup

- Subscriptions: unsubscribe in the effect cleanup.
- `fetch`: use `AbortController` and abort on cleanup.
- Timers: `clearInterval` / `clearTimeout` in cleanup.

## Memoization

- `useMemo` for expensive derivations or referential stability when passed deep as props.
- Avoid memoizing trivial string concat or primitive compares.

## Rules of hooks

- Only call hooks at the top level of React functions (components or custom hooks).
- Never call hooks inside loops, conditions, or nested non-hook functions.

## TanStack Query

All `useQuery` / `useMutation` / infinite-query patterns are owned by the **api-integration** skill — do not duplicate here.
