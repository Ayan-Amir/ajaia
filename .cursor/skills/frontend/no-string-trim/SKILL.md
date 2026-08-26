---
name: no-string-trim
description: >-
  Frontend string-handling rule for agent-written code: do not use trim, trimStart,
  or trimEnd. Use when writing or reviewing React/TypeScript forms, URL/query parsing,
  auth flows, API payload shaping, Zod schemas, or any user-facing string input.
  Use when the user asks for frontend good practices or to avoid trim in AI-generated code.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# No String Trim (Frontend)

## Rule

**Do not add or keep `trim`, `trimStart`, or `trimEnd` in frontend code you write or change.**

This includes optional chaining forms such as `value?.trim()`, defaulting with `?? ''` after trim, and Zod preprocess/transform steps whose only job is trimming.

## When To Apply

- New or edited form fields, search boxes, and filters
- Query string, hash, or route param parsing
- Normalizing email, token, or code values before API calls
- Zod schemas and React Hook Form default values
- Code review or refactors touching string inputs

## Exceptions (only these)

1. The user **explicitly** asks to trim strings or to preserve existing trim behavior unchanged.
2. You are **only** deleting trim to comply with this rule (replace with validation, not a different silent mutation).

## Why

- Trimming **mutates meaning** before validation; users cannot see what was removed.
- Duplicated trim at URL, form, and API layers causes inconsistent behavior and hard-to-debug mismatches.
- Whitespace rules belong in **validation** (fail with a clear message) or on the **backend** (single normalization boundary), not as silent frontend cleanup.

## Do Instead

| Need | Pattern |
|------|---------|
| Reject empty or whitespace-only input | Zod `.min(1, …)` or a `.refine` with an explicit message |
| Reject leading/trailing spaces | Zod `.refine((v) => !/^\s|\s$/.test(v), …)` or a regex that encodes the rule (no `trim`) |
| Optional empty field | `z.union([z.literal(''), z.string().min(1)])` or `.optional()` with explicit empty handling |
| Compare two strings | Compare raw values; if product requires exact match, validate both sides the same way |
| URL/query values | Read with `searchParams.get(...)` (or equivalent) and validate; do not strip before validation |
| API payload | Send the validated form value; let the backend normalize if the contract requires it |

## Anti-patterns (do not write)

```typescript
// BAD — silent mutation
const email = searchParams.get('email')?.trim() ?? '';
onSubmit({ name: data.name.trim() });

// BAD — trim hidden in schema
z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string());
```

```typescript
// GOOD — validate, keep user-visible value
const email = searchParams.get('email') ?? '';
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email'),
});
```

## Checklist Before Finishing

- [ ] No new `.trim()`, `.trimStart()`, or `.trimEnd()` in the diff
- [ ] Whitespace rules are expressed as validation (or documented backend normalization), not silent trim
- [ ] Existing trim removed only when this task touches that code and replacements use the patterns above

## Related Skills

- Schema and field rules: `validation-schemas`
- Form wiring and submit payloads: `forms-validation`
