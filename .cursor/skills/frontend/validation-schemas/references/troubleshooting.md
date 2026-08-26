# Troubleshooting

## Resolver type mismatch
- Symptom: TypeScript error around `zodResolver(schema)` and `useForm<T>()`.
- Cause: Generic type does not match inferred schema type.
- Fix:
  1. Export `type FormInput = z.infer<typeof schema>` from the schema file.
  2. Use `useForm<FormInput>({...})`.

## Errors not shown under fields
- Symptom: API rejects payload but form displays only a generic error.
- Cause: Backend error keys do not match form field names.
- Fix:
  1. Normalize backend keys in `applyApiErrors`.
  2. Map only known RHF paths.
  3. Return non-field errors as a global message.

## Form validates too aggressively
- Symptom: Errors show while typing every character.
- Cause: `mode` set to `onChange` by default.
- Fix:
  1. Set `mode: "onBlur"`.
  2. Keep `reValidateMode: "onChange"`.
  3. Override only for explicit real-time UX requirements.

## Create flow and update flow conflict
- Symptom: Edit screen forces create-only fields.
- Cause: Shared schema enforces required create fields on update.
- Fix:
  1. Split schemas by flow.
  2. Use update schema with partial fields as needed.

## Lint or test script failure
- Symptom: `scripts/lint.sh` or `scripts/validate.sh` exits early.
- Cause: Missing yarn scripts in `package.json`.
- Fix:
  1. Add `lint`, `typecheck`, and `test` scripts to the project.
  2. Re-run `scripts/setup.sh` then rerun validation scripts.
