---
name: optional-chaining-access
description: >-
  Use optional chaining (`?.`) when reading object keys that may be missing at
  runtime—e.g. `card?.description`, `user?.profile?.name`. Use when writing or
  reviewing TSX/TS property access, optional UI blocks, and API-shaped data.
  Pair with `&&` for optional JSX (see jsx-conditional-render). Do NOT use `?.`
  to paper over required domain data; fix types or guards at the boundary instead.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Optional Chaining on Property Access

## Rule

When a value may be `null` or `undefined` before you read a key, use **optional chaining** on the access path—not bare dot notation.

```tsx
// BAD — throws or assumes shape when parent is nullish
{card.description && <p>{card.description}</p>}
const title = job.request.title;

// GOOD
{card?.description && <p>{card.description}</p>}
const title = job?.request?.title;
```

Use `?.` on **each** segment of a nested path that can be absent:

```tsx
{request?.jobCard?.title}
{round?.dimensions?.length}
```

## JSX optional blocks

Combine with logical AND when the false branch is “render nothing”:

```tsx
{card?.description && (
  <p className='mt-1 line-clamp-2 text-xs text-ink-3'>{card.description}</p>
)}
```

After the `&&` guard, the inner `{card.description}` is safe when `card` was required for the row; prefer the same field you guarded (`card?.description` in the condition).

## When `?.` is appropriate

- Nullable state or props: `JobCard | null`, `user?: User`, partial API payloads
- Nested relations: `entity?.child?.field`
- Event handlers reading possibly cleared refs/state: `selection?.id`
- Defensive UI when parent can pass through undefined during loading transitions

## When NOT to rely on `?.` alone

- **Two real branches**: use ternary or early return, not `?.` + `&&` only
- **Must show `0` or `""`**: `count?.toString()` or `value &&` can hide valid falsy values; use `count != null` or explicit checks
- **Required invariants inside a subtree**: if `card` is required and always defined for that component, fix the type at the API/hook boundary; do not sprinkle `card?.` on every line without a nullish type or runtime reason

## Types

Align types with runtime: optional or nullable API fields should be `string | null | undefined` (or `?:`) in `#/types/`, then access with `?.` in UI. Optional chaining does not replace accurate types.

## Checklist

- [ ] Nullable roots use `obj?.key`, not `obj.key`
- [ ] Nested optional paths chain each segment: `a?.b?.c`
- [ ] Optional JSX blocks: `obj?.field && <Node />` (no `: null` ternary)
- [ ] No `?.` used to avoid fixing wrong required types at trust boundaries

## Related Skills

- `jsx-conditional-render` — `&&` for optional blocks; conditions like `card?.description`
- `type-definitions` — optional/nullable fields on API and props types
- `api-integration` — camelCased keys; null vs missing from backend
