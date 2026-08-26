# Examples

## Example A: Reusable validation primitives

```ts
// src/validation/messages.ts
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Enter a valid email address",
  passwordMin: "Password must be at least 12 characters",
  passwordMismatch: "Passwords do not match",
} as const;
```

```ts
// src/validation/primitives.ts
import { z } from "zod";
import { VALIDATION_MESSAGES } from "@/validation/messages";

export const emailSchema = z
  .string()
  .trim()
  .min(1, VALIDATION_MESSAGES.required)
  .email(VALIDATION_MESSAGES.email);

export const passwordSchema = z
  .string()
  .min(12, VALIDATION_MESSAGES.passwordMin);
```

## Example B: Complete register schema with cross-field validation

```ts
// src/validation/auth/register.schema.ts
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/validation/primitives";
import { VALIDATION_MESSAGES } from "@/validation/messages";

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, VALIDATION_MESSAGES.required),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_MESSAGES.passwordMismatch,
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
```

## Example C: Complete RHF hook using this skill defaults

```ts
// src/features/auth/forms/use-register-form.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validation/auth/register.schema";

export function useRegisterForm() {
  return useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
}
```

## Example D: Complete backend error mapper

```ts
// src/utils/form-errors.ts
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ApiValidationError = {
  errors?: Record<string, string[] | string>;
  message?: string;
};

export function applyApiErrors<TFieldValues extends FieldValues>(
  error: ApiValidationError,
  setError: UseFormSetError<TFieldValues>,
): string | null {
  const fieldErrors = error.errors ?? {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = Array.isArray(messages) ? messages[0] : messages;
    setError(field as Path<TFieldValues>, { type: "server", message });
  }

  return Object.keys(fieldErrors).length === 0 ? error.message ?? "Request failed" : null;
}
```

## Example E: Complete component usage

```tsx
// src/features/auth/components/RegisterForm.tsx
import { useState } from "react";
import { useRegisterForm } from "@/features/auth/forms/use-register-form";
import { applyApiErrors } from "@/utils/form-errors";

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useRegisterForm();

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await fakeRegisterApi(values);
    } catch (error) {
      const message = applyApiErrors(error as { errors?: Record<string, string[]>; message?: string }, setError);
      if (message) setFormError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email?.message && <p>{errors.email.message}</p>}

      <input {...register("password")} type="password" placeholder="Password" />
      {errors.password?.message && <p>{errors.password.message}</p>}

      <input {...register("confirmPassword")} type="password" placeholder="Confirm password" />
      {errors.confirmPassword?.message && <p>{errors.confirmPassword.message}</p>}

      {formError && <p>{formError}</p>}
      <button type="submit" disabled={isSubmitting}>Create account</button>
    </form>
  );
}

async function fakeRegisterApi(_values: unknown) {
  return Promise.resolve();
}
```
