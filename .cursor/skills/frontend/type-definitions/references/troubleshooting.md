# Troubleshooting

## Type Mismatch Between API and Domain
Symptom:
- Mapper or service return type errors after backend changes.

Fix:
1. Update `*.api.types.ts` to exact backend payload.
2. Update mapper transformation.
3. Re-run `scripts/validate.sh`.

## `null` / `undefined` Confusion
Symptom:
- UI crashes when accessing optional fields.

Fix:
1. Model backend nullability exactly (`field: T | null`).
2. Keep optional only for truly omitted keys (`field?: T`).
3. Add guard logic in UI or mapper.

## Barrel Export Not Found
Symptom:
- Import errors from `@/types/<feature>`.

Fix:
1. Confirm the symbol is exported in `src/types/<feature>/index.ts`.
2. Confirm alias path resolution in `tsconfig`.
3. Restart TS server if editor cache is stale.

## Auth Types in Wrong Location
Symptom:
- Auth type definitions scattered across feature folders.

Fix:
1. Consolidate auth contracts into `src/types/auth/auth.types.ts`.
2. Replace duplicate type declarations with imports.
3. Keep auth context logic in `react-state-management`, not here.

## Ownership Conflict in PR Review
Symptom:
- Review feedback says this skill touched other-skill patterns.

Fix:
1. Remove non-owned implementations.
2. Leave only type boundaries relevant to this skill.
3. Reference owner skills in PR notes for follow-up implementation.
