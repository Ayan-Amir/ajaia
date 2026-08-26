import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileFormTemplate() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { fullName: "", email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await fakeSave(values);
    } catch (error) {
      const message = (error as { message?: string }).message ?? "Unable to save";
      setError("email", { type: "server", message });
      setFormError(message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        Full name
        <input {...register("fullName")} />
      </label>
      {errors.fullName?.message && <p>{errors.fullName.message}</p>}

      <label>
        Email
        <input type="email" {...register("email")} />
      </label>
      {errors.email?.message && <p>{errors.email.message}</p>}

      {formError && <p>{formError}</p>}

      <button type="submit" disabled={isSubmitting}>
        Save profile
      </button>
    </form>
  );
}

async function fakeSave(_values: ProfileInput) {
  return Promise.resolve();
}
