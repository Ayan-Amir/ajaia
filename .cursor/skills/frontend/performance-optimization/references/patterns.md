# Performance patterns and workflows

Load this when applying or explaining render, structure, list, lazy-load, asset, or dependency performance work.

## Core rules

- Prevent avoidable re-renders before adding new features.
- Prefer small, focused components over monolith components.
- Never use array index as a key for dynamic lists.
- Defer heavy code and assets until needed.
- Limit repeated event-driven updates (typing, scrolling, resizing).
- Keep static assets lean and intentional.

## Render optimization (use selectively)

Apply only where measurable benefit exists:

- `React.memo` for children with stable props when the parent updates often.
- `useMemo` for expensive derived values used in render.
- `useCallback` for callbacks passed to memoized children.
- Keep state in the smallest subtree that needs it.
- Avoid new object, array, or function literals inline when passed down frequently and causing churn.

Checklist:

- Are rerenders caused by changing prop references?
- Can derived values be memoized?
- Is callback identity causing child rerenders?
- Is memoization adding value, not just complexity?

## Component splitting

Split large components when they:

- manage too many responsibilities,
- contain unrelated UI sections,
- cause broad rerenders for small updates.

Guidelines:

- Extract logical sections into presentational components.
- Move reusable stateful logic into custom hooks.
- Keep data-fetching boundaries clear.
- Prefer composition over deeply conditional JSX branches.

See `references/examples.md` for a before and after dashboard split.

## List rendering

- Use stable, unique keys from domain identifiers (`id`, `slug`, etc.).
- Do not use index keys for reorderable or mutable lists.
- Memoize row items when parent updates are frequent.
- For large collections, use virtualization (`react-window` or `react-virtualized`).

Virtualization triggers:

- If list size hurts scroll or render responsiveness, virtualize.
- Keep row components lightweight; avoid heavy synchronous work per row.

Implementation sample: `references/examples.md`.

## Lazy loading components

- Use `React.lazy` with `Suspense` for route-level and heavy feature chunks.
- Lazy load rarely visited panels, modals, and tooling UIs.
- Show clear fallback UI while loading.

See `references/examples.md` for the lazy import pattern.

## Debounce and throttle

- Debounce: search, autocomplete, filter typing.
- Throttle: scroll, resize, mousemove.

Guidelines:

- Stabilize handler references with `useCallback` where it matters.
- Clean up timers and subscriptions in `useEffect` cleanup.
- Prefer short delays; debounce over `500ms` usually feels unresponsive.

Hook example: `references/examples.md`.

## Static assets (`public/`)

- Place truly static runtime-served files only.
- Avoid dumping large, unused media.
- Do not duplicate assets across `src/` and `public/`.
- Prefer WebP or AVIF where applicable.
- Keep filenames clear and cache-friendly.
- Default max size per static asset: `500KB`. If exceeding, document justification and compress first.
- Large video or very high-resolution images: prefer CDN or external hosting over bundling.

Bundle note: assets imported from `src/` can bloat JS bundles; use `public/` when files should not be bundled.

## Lazy images

- `loading='lazy'` on non-critical images.
- Explicit `width` and `height` or reserved space to limit layout shift.
- Use `srcSet` and size-appropriate assets when needed.
- Prioritize above-the-fold hero media; lazy load below the fold.

## Third-party package guardrails

- Require explicit justification before adding heavy dependencies.
- Prefer tree-shakeable, ESM-friendly packages.
- Favor selective imports over namespace or full-library imports.
- Avoid new packages when existing utilities suffice.
- Reassess and remove unused dependencies periodically.

Review questions:

- What problem does the package solve that current deps cannot?
- What is the bundle-size impact?
- Is there a lighter alternative?
- Are imports in the most tree-shakeable form?

## Guardrails (never do these)

- Never use index keys for dynamic, reorderable, or mutable lists.
- Never add memoization without measurable reason.
- Never import entire utility libraries when selective imports work.
- Never place large media in the bundle when static or CDN delivery fits.
- Never debounce user input over `500ms` without strong justification.

## Performance review workflow

1. Identify expensive renders and broad rerender paths.
2. Apply minimal structural fixes first (split, state locality).
3. Add memoization only where rerender savings are expected.
4. Validate list keys; virtualize large data sets when needed.
5. Lazy load heavy components and non-critical images.
6. Re-test interaction smoothness and loading behavior.

## Agent output contract

When reporting performance issues:

- Prioritize by user impact (blocking or sluggish first).
- Reference exact files or components and the likely cause.
- Recommend the smallest safe fix with clear rationale.
- State trade-offs: complexity versus measurable gain.
- Avoid speculative micro-optimizations with no practical benefit.
