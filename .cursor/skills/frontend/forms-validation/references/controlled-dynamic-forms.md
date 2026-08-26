# Controlled Dynamic Forms

Use this reference for `Controller`, controlled inputs, dynamic forms, multi-step forms,
field arrays, and `FormProvider`.

## Controller Usage

Use `Controller` only when the input cannot work cleanly with `register(...)`.

Use `Controller` for:

- Custom select components
- Date pickers
- Rich text editors
- Custom checkbox or switch components
- Third-party controlled inputs
- Inputs that expose `value` and `onChange` instead of native refs

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

Rules:

- Prefer `register(...)` for native inputs.
- Use `Controller` only when needed.
- Never pass `undefined` as a controlled field default value.
- Use empty string, `null`, `false`, or an empty array depending on the field type.
- Pass `value`, `onChange`, `onBlur`, and `ref` when the controlled component supports
  them.
- Keep controlled field wrappers small and reusable.
- Do not wrap every simple input with `Controller`.

## Controller Default Values

Controlled components need stable default values.

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

Rules:

- Provide `defaultValues` at `useForm` level when using controlled fields.
- Do not rely on `undefined` for controlled values.
- Use `null` for nullable picker values.
- Use empty string for text/select values.
- Use empty arrays for multi-select values.
- Use booleans for switches and checkboxes.
- If using `reset(...)`, reset with full form-shaped values.

## Custom Form Fields

Create reusable field wrappers only when they reduce repetition.

```tsx
type TextFieldProps = {
	id: string;
	label: string;
	error?: string;
};

export function TextField({
	id,
	label,
	error,
	...inputProps
}: TextFieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div>
			<label htmlFor={id}>{label}</label>

			<input
				id={id}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
				{...inputProps}
			/>

			{error ? (
				<p id={`${id}-error`} role='alert'>
					{error}
				</p>
			) : null}
		</div>
	);
}
```

Rules:

- Reuse existing project field primitives first.
- Keep wrappers accessible.
- Do not create new abstractions for one-off fields.
- Keep styling aligned with the design system.

## FormProvider

Use `FormProvider` when a form has deeply nested sections.

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

Rules:

- Use `FormProvider` for multi-section or deeply nested forms.
- Avoid prop drilling large form method objects through many layers.
- Keep nested components typed with `useFormContext<FormData>()`.
- Do not use `FormProvider` for small single-component forms unless it improves
  consistency.

## Dynamic Forms

Use typed config-driven forms only when the form structure is genuinely dynamic.

```ts
type FieldConfig<FormField extends string> = {
	name: FormField;
	label: string;
	type: 'text' | 'email' | 'number';
	required?: boolean;
};

const PROFILE_FIELDS: FieldConfig<keyof ProfileFormData>[] = [
	{
		name: 'fullName',
		label: 'Full name',
		type: 'text',
	},
	{
		name: 'email',
		label: 'Email',
		type: 'email',
		required: true,
	},
];
```

Rules:

- Keep field config aligned with the schema.
- Use stable IDs or field names as React keys.
- Never use array index as a key.
- Do not make simple static forms config-driven unnecessarily.
- Keep dynamic renderers small and readable.

## Field Arrays

Use `useFieldArray` for repeatable form sections.

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

Rules:

- Use `field.id` as the React key.
- Do not use array index as the React key.
- Keep add/remove handlers memoized when passed to JSX.
- Validate array min/max rules in the schema.
- Keep nested field names typed where possible.
- Avoid `shouldUnregister` with field arrays unless the product explicitly needs
  unregister behavior.

## shouldUnregister Caution

Use `shouldUnregister` intentionally.

Rules:

- Do not enable `shouldUnregister` globally without understanding the form flow.
- Avoid `shouldUnregister` with `useFieldArray` reorder/remove behavior unless explicitly
  required.
- For multi-step forms, decide whether hidden step values should persist or unregister.
- Document the intended behavior when hidden or unmounted fields should not submit.
- Prefer preserving values unless the product requires hidden fields to be removed.

## Multi-Step Forms

For multi-step forms, choose one of these patterns:

- One schema per step for independent validation
- One composed schema for final submission
- A hybrid approach when steps have conditional requirements

Rules:

- Validate only the current step when appropriate.
- Preserve form state between steps unless `shouldUnregister` is intentional.
- Keep final payload mapping explicit.
- Use `FormProvider` when multiple step components share one form instance.
- Keep step navigation separate from final submit.
- Avoid losing user input when moving between steps.

## Multi-Step FormProvider Pattern

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

Rules:

- Keep `currentStep` state outside field components.
- Do not unmount fields if doing so would lose required state unless `shouldUnregister` is
  intentional.
- Use clear step identifiers instead of numeric magic values.
- Keep step validation behavior explicit.

## Conditional Fields

When fields appear conditionally, keep schema and UI behavior aligned.

Rules:

- If the field is conditionally required, encode that rule in the schema.
- If hidden values should not submit, clear or unregister them intentionally.
- If hidden values should persist, document that behavior in the form logic.
- Do not let hidden stale values accidentally submit.

## Done Criteria

Controlled or dynamic forms are correct when:

- `Controller` is used only where needed.
- Controlled fields never receive `undefined` defaults.
- Native inputs use `register(...)`.
- Dynamic fields use stable keys.
- Field config stays aligned with schema.
- Field arrays use `field.id` as key.
- `shouldUnregister` behavior is intentional.
- Multi-step forms preserve user input unless explicitly designed otherwise.
- Conditional fields have explicit submit behavior.
- Nested sections use typed `FormProvider` only when it improves structure.
