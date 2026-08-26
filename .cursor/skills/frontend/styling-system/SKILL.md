---
name: styling-system
description: Use for React UI styling work that must enforce Tailwind utility usage, token governance, CVA variants, and responsive rules. NOT for component structure decisions (component-architecture), TypeScript type definitions (type-definitions), state shape design (react-state-management), or any non-UI work. NOT for accessible state styling that affects keyboard or ARIA behavior — use accessibility.
allowed-tools: Read, Write, Edit, Bash, Grep
model: sonnet
---

# Styling System

## Stack Context

- Framework: React + TypeScript + Vite
- Styling: Tailwind CSS with token mapping in `src/index.css` 
- Variant tooling: `class-variance-authority`, `clsx`, `tailwind-merge`
- Class merge helper location: `src/utils/cn.ts` (not `src/services/`)
- Shared primitives location: `src/components/ui/`

## When To Use

- Add or refactor semantic style tokens for reusable UI.
- Add or refactor CVA variants for component states/sizes.
- Replace hardcoded values with Tailwind utility + token patterns.
- Enforce responsive rules for mobile-first UI styling.

## Do Not Use

- Backend-only work, data-model updates, or non-UI tasks.
- TanStack Query hook patterns; use `api-integration`.
- `queryClient.ts`, logger/Sentry abstraction; use `logging-monitoring` (toast from `ui-states`).
- ErrorBoundary implementation; use `error-boundaries`.
- RHF mode defaults (`onBlur`); use `validation-schemas`.
- Auth context implementation; use `react-state-management`.
- Auth types file location; use `type-definitions`.
- Folder naming conventions; use `routing-navigation`.
- Accessible state styling that affects keyboard or ARIA behavior — use `accessibility`.

## Folder Structure

```text
src/
├── index.css                   # Tailwind import + @theme mapping + token values
├── utils/
│   └── cn.ts                   # clsx + tailwind-merge helper
│   └── breakpoints.ts          # Optional TS mirror of responsive breakpoints
├── components/
│   ├── ui/                     # Shared reusable UI primitives
│   └── ...                     # Feature-level components
```

Placement rules:

- Keep all global design tokens and token mapping in `src/index.css`.
- Keep class merge helper in `src/utils/cn.ts`; do not duplicate merge utilities.
- Place reusable primitive components in `src/components/ui/`; keep feature-specific components outside `ui/`.

## How To Apply

1. Confirm task scope is styling-system (not boundary-owner skill scope).
2. Read `references/patterns.md` for Token Definition, CVA Variant Pattern, and Naming Conventions.
3. Use `references/examples.md` for complete implementation examples.
4. Use `references/decisions.md` for edge cases and ownership boundaries.
5. Run `scripts/setup.sh` when dependencies are not ready.
6. Run `scripts/lint.sh` and `scripts/validate.sh` before handoff.

## References

- Core style implementation patterns: `references/patterns.md`
- Complete working code examples: `references/examples.md`
- Decision and ownership tables: `references/decisions.md`
- Bad-vs-good implementation anti-patterns: `references/anti-patterns.md`
- Common failures and fixes: `references/troubleshooting.md`
- System architecture diagram and flow: `assets/diagrams/architecture.md`

## Scripts

- `scripts/setup.sh` (execute, do not read)
- `scripts/lint.sh` (execute, do not read)
- `scripts/validate.sh` (execute, do not read)

## Pipeline

- Depends on: `routing-navigation`, `type-definitions`, `validation-schemas`, `react-state-management`.
- Feeds into: component implementation skills, design-system governance, and UI QA/review.
- Related: `tailwind-even-spacing-and-tokens` for even px spacing and CATS color utilities in `className`.

## Human Check

- Confirm `cn` references and examples use `src/utils/cn.ts` or `src/lib/cn.ts`, never `src/services/`.
- Confirm no inline `style={}` or repeated magic visual values were introduced.
- Confirm Token Definition was updated before component usage.
- Confirm CVA variants include `defaultVariants`.
- Confirm responsive behavior at phone/tablet/desktop widths.

