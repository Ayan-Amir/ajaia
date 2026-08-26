# Lint and format patterns

Use this file when applying or explaining ESLint, Prettier, import order, or pre-commit expectations.

## Non-negotiable rules

- Never introduce `any`; use proper types or `unknown` plus type guards.
- Semicolons required.
- Single quotes for JS/TS and JSX attributes.
- Remove unused imports and unused variables.
- Keep React hooks valid (`react-hooks/rules-of-hooks`).
- Avoid `console.log`; only `console.warn` and `console.error` are allowed.
- Do not use array index as React list key for dynamic lists.
- Keep Unix line endings.

## Import order (`import/order`)

1. `builtin`
2. `external`
3. `internal`, `parent`, `sibling`, `index`

Additional requirements:

- One blank line between import groups.
- Alphabetize imports ascending, case-insensitive.
- Treat `react` and `react-dom/client` as prioritized top imports.
- Treat `@/**/*` as internal alias imports (align with project tsconfig paths).
- Use consistent type imports (`@typescript-eslint/consistent-type-imports`).

## Prettier (from `.prettierrc`)

- `singleQuote: true`
- `jsxSingleQuote: true`
- `semi: true`
- `trailingComma: es5`
- `tabWidth: 2`
- `printWidth: 120`
- `arrowParens: avoid`

## Pre-commit (`lint-staged`)

- Prettier runs first on `*.{js,jsx,ts,tsx}`.
- ESLint fix runs second on `*.{js,jsx,ts,tsx}`.

Proposed changes must stay compatible with this chain.

## Agent response contract

When reviewing or fixing code quality:

- Prioritize by severity: errors first, then warnings.
- Reference exact files and impacted rules.
- Prefer minimal, safe diffs over broad rewrites.
- If a rule must change, explain why and update config intentionally.
- Never bypass lint rules without explicit user approval.
