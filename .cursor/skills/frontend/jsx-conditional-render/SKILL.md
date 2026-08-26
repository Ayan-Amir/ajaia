---
name: jsx-conditional-render
description: >-
  Prefer logical AND for optional JSX instead of ternary with null else
  (description ? <CardDescription /> : null). Use when writing or reviewing React
  conditional render in TSX. Do NOT use for choosing between two different UI branches
  — use ternary or if/else when the false case is not "render nothing".
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# JSX Conditional Render (No `: null` Else)

## Rule

When the **false branch renders nothing**, do not use a ternary with `null`.

```tsx
// BAD
{description ? <CardDescription>{description}</CardDescription> : null}
{footer ? <CardFooter>{footer}</CardFooter> : null}

// GOOD
{description && <CardDescription>{description}</CardDescription>}
{footer && <CardFooter>{footer}</CardFooter>}
```

Same for fragments, alerts, and optional sections: **`{condition && <Node />}`**.

## When AND is correct

- Optional prop present → show a block (`description`, `footer`, `error`, `title`)
- Boolean gate (`isLoading`, `isError`) where false means omit UI
- Value is `string | undefined`, `ReactNode | undefined`, or boolean — falsy means “don’t render”

## When NOT to use AND (use ternary or branches)

- **Two different UIs**: `{isEditing ? <EditForm /> : <ReadView />}` — both branches are real content
- **Condition may be `0` or `""` you must display**: `count && ...` hides `0`; use `count != null && ...` or explicit ternary
- **Explicit else content**: `{hasItems ? <List /> : <EmptyState />}`

## Optional chaining in condition

Keep the condition readable; use `?.` when the object may be nullish (see `optional-chaining-access`):

```tsx
// GOOD — optional field on nullable or API-shaped object
{card?.description && <p>{card.description}</p>}
{description && <CardDescription>{description}</CardDescription>}
```

## Checklist

- [ ] No `? <Component /> : null` in JSX (grep for `: null}`)
- [ ] Optional blocks use `&&`
- [ ] Real alternate UI still uses ternary or early return

## Related Skills

- `one-component-per-file` — split optional blocks into named components, still use `&&` in parent
- `component-architecture` — composition and props optional fields
