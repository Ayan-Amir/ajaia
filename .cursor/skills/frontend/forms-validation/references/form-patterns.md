# Form Patterns

Use this reference for React Hook Form setup, `zodResolver`, default values, field
registration, submit wiring, and form UX.

## React Hook Form Setup

Use `react-hook-form` for form state and submission.

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { profileFormSchema, type ProfileFormData } from '@/schemas/profileFormSchema';

const methods = useForm<ProfileFormData>({
	resolver: zodResolver(profileFormSchema),
	mode: 'onChange',
	defaultValues: {
		fullName: '',
		email: '',
	},
});
```

Rules:

- Use existing Zod schemas through `zodResolver`.
- Keep standalone schema authoring in the `validation-schemas` skill.
- Infer or import form data types from the schema.
- Fully shape `defaultValues`.
- Never leave expected fields undefined unless intentional.
- Prefer `mode: 'onChange'` for live validation when suitable.

## Safe Default Values

Default values must be complete and safe.

```ts
const defaultValues: ProfileFormData = {
	fullName: '',
	email: '',
	phone: '',
	bio: '',
};
```

Rules:

- Use empty strings for text inputs.
- Use `null` only when the form field intentionally supports null.
- Use empty arrays for multi-select or checkbox groups.
- Use booleans for checkbox defaults.
- Avoid `undefined` for registered fields unless the schema and UI intentionally expect
  it.
- For controlled components, never pass `undefined` as a default value.

## Async Default Values

Use async `defaultValues` only when the form can own the async loading lifecycle.

```tsx
const methods = useForm<ProfileFormData>({
	resolver: zodResolver(profileFormSchema),
	mode: 'onChange',
	defaultValues: async () => {
		const profile = await getProfile();

		return {
			firstName: profile?.first_name ?? '',
			lastName: profile?.last_name ?? '',
			email: profile?.email ?? '',
		};
	},
});

const {
	formState: { isLoading },
} = methods;
```

Rules:

- Use `formState.isLoading` when async default values are loading.
- Keep returned default values fully shaped.
- Do not return `undefined` for expected fields.
- Prefer `reset(...)` when data loads outside the form or changes after mount.

## Safe API Mapping

When mapping API data into form values, destructure once with safe defaults.

```ts
const {
	first_name: firstName = '',
	last_name: lastName = '',
	email = '',
	phone = '',
} = profileResponse ?? {};

const defaultValues = {
	firstName,
	lastName,
	email,
	phone,
};
```

Rules:

- Never assume API fields exist.
- Prefer `??` over `||`.
- Use optional chaining and nullish coalescing for nullable data.
- Keep API-to-form mapping clear when names differ.

Bad:

```ts
const firstName = profileResponse?.first_name || '';
```

Good:

```ts
const firstName = profileResponse?.first_name ?? '';
```

## Field Registration

Use `register(...)` for native inputs.

```tsx
<label htmlFor='email'>Email</label>

<input
	id='email'
	type='email'
	{...register('email')}
/>

{errors.email ? (
	<p role='alert'>{errors.email.message}</p>
) : null}
```

Rules:

- Use `register` for simple native inputs.
- Connect labels with `htmlFor` and matching input `id`.
- Show field-level validation messages near the field.
- Expose errors accessibly with `role='alert'` or project-standard error primitives.

## Submit Wiring

Use `handleSubmit` and memoized submit handlers.

```tsx
const onSubmit = useCallback(
	async (data: ProfileFormData) => {
		await updateProfile(data);
	},
	[updateProfile],
);

return (
	<form onSubmit={handleSubmit(onSubmit)} noValidate>
		{/* fields */}
	</form>
);
```

Rules:

- Use `handleSubmit(onSubmit)` for validated submissions.
- Keep submit handlers memoized with `useCallback`.
- Clear prior form-level server errors before submit when applicable.
- Preserve user input after failed submit.
- Reset only after success when the product flow requires it.

## Submit Button State

Use form state to control submit behavior.

```tsx
const {
	formState: { isDirty, isValid, isSubmitting },
} = methods;

<button type='submit' disabled={!isDirty || !isValid || isSubmitting}>
	{isSubmitting ? 'Saving...' : 'Save changes'}
</button>;
```

Rules:

- Every button must declare `type`.
- Disable submit while submitting.
- Use `isValid` when validation state should block submit.
- Use `isDirty` for edit forms where unchanged saves should be blocked.
- For pure create forms, `!isDirty` is optional depending on UX.

## Form UX Rules

Every form must support:

- Field-level validation messages
- Submit loading state
- Disabled submit while submitting
- Safe fallback when initial data is missing
- Graceful failed-submit handling
- Preserved user input after submit failure

If the form is async-prefilled, also support:

- Loading or skeleton state
- Empty fallback values
- Non-crashing render before data arrives

## JSX And Styling Rules

Follow project-wide React and design-system conventions.

Rules:

- No inline JSX handlers.
- Memoize handlers passed to JSX.
- Do not use array index as a React key.
- No inline styles.
- No hardcoded color values.
- Reuse shared UI/form primitives before creating new ones.
- Use Tailwind utilities or design tokens only.

## Constants For Real Limits

Use constants for reusable limits and enum-like values.

```ts
export const PROFILE_FORM_LIMITS = {
	NAME_MAX: 100,
	BIO_MAX: 500,
} as const;
```

Rules:

- Use constants for character limits, file size limits, min/max values, and repeated
  config.
- Do not create constants for every small text string.
- Do not create constants for one-off validation messages.
