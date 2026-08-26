# Troubleshooting

## Profiler shows unchanged child rerendering

1. Check prop identity: are objects or inline functions recreated each parent render?
2. Colocate state or split the parent so fewer children subscribe to updates.
3. Only then add `memo` or stabilize callbacks with `useCallback` if the child is expensive.

## Virtualized list blank or wrong rows

1. Confirm `itemCount` matches data length and `itemSize` matches real row height for fixed lists.
2. For variable heights, use `VariableSizeList` and maintain a size map.
3. Ensure row keys and `itemData` reference stay stable across renders.

## Lazy route flashes or errors

1. Wrap lazy trees in `Suspense` with an intentional fallback.
2. Confirm dynamic import paths resolve (`@/` alias matches Vite config).
3. Handle chunk load failures if the app supports retry or error UI.

## Layout shift on images

Add explicit dimensions or aspect-ratio CSS and reserve space before the image loads.

## Bundle grew after a dependency add

1. Compare build output or bundle report before and after.
2. Switch to selective imports or a lighter package.
3. Lazy load the feature that owns the dependency if it is rarely used.
