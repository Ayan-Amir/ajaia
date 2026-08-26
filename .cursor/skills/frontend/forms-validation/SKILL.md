---
name: forms-validation
description:
  Use when creating, updating, reviewing, or refactoring React Hook Form implementations,
  form state wiring, create/edit flows, default values, dirty state, submit handling,
  backend error mapping, and form UX in React + TypeScript apps. Do NOT use for standalone
  Zod schema authoring, API service design, UI component architecture, routing, or backend
  validation policy.
  NOT for making form fields, labels, or validation errors accessible — use accessibility.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Forms Validation

## Stack Context

- Framework: React + TypeScript + Vite
- Form library: React Hook Form
- Validation integration: Zod schemas consumed through `@hookform/resolvers`
- Styling: Tailwind CSS + project design system
- Shared form components: `src/components/forms/`
- Shared UI components: `src/components/ui/`
- Feature form components: `src/features/[feature]/components/`
- Feature form hooks: `src/features/[feature]/hooks/`
- Schema source: existing schemas from `src/schemas/` or `src/features/[feature]/`
- Constants: `src/constants/` or feature-local constants

## When To Use

- Creating a new React Hook Form form
- Updating or refactoring an existing form implementation
- Wiring an existing Zod schema through `zodResolver`
- Mapping API data into safe form default values
- Handling create versus edit form behavior
- Using `isDirty`, `dirtyFields`, `reset`, `isValid`, or `isSubmitting`
- Mapping backend field and non-field errors into the form
- Reviewing form accessibility, loading states, submit states, and validation UX

## Do Not Use

- Standalone Zod schema authoring or schema refactoring — use `validation-schemas`
- API service design, mutation architecture, or request client patterns
- Domain model typing unrelated to form data
- Shared UI primitive design or component architecture
- Routing, navigation, or route action ownership
- Backend validation policy or database constraints
- Global toast, logging, or monitoring architecture
- Making form fields, labels, or validation errors accessible — use `accessibility`

## Folder Structure

```txt
src/
  components/
    forms/
      SharedFormField.tsx
      FormErrorMessage.tsx

  features/
    [feature]/
      components/
        FeatureForm.tsx
      hooks/
        useFeatureForm.ts
      constants/
        featureFormLimits.ts

  schemas/
    featureFormSchema.ts
```

Use feature-local structure when the form belongs clearly to one feature. Use shared
`components/forms/` only for reusable form primitives.

## How To Apply

1. Check whether the task is about form implementation, form state, default values, submit
   behavior, or error mapping.
2. Use an existing Zod schema; if the task is mainly schema authoring, switch to the
   `validation-schemas` skill.
3. Read only the relevant reference file listed below.
4. Wire React Hook Form with `zodResolver(schema)` and typed form data.
5. Provide complete safe `defaultValues`.
6. For async edit data, map the response safely and call `reset(...)`.
7. Handle submit loading, dirty state, validation state, backend errors, and accessible
   error display.
8. Run the project’s existing lint, typecheck, and test commands after changes.

## References

- For React Hook Form setup, `zodResolver`, default values, field registration, submit
  wiring, and form UX → read `references/form-patterns.md`
- For create/edit flow differences, async hydration, `reset(...)`, `isDirty`,
  `dirtyFields`, and partial update behavior → read `references/create-update-flows.md`
- For backend field errors, non-field errors, `setError(...)`, submit failures, and
  preserving user input → read `references/error-handling.md`
- For `Controller`, controlled inputs, dynamic forms, multi-step forms, and `FormProvider`
  → read `references/controlled-dynamic-forms.md`
- For complete form implementation examples → read `references/examples.md`
- For review checks, human verification checks, done criteria, and anti-patterns → read
  `references/review-checklist.md`

## Scripts

- No bundled scripts for this skill.
- Run the project’s existing lint, typecheck, and test commands after form changes.
- Execute project scripts directly; do not copy command details into this skill unless the
  project standardizes them.

## Pipeline

- Depends on: validation schemas, shared UI components, form field primitives, API
  response types, mutation/error conventions
- Coordinates with: `validation-schemas`, type definitions, api-integration,
  custom-hooks, UI states, accessibility standards
- Feeds into: create flows, edit flows, onboarding flows, account settings, admin forms,
  route actions, and backend mutation workflows

## Human Check

- Verify required field validation appears at the correct time.
- Verify invalid data cannot be submitted.
- Verify create forms submit valid new data correctly.
- Verify edit forms hydrate async data correctly.
- Verify edit forms do not submit unchanged data when that behavior is required.
- Verify backend field errors appear on the correct fields.
- Verify non-field submit errors appear in a visible form-level location.
- Verify user input is preserved after failed submit.
- Verify submit buttons show loading and disabled states correctly.
- Verify labels, errors, disabled states, and keyboard behavior are accessible.
