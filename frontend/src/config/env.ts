import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:8000"),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL.replace(/\/$/, ""),
};
