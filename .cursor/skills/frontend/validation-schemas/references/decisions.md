# Decisions

## Validation design decision table

| Decision point | Choose A | Choose B | Rule |
|---|---|---|---|
| Create/update handling | Separate schemas | Single schema | Split when required fields differ by flow |
| Optional input normalization | `z.preprocess` | UI-level trimming | Keep normalization in schema layer |
| Cross-field constraints | `.superRefine` | Submit handler checks | Use schema so errors attach to field paths |
| RHF validation mode | `onBlur` | `onChange` | Default to `onBlur`; use `onChange` only for real-time UX |
| Server error handling | Shared mapper utility | Inline per component | Use shared mapper for consistency |

## Ownership decision table

| Pattern | Owner skill | Action in this skill |
|---|---|---|
| RHF mode defaults (`onBlur`) | `validation-schemas` | Define and enforce |
| TanStack Query hooks | `api-integration-data-layer` | Reference only |
| `queryClient.ts` and telemetry | `logging-monitoring` (+ `ui-states` for toast) | Reference only |
| Error boundary components | `error-boundaries` | Reference only |
| Auth context providers | `react-state-management` | Reference only |
| Auth types file location | `type-definitions` | Coordinate only |
| Folder naming conventions | `routing-navigation` | Reference only |

## File placement decisions

| File type | Path | Why |
|---|---|---|
| Domain schema | `src/validation/[domain]/*.schema.ts` | Central runtime validation source |
| Shared primitives | `src/validation/primitives.ts` | Prevent duplicate regex/rules |
| Validation messages | `src/validation/messages.ts` | Consistent UX text |
| Form hook | `src/features/[feature]/forms/use-*-form.ts` | Keep RHF logic near feature |
| API error mapper | `src/utils/form-errors.ts` | Reusable form error normalization |
