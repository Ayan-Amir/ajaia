# Troubleshooting

## Problem: Tailwind class seems ignored
- Check whether class tokens exist in `src/index.css`.
- Confirm utility name maps to active theme token names.
- Verify class is not overridden by a later conflicting utility.

## Problem: CVA variant outputs unexpected styles
- Confirm `defaultVariants` exists and keys match `variants` keys.
- Verify caller passes supported values only.
- Run lint/type checks to catch invalid `VariantProps` usage.

## Problem: `cn` merge not resolving conflicts
- Ensure `cn` uses both `clsx` and `tailwind-merge`.
- Confirm import path resolves to shared helper, not a duplicate implementation.
- Check for mixed arbitrary values that block proper merge semantics.

## Problem: Responsive behavior breaks at tablet size
- Re-check mobile-first base class at no prefix.
- Add only needed breakpoint overrides (`sm`, `md`, `lg`) in order.
- Inspect container width constraints and inherited grid/flex utilities.

## Problem: Review flags cross-skill overlap
- Remove non-styling ownership code from this change.
- Route concern to owner skills:
  - Query/data hooks -> `api-integration-data-layer`
  - Logging/Sentry/query client -> `logging-monitoring`
  - Error boundaries -> `error-boundaries`
  - Auth context -> `react-state-management`
  - Auth types placement -> `type-definitions`
  - Folder naming conventions -> `routing-navigation`

## Problem: `yarn` scripts fail with "missing script"
- Open project `package.json` and add expected scripts (`lint`, `typecheck`, `test`) or align script wrappers.
- Re-run `scripts/setup.sh` to ensure dependencies are installed.
