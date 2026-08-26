---
name: code-quality-and-linting
description: Use when enforcing ESLint, Prettier, and import-order standards on React TypeScript frontend code in this boilerplate. Do NOT use for API design, backend-only code, domain type modeling, or architectural component decisions without a lint/format focus — use api-integration, type-definitions, or component-architecture as appropriate.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Code Quality and Linting

## Stack Context

- Framework: React + TypeScript + Vite
- Lint: `eslint.config.ts`
- Format: `.prettierrc`
- Quality entrypoints: `package.json` scripts (`lint`, `lint-staged`)
- Application source: `src/` (JS/TS/TSX per project layout)
- Import alias: `@/` for internal paths (match `tsconfig` paths in the consuming repo)

## When To Use

- Writing or editing React TypeScript UI code and you must satisfy ESLint with zero warnings
- Fixing Prettier drift, import grouping, or unused import/variable issues
- Reviewing a PR or agent diff for style and static-analysis regressions
- Aligning changes with `lint-staged` pre-commit behavior

## Do Not Use

- Backend-only services, infra, or non-frontend packages — use the relevant backend or platform skill
- API client shapes, fetch/query patterns, or server error mapping as the primary task — use `api-integration`
- Zod schema authoring or validation-only work without a lint gate — use `validation-schemas`
- Component boundaries, composition, or props API design without lint/format enforcement — use `component-architecture`

## Folder Structure

React TypeScript boilerplate (typical):

```text
.
├── eslint.config.ts          ← ESLint flat config
├── .prettierrc               ← Prettier rules
├── package.json              ← lint, lint-staged scripts
└── src/
    ├── components/           ← shared UI
    └── features/             ← feature modules (example)
```

This skill package (`code-quality-and-linting`):

```text
code-quality-and-linting/
├── SKILL.md
├── references/
│   ├── patterns.md
│   ├── examples.md
│   ├── decisions.md
│   ├── anti-patterns.md
│   └── troubleshooting.md
└── scripts/
    └── lint.sh
```

## How To Apply

1. Read `references/patterns.md` for rules, import order, Prettier alignment, and agent response contract.
2. If you need exact commands or the mandatory output template, read `references/examples.md`.
3. If trade-offs arise (scoped fix vs config change), read `references/decisions.md`.
4. If fixing recurring failures, read `references/troubleshooting.md` and `references/anti-patterns.md` as needed.
5. After edits, run `scripts/lint.sh` from the **boilerplate project root** (execute; do not read the script for instructions).
6. Report findings using ONLY the template in `references/examples.md`.

## References

- For ESLint/Prettier rules, import order, pre-commit chain, and review contract → read `references/patterns.md`
- For commands and mandatory response markdown shape → read `references/examples.md`
- For fix vs disable vs scope decisions → read `references/decisions.md`
- For what not to do → read `references/anti-patterns.md`
- For common failure modes and fixes → read `references/troubleshooting.md`

## Scripts

- From the boilerplate root (where `package.json` lives), run this skill's `scripts/lint.sh` using its path inside your workspace (execute, do not read). The script verifies the current directory is the boilerplate root before running `yarn lint` and Prettier check.

## Pipeline

- Runs **alongside** every other frontend skill: any output from Component Architecture, Forms and Validation, Custom Hooks, or other frontend skills must pass this skill's standards before being considered complete.
- Depends on: nothing upstream for activation (quality gate applies whenever frontend code changes).
- Feeds into: CI and pre-commit; fixes here reduce churn in downstream PR review.

## Human Check

Before accepting agent output:

- Confirm zero ESLint errors/warnings in terminal output
- Spot-check import ordering in at least 2 modified files
- Verify no `any` types were introduced silently
- Confirm pre-commit hook passes on an actual commit
