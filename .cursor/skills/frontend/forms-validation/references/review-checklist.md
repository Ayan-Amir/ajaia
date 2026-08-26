# Review Checklist

Use this reference for PR reviews, form audits, human verification checks, anti-pattern
detection, and done criteria.

## PR Review Checklist

### Form Setup

- [ ] Is React Hook Form used correctly?
- [ ] Is the form wired with `zodResolver(schema)`?
- [ ] Is the form type inferred or imported safely from the schema?
- [ ] Are `defaultValues` fully shaped and safe?
- [ ] Are nullable and optional values handled intentionally?

### Validation

- [ ] Does validation live primarily in Zod schemas?
- [ ] Are validation rules centralized instead of duplicated in UI handlers?
- [ ] Are reusable limits stored in constants where appropriate?
- [ ] Are schema field names aligned with form field names where reasonable?
- [ ] Are cross-field validation rules implemented cleanly?

### Async Edit Flows

- [ ] Does async edit data hydrate safely?
- [ ] Is `reset(...)` called after async data loads?
- [ ] Does `isDirty` behave correctly after hydration?
- [ ] Does switching records reset the form correctly?
- [ ] Are unchanged update submissions prevented when required?

### Submit Handling

- [ ] Is submit disabled correctly while submitting?
- [ ] Is submit blocked correctly for invalid forms?
- [ ] Is submit blocked correctly for unchanged edit forms when required?
- [ ] Are previous form-level errors cleared before retry?
- [ ] Is user input preserved after failed submit?

### Backend Error Handling

- [ ] Are backend field errors mapped with `setError(...)`?
- [ ] Are non-field errors displayed visibly?
- [ ] Are backend field names mapped safely if they differ from form field names?
- [ ] Are important backend errors shown somewhere actionable?
- [ ] Are sensitive backend details hidden from users?

### React And JSX Rules

- [ ] Are JSX handlers memoized with `useCallback`?
- [ ] Are there no inline JSX handlers?
- [ ] Does every button declare `type`?
- [ ] Are array indexes avoided as React keys?
- [ ] Are components reasonably small and focused?

### Styling And UI Rules

- [ ] Are shared form primitives reused before creating new ones?
- [ ] Are there no inline styles?
- [ ] Are there no hardcoded color values?
- [ ] Are Tailwind utilities or design tokens used consistently?
- [ ] Are loading and error states visually clear?

### Controlled And Dynamic Forms

- [ ] Is `Controller` used only when necessary?
- [ ] Do native inputs use `register(...)`?
- [ ] Do field arrays use `field.id` as keys?
- [ ] Is dynamic field config typed safely?
- [ ] Do multi-step forms preserve user input between steps?

### Accessibility

- [ ] Are labels connected with `htmlFor` and matching `id`?
- [ ] Are field errors exposed accessibly?
- [ ] Are form-level errors exposed accessibly?
- [ ] Are submit/loading states keyboard friendly?
- [ ] Are disabled states communicated clearly?

## Human Verification Checklist

### Validation Behavior

- Verify required fields validate correctly.
- Verify invalid input cannot submit.
- Verify validation messages appear at the correct time.
- Verify cross-field validation behaves correctly.

### Edit Flow Behavior

- Verify async edit data hydrates correctly.
- Verify unchanged edit forms cannot save when required.
- Verify `reset(...)` restores the correct values.
- Verify switching records updates form state correctly.

### Submit Behavior

- Verify loading states appear during submit.
- Verify submit buttons disable correctly.
- Verify successful submit flow behaves correctly.
- Verify failed submits preserve user input.

### Backend Errors

- Verify backend field errors appear on the correct fields.
- Verify non-field errors appear visibly.
- Verify retry behavior clears stale form-level errors.

### Accessibility

- Verify keyboard navigation works correctly.
- Verify labels and errors are announced correctly.
- Verify disabled states and loading states remain understandable.

## Anti-Patterns

### Inline JSX Handlers

Bad:

```tsx
<button onClick={() => onDelete(id)}>Delete</button>
```

Good:

```tsx
const handleDelete = useCallback(() => {
	onDelete(id);
}, [id, onDelete]);

<button type='button' onClick={handleDelete}>
	Delete
</button>;
```

### Unsafe API Mapping

Bad:

```ts
const firstName = profile?.first_name || '';
```

Good:

```ts
const firstName = profile?.first_name ?? '';
```

### Reset After Failed Submit

Bad:

```tsx
catch {
	reset();
}
```

Good:

```tsx
catch {
	setFormError(
		'Could not save changes.'
	);
}
```

### Validation Only In UI Handlers

Bad:

```tsx
if (value.length > 100) {
	showError();
}
```

Good:

- Keep validation rules centralized in Zod schemas.

### Controller Everywhere

Bad:

- Wrapping every simple input in `Controller`.

Good:

- Use `register(...)` for native inputs.
- Use `Controller` only for controlled components.

### Hardcoded Limits

Bad:

```ts
z.string().max(100);
```

Good:

```ts
z.string().max(PROFILE_FORM_LIMITS.NAME_MAX);
```

### Array Index Keys

Bad:

```tsx
items.map((item, index) => <div key={index} />);
```

Good:

```tsx
items.map(field => <div key={field.id} />);
```

### Losing User Input

Bad:

- Clearing form values after failed submit.
- Replacing form state unexpectedly during async updates.

Good:

- Preserve user-entered values until success or intentional reset.

## Done Criteria

A form task is complete only when:

1. React Hook Form is wired correctly.
2. Validation is schema-driven.
3. Default values are safe and complete.
4. Async edit data hydrates correctly.
5. `isDirty` and `dirtyFields` behave correctly.
6. Backend field and non-field errors are handled properly.
7. User input is preserved after failed submit.
8. Shared UI/form primitives are reused appropriately.
9. Accessibility requirements are met.
10. Project lint/type expectations pass.

## Expected Outcome

Following this standard should produce forms that are:

- type-safe
- scalable
- reusable
- accessible
- predictable
- resilient to async data
- safe for edit flows
- easy to review
- consistent across projects
- aligned with React Hook Form best practices
