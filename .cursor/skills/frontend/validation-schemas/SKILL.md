---
name: validation-schemas
description: Use when creating or updating Zod schemas and React Hook Form validation behavior for frontend forms. Do NOT use for API/domain types, TanStack Query data hooks, ErrorBoundary or logger setup, auth context, or routing conventions. NOT for wiring Zod schemas to React Hook Form (forms-validation owns that integration). z.infer<> types derived from form schemas live with the schema in src/validation/, not in src/types/.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Validation Schemas

## Stack Context
- Framework: React + TypeScript + Vite
- Validation: Zod + @hookform/resolvers
- Form library: React Hook Form
- Schema location: `src/validation/`
- Form hooks location: `src/features/[feature]/forms/`
- Error mapping utility location: `src/utils/form-errors.ts`

## When To Use
- Create a new schema for a React Hook Form flow
- Update required or optional field constraints in Zod
- Add cross-field validation (for example confirm password)
- Split create and update schemas with different requiredness
- Set or review RHF mode defaults (`mode: "onBlur"`, `reValidateMode: "onChange"`)
- Map backend field errors into `setError`

## Do Not Use
- API response/request types or auth type ownership; use `type-definitions`
- TanStack Query hooks, server cache keys, or data fetching patterns; use `api-integration`
- `queryClient.ts`, logger, Sentry, or global telemetry patterns; use `logging-monitoring` (toast integration belongs to `ui-states`)
- Error boundary implementation details; use `error-boundaries`
- Auth context implementation; use `react-state-management`
- Folder naming conventions; use `routing-navigation` (lowercase kebab-case)

## Folder Structure

Use this structure when creating or updating validation artifacts:

```text
src/
├── validation/
│   ├── index.ts                    # Barrel exports
│   ├── primitives.ts               # Reusable field schemas (email, phone, ids, money)
│   ├── messages.ts                 # Validation message constants
│   ├── helpers.ts                  # Utility helpers (trim, empty-to-undefined, date coercion)
│   ├── auth/
│   │   ├── login.schema.ts
│   │   ├── register.schema.ts
│   │   └── reset-password.schema.ts
│   ├── user/
│   │   ├── user-create.schema.ts
│   │   └── user-update.schema.ts
│   └── shared/
│       ├── address.schema.ts
│       └── pagination.schema.ts
├── features/
│   └── [feature]/
│       ├── forms/
│       │   └── use-[feature]-form.ts  # RHF setup with zodResolver
│       └── components/
└── utils/
    └── form-errors.ts               # API error -> RHF setError mapper
```

Placement rules:
- Put schemas in `src/validation/[domain]/`.
- Put reusable primitives/messages in `src/validation/primitives.ts` and `src/validation/messages.ts`.
- Put internal-only utility helpers in `src/validation/helpers.ts`.
- Put RHF form hooks in `src/features/[feature]/forms/`.

## How To Apply
1. Confirm the request is form validation scope, then reject out-of-scope ownership using `Do Not Use` rules.
2. Read `references/patterns.md` for baseline schema composition and RHF defaults.
3. Read `references/decisions.md` before choosing create/update split, coercion strategy, or refinement location.
4. Copy and adapt complete patterns from `references/examples.md`.
5. Check `references/anti-patterns.md` to avoid duplicate UI validation or cross-skill leakage.
6. Run `scripts/setup.sh`, then run `scripts/lint.sh` and `scripts/validate.sh` (execute scripts, do not read).
7. Use `references/troubleshooting.md` for failures, and confirm architecture fit with `assets/diagrams/architecture.md`.

## References
- Load `references/patterns.md` for canonical Zod + RHF integration patterns.
- Load `references/examples.md` for complete working code you can apply directly.
- Load `references/decisions.md` for edge-case decision tables.
- Load `references/anti-patterns.md` for bad-vs-good guardrails.
- Load `references/troubleshooting.md` when lint/type/test validation fails.
- Load `assets/diagrams/architecture.md` for boundaries and data flow.

## Scripts
- Run `scripts/setup.sh` to install dependencies with `yarn` (execute, do not read).
- Run `scripts/lint.sh` to run project lint checks with `yarn` (execute, do not read).
- Run `scripts/validate.sh` to run type checks and tests with `yarn` (execute, do not read).

## Pipeline
- Depends on: `type-definitions` for API/auth type contracts and `routing-navigation` for route-level naming constraints.
- Feeds into: form components, API submit handlers, and UX error presentation layers.
- Ownership note: this skill owns RHF validation mode defaults; it does not own data-layer, logging, error boundary, auth context, or routing patterns.

## Human Check
- Verify schema field names match backend API contract exactly.
- Verify `mode: "onBlur"` is used unless a real-time UX case justifies override.
- Verify create/update schemas are split when requiredness differs.
- Verify backend field errors map to the correct form keys.
- Verify no component submit handler duplicates schema logic.
- Verify `yarn` lint/type/test commands pass in project CI context.
