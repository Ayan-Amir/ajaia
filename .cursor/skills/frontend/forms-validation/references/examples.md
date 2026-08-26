# Examples

Use this reference for complete React Hook Form implementation examples.

## Basic Form Example

```tsx
import type { JSX } from 'react';
import { useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { profileFormSchema, type ProfileFormData } from '@/schemas/profileFormSchema';

type ProfileFormProps = {
	onSubmitProfile: (data: ProfileFormData) => Promise<void>;
};

export function ProfileForm({ onSubmitProfile }: ProfileFormProps): JSX.Element {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid, isDirty },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileFormSchema),
		mode: 'onChange',
		defaultValues: {
			fullName: '',
			email: '',
		},
	});

	const onSubmit = useCallback(
		async (data: ProfileFormData) => {
			await onSubmitProfile(data);
		},
		[onSubmitProfile],
	);

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate>
			<div>
				<label htmlFor='fullName'>Full name</label>

				<input id='fullName' type='text' {...register('fullName')} />

				{errors.fullName ? <p role='alert'>{errors.fullName.message}</p> : null}
			</div>

			<div>
				<label htmlFor='email'>Email</label>

				<input id='email' type='email' {...register('email')} />

				{errors.email ? <p role='alert'>{errors.email.message}</p> : null}
			</div>

			<button type='submit' disabled={!isDirty || isSubmitting}>
				{isSubmitting ? 'Saving...' : 'Save changes'}
			</button>
		</form>
	);
}
```

## Existing Schema Usage Example

Use schemas that already exist in the project. Do not author standalone schemas in this
skill.

```ts
import { profileFormSchema, type ProfileFormData } from '@/schemas/profileFormSchema';
```

Rules:

- Import existing schemas and inferred form types.
- If the task is mainly schema authoring or schema refactoring, use the
  `validation-schemas` skill.
- Keep form implementation focused on wiring, state, submit behavior, and error display.

## Async Edit Form Example

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

const {
	reset,
	formState: { isDirty, isSubmitting, isValid },
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

## Async Default Values Example

Use this when the form owns the async loading lifecycle.

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

## Backend Field Error Example

```tsx
try {
	await updateProfile(data);
} catch {
	setError('email', {
		type: 'server',
		message: 'This email is already in use',
	});
}
```

## Form-Level Error Example

```tsx
const [formError, setFormError] = useState<string | null>(null);

try {
	await updateProfile(data);
} catch {
	setFormError('Could not save changes. Please try again.');
}

{
	formError ? <div role='alert'>{formError}</div> : null;
}
```

## Controller Example

```tsx
import { Controller } from 'react-hook-form';

<Controller
	name='startDate'
	control={control}
	render={({ field, fieldState }) => (
		<DatePicker
			value={field.value}
			onChange={field.onChange}
			onBlur={field.onBlur}
			ref={field.ref}
			error={fieldState.error?.message}
		/>
	)}
/>;
```

## Controlled Defaults Example

```tsx
const methods = useForm<ProfileFormData>({
	defaultValues: {
		startDate: null,
		status: '',
		isPublic: false,
		tags: [],
	},
});
```

## FormProvider Example

```tsx
import { FormProvider, useForm } from 'react-hook-form';

const methods = useForm<ProfileFormData>({
	resolver: zodResolver(profileFormSchema),
	defaultValues,
});

return (
	<FormProvider {...methods}>
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			<ProfileFields />
		</form>
	</FormProvider>
);
```

Nested section:

```tsx
import { useFormContext } from 'react-hook-form';

export function ProfileFields() {
	const {
		register,
		formState: { errors },
	} = useFormContext<ProfileFormData>();

	return (
		<input
			id='email'
			type='email'
			{...register('email')}
			aria-invalid={Boolean(errors.email)}
		/>
	);
}
```

## useFieldArray Example

```tsx
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
	control,
	name: 'contacts',
});

return fields.map((field, index) => (
	<div key={field.id}>
		<input {...register(`contacts.${index}.value`)} />
	</div>
));
```

## Partial Update Example

```tsx
const {
	getValues,
	formState: { dirtyFields },
} = methods;

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

## Multi-Step Form Example

```tsx
const methods = useForm<SignupFormData>({
	resolver: zodResolver(signupFormSchema),
	mode: 'onChange',
	defaultValues,
});

return (
	<FormProvider {...methods}>
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			{currentStep === 'account' ? <AccountStep /> : null}

			{currentStep === 'profile' ? <ProfileStep /> : null}

			{currentStep === 'confirm' ? <ConfirmStep /> : null}
		</form>
	</FormProvider>
);
```

## Recommended Organization Pattern

```txt
src/
  components/
    forms/
      SharedFormField.tsx
      FormErrorMessage.tsx

  features/
    profile/
      components/
        ProfileForm.tsx
      hooks/
        useProfileForm.ts
      constants/
        profileFormLimits.ts

  schemas/
    profileFormSchema.ts
```

## Recommended Form Workflow

```txt
Existing schema
  ↓

useForm + zodResolver
  ↓

Safe defaultValues
  ↓

Async hydration with reset(...) or async defaultValues
  ↓

Validation + UX state
  ↓

Backend error mapping
  ↓

Submit handling
  ↓

Success or preserved retry flow
```
