# Anti-patterns

## Disabling rules without ownership

Do not sprinkle `eslint-disable` comments to silence errors without user approval and a short justification tied to a ticket or ADR.

Prefer fixing the root cause or adjusting shared config once, intentionally.

## Broad refactors for style

Do not reformat unrelated files or entire trees when only one feature changed.

Keep diffs scoped to touched files unless the user asked for a repo-wide cleanup.

## `any` as escape hatch

Do not replace a type error with `any` to make CI green.

Use `unknown`, narrowing, generics, or fix the upstream type.

## Full-library imports

Do not import entire packages when only a few exports are needed if tree-shaking or selective imports are available.

## Ignoring import groups

Do not merge external and internal imports or drop blank lines between groups; ESLint `import/order` will fail.
