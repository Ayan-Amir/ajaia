# Anti-patterns

## Memoization without measurement

Do not blanket-wrap components in `React.memo` or add `useMemo` for every derived value. That increases noise and can hide real issues.

Use React DevTools Profiler before and after, then keep only what helps.

## Index keys on mutable lists

Do not use `key={index}` for lists that reorder, filter, or accept inserts. It causes incorrect reconciliation and subtle UI bugs.

Use stable domain ids.

## Huge imports for one helper

Do not `import _ from 'lodash'` when a few tree-shakeable imports or native APIs suffice.

## Blocking the main thread in row render

Do not run heavy synchronous work inside every virtualized row render (parsing, sorting large arrays, regex on huge strings).

Precompute, memoize at list level, or move work off the hot path.

## Optimizing before correctness

Do not reorder pipeline steps to tune renders before behavior and data flow are correct.

Correctness first, then measure, then optimize.
