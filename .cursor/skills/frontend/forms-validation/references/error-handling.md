# Error Handling

Use this reference for backend field errors, non-field errors, `setError(...)`, submit
failures, form-level errors, and preserving user input.

## Submit Error Flow

On submit failure:

1. Preserve the user’s current input.
2. Keep validation errors visible.
3. Map backend field errors with `setError(...)`.
4. Show non-field errors in a visible form-level location.
5. Optionally trigger a toast if the product uses global notifications.
6. Do not call `reset(...)` after a failed request.

## Field Errors

Use field errors when the backend error clearly belongs to one input.

Examples:

- Email already exists
- Username is taken
- Phone number is invalid
- Date range is invalid
- File exceeds allowed size

```tsx
setError('email', {
	type: 'server',
	message: 'This email is already in use',
});
```

Rules:

- Use `setError(...)` for field-specific backend errors.
- Attach the error to the matching form field.
- Keep backend field names mapped to frontend form field names.
- Do not show field-specific errors only in a toast.

## Non-Field Errors

Use form-level errors when the backend error is not tied to one field.

Examples:

- Invalid credentials
- Permission denied
- Could not save changes
- Server temporarily unavailable
- Object state conflict
- Generic `non_field_errors`

```tsx
const [formError, setFormError] = useState<string | null>(null);

const onSubmit = useCallback(
	async (data: LoginFormData) => {
		setFormError(null);

		try {
			await login(data);
		} catch {
			setFormError('Could not sign in. Please try again.');
		}
	},
	[login],
);
```

Rules:

- Show blocking non-field errors near the top of the form.
- Use a toast only as an addition, not the only error display.
- Do not hide important backend errors in the console.
- Keep error messages user-safe and actionable.

## Mapping Backend Field Errors

Create a mapper when backend field names differ from form names.

```ts
const FIELD_ERROR_MAP = {
	first_name: 'firstName',
	last_name: 'lastName',
	email: 'email',
} as const;
```

```tsx
type BackendFieldName = keyof typeof FIELD_ERROR_MAP;

function applyBackendFieldErrors(
	errors: Partial<Record<BackendFieldName, string>>,
	setError: UseFormSetError<ProfileFormData>,
) {
	Object.entries(errors).forEach(([backendField, message]) => {
		const formField = FIELD_ERROR_MAP[backendField as BackendFieldName];

		if (!formField || !message) return;

		setError(formField, {
			type: 'server',
			message,
		});
	});
}
```

Rules:

- Keep backend-to-form field mapping explicit.
- Avoid assuming backend field names match form field names.
- Do not use `any` in error mappers.
- Keep reusable mappers close to the feature unless shared by many forms.

## Clearing Previous Errors

Clear previous form-level errors before a new submit.

```tsx
const onSubmit = useCallback(
	async (data: ProfileFormData) => {
		setFormError(null);

		try {
			await updateProfile(data);
		} catch {
			setFormError('Could not save changes.');
		}
	},
	[updateProfile],
);
```

Rules:

- Clear old form-level errors before each new submit.
- Let React Hook Form manage field validation errors.
- Use `clearErrors(...)` only when intentionally clearing form field errors.

## Preserving User Input

Failed submits must not erase user input.

Bad:

```tsx
catch {
	reset();
}
```

Good:

```tsx
catch {
	setFormError('Could not save changes.');
}
```

Rules:

- Never call `reset(...)` after failed submit unless the product explicitly requires it.
- Preserve values so the user can fix and retry.
- Reset only after successful submit when the flow requires it.

## Server Error Shape

Normalize backend errors before applying them to the form.

```ts
type NormalizedFormError<FormField extends string> = {
	fieldErrors: Partial<Record<FormField, string>>;
	formError?: string;
};
```

Rules:

- Convert API-specific errors into a form-friendly shape.
- Keep HTTP/client-specific parsing outside the form component when possible.
- Keep the form component focused on displaying and applying errors.

## Form-Level Error UI

Render form-level errors accessibly.

```tsx
{
	formError ? (
		<div role='alert' aria-live='polite'>
			{formError}
		</div>
	) : null;
}
```

Rules:

- Use `role='alert'` or the project-standard error primitive.
- Place form-level errors where users can notice them before retrying.
- Keep messages clear and safe.

## Done Criteria

Backend error handling is correct when:

- Field errors appear on the correct fields.
- Non-field errors appear in a visible form-level location.
- User input is preserved after failed submit.
- Previous form-level errors clear on retry.
- Backend field names are mapped safely when they differ from form field names.
- Error messages do not expose sensitive internal details.
