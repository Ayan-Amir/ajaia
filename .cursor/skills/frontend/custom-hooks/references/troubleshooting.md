# Troubleshooting

## `react-hooks/exhaustive-deps` warnings

- Add missing values to the dependency array, or prove stability (move fn to `useCallback`, derive primitives).
- If the linter is wrong for a one-shot mount effect, document why and use the minimal eslint disable on that line only (rare).

## Infinite re-renders

- Check `useEffect` that sets state without a guard while depending on that state.
- Check deps that include objects/arrays created inline in the parent.

## Stale closures in async code

- Prefer deps that include the changing values, or read from refs updated each render.

## Memory leaks on route change

- Verify every `addEventListener`, `setInterval`, and subscription has a matching cleanup.
