# Patterns

## Categories

- **Local:** `useState` / `useReducer` inside one feature subtree
- **Shared UI:** Context for low-churn auth-like data; Zustand for high-churn UI state
- **Server:** TanStack Query owns remote data — do not duplicate in stores

## Context providers

- Memoize the context value object; wrap functions in `useCallback`.
- Consumer hooks must `throw` when used outside the provider.

## Zustand

- Export fine-grained selectors (`useTheme`, `useSidebarOpen`) to limit re-renders.
- Apply `devtools` / `persist` only when product requirements demand it.

## Combining

- Components may read auth context, subscribe to UI store slices, and call `data/` hooks side by side — keep responsibilities separated.
