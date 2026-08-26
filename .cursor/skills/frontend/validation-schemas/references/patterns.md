# Patterns

## 1) Baseline schema module pattern
- Keep one domain per folder under `src/validation/[domain]/`.
- Export schema plus inferred type from the same file.
- Keep reusable rules in `primitives.ts` and messages in `messages.ts`.

```ts
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/validation/primitives";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
```

## 2) React Hook Form defaults (owned by this skill)
- Default to `mode: "onBlur"`.
- Use `reValidateMode: "onChange"`.
- Override to `mode: "onChange"` only for real-time filtering/search UX.

```ts
useForm<FormInput>({
  resolver: zodResolver(formSchema),
  mode: "onBlur",
  reValidateMode: "onChange",
  defaultValues,
});
```

## 3) Create vs update split
- Use a dedicated create schema when all required create-only fields must be present.
- Use a dedicated update schema with `.partial()` or explicit optionals for patch forms.
- Avoid runtime branching in submit handlers for requiredness.

```ts
const createSchema = baseSchema.extend({ password: strongPasswordSchema });
const updateSchema = baseSchema.partial().extend({ id: z.string().uuid() });
```

## 4) Cross-field refinements
- Keep cross-field rules in schema `.superRefine`, not component handlers.
- Attach error paths to specific fields for RHF field-level rendering.

```ts
const registerSchema = z
  .object({ password: z.string().min(12), confirmPassword: z.string() })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
```

## 5) API error mapping contract
- Normalize backend validation errors into `(field, message)` pairs.
- Map those pairs through `setError` with `type: "server"`.
- Keep non-field errors in a form-level message state.

## 6) Cross-skill boundaries
- Do not define TanStack Query hooks here. Owner: `api-integration-data-layer`.
- Do not define logger/Sentry/query client setup here. Owner: `logging-monitoring`.
- Do not define ErrorBoundary components here. Owner: `error-boundaries`.
- Do not define auth context providers here. Owner: `react-state-management`.
- Do not define folder naming policy here. Owner: `routing-navigation`.
