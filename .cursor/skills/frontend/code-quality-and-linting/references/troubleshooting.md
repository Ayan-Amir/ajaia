# Troubleshooting

## ESLint reports import order violations

1. Re-group imports per `references/patterns.md` (`builtin` → `external` → internal/parent/sibling/index).
2. Add the required blank line between groups.
3. Alphabetize within each group.
4. Re-run `scripts/lint.sh` (execute, do not read).

## Prettier and ESLint conflict

1. Confirm the project uses the repo `.prettierrc` and `eslint.config.ts` (not editor-only defaults).
2. Run Prettier then ESLint fix in that order (matches `lint-staged`).

## Hooks rules errors

1. Ensure hooks are not called conditionally or after early returns.
2. Extract logic into named functions or custom hooks if a component must branch before hooks.

## Unused vars after refactors

Remove dead imports and variables; if a value is intentionally unused, rename to a leading underscore only if the project ESLint config allows it.
