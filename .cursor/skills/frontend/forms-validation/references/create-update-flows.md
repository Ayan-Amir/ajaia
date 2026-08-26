# Create Update Flows

Use this reference for create/edit flow differences, async hydration, `reset(...)`,
`isDirty`, `dirtyFields`, and partial update behavior.

## Create Form Behavior

Create forms usually start from empty defaults.

```tsx
const methods = useForm<CreateProfileFormData>({
	resolver: zodResolver(createProfileFormSchema),
	mode: 'onChange',
	defaultValues: {
		fullName: '',
		email: '',
		phone: '',
	},
});
```

Rules:

- Use safe empty defaults.
- Enable submit when the form is valid and ready.
- Use `isDirty` only if the product wants to prevent empty or unchanged create
  submissions.
- Reset after successful submit only when the product flow requires a cleared form.

## Edit Form Behavior

Edit forms must hydrate from existing data safely.

```tsx
const methods = useForm<ProfileFormData>({
	resolver: zodResolver(profileFormSchema),
	mode: 'onChange',
	defaultValues: {
		firstName: '',
		lastName: '',
		email: '',
	},
});
```

Rules:

- Initialize with safe empty defaults.
- Load server data asynchronously.
- Map API values into form-shaped values.
- Call `reset(...)` after data loads.
- Disable save until the user changes something when unchanged saves should be blocked.

## Async Hydration With Reset

Use `reset(...)` when edit-form data arrives after mount.

```tsx
const {
	reset,
	formState: { isDirty, isValid, isSubmitting },
} = methods;

useEffect(() => {
	if (!profileData) return;

	const {
		first_name: firstName = '',
		last_name: lastName = '',
		email = '',
	} = profileData ?? {};

	reset({
		firstName,
		lastName,
		email,
	});
}, [profileData, reset]);
```

Why this matters:

- `reset(...)` updates current form values.
- `reset(...)` updates React Hook Form’s internal default baseline.
- After reset, `isDirty` reflects user-made changes only.

Rules:

- Call `reset(...)` inside `useEffect` for async-loaded edit data.
- Avoid calling `reset(...)` before form subscriptions are ready.
- Prefer passing full form-shaped values to `reset(...)`.
- Keep reset payloads aligned with form defaults.

## Using `isDirty`

Use `isDirty` when the UI needs to know whether any registered field changed.

Common uses:

- Disable save buttons in edit forms.
- Warn before leaving with unsaved changes.
- Avoid unnecessary update API calls.
- Enable save UI only after meaningful user changes.

```tsx
<button type='submit' disabled={!isDirty || !isValid || isSubmitting}>
	{isSubmitting ? 'Saving...' : 'Save changes'}
</button>
```

Rules:

- Use `isDirty` for edit/save behavior.
- Do not rely on `isDirty` before async edit data has been reset into the form.
- For create forms, `isDirty` is optional and UX-dependent.

## Using `dirtyFields`

Use `dirtyFields` when the backend supports partial updates.

```tsx
const {
	getValues,
	formState: { dirtyFields },
} = methods;

const changedValues = Object.keys(dirtyFields).reduce<Partial<ProfileFormData>>(
	(acc, key) => {
		const fieldName = key as keyof ProfileFormData;

		return {
			...acc,
			[fieldName]: getValues(fieldName),
		};
	},
	{},
);
```

Rules:

- Use `dirtyFields` to know exactly which fields changed.
- Use it for PATCH-like partial updates.
- Do not overcomplicate forms with `dirtyFields` when the API expects full payloads.
- Keep partial payload building typed and easy to review.

## Full Update Payload

Use a full payload when the API expects the complete object.

```tsx
const onSubmit = useCallback(
	async (data: ProfileFormData) => {
		await updateProfile(data);
	},
	[updateProfile],
);
```

Rules:

- Submit the full validated payload when required by the API.
- Keep API mapping explicit if form shape differs from request shape.

## Partial Update Payload

Use partial payloads only when the API supports PATCH semantics.

```tsx
const onSubmit = useCallback(async () => {
	const values = getValues();

	const payload = Object.keys(dirtyFields).reduce<Partial<ProfileFormData>>(
		(acc, key) => {
			const fieldName = key as keyof ProfileFormData;

			return {
				...acc,
				[fieldName]: values[fieldName],
			};
		},
		{},
	);

	await updateProfile(payload);
}, [dirtyFields, getValues, updateProfile]);
```

Rules:

- Use partial update only when supported by the backend.
- Never send empty partial payloads.
- Keep changed-value mapping centralized.
- Prefer helper utilities if multiple forms need partial payloads.

## Switching Records In The Same Form

Call `reset(...)` when switching from one record to another.

```tsx
useEffect(() => {
	if (!selectedUser) return;

	reset(mapUserToFormValues(selectedUser));
}, [selectedUser, reset]);
```

Rules:

- Do not let one record’s dirty state leak into another record.
- Re-map values each time the selected record changes.
- Keep mapping functions safe and deterministic.

## Cancel Behavior

Use `reset(...)` to restore the last loaded form values.

```tsx
const handleCancel = useCallback(() => {
	reset();
}, [reset]);
```

Rules:

- Cancel should restore the current default baseline.
- If cancel should navigate away, use the routing/navigation skill.
- If cancel should show confirmation for unsaved changes, use `isDirty`.

## Done Criteria

A create/edit form flow is correct when:

- Create flow starts from safe empty defaults.
- Edit flow hydrates async data safely.
- `reset(...)` is used after async edit data loads.
- `isDirty` reflects user-made changes only.
- Save is disabled for unchanged edit forms when required.
- Partial updates use `dirtyFields` only when supported.
- Failed submits preserve user input.
