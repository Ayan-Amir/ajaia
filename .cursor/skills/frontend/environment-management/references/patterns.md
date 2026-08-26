# Environment Management — Core Patterns

## VITE_ Prefix Rule

Vite **only exposes vars prefixed with `VITE_`** to client-side code via `import.meta.env`.
Vars without this prefix are never included in the browser bundle.

```bash
VITE_API_BASE_URL=https://api.example.com   # ✅ accessible in browser code
API_SECRET_KEY=super-secret                  # ❌ never exposed — backend only
```

> **Security rule:** Every `VITE_` var is visible in the compiled JS bundle.
> Never put private secrets (JWT signing keys, DB passwords, private API keys) in `VITE_` vars.
> Only public-safe values: API base URLs, publishable keys (Stripe `pk_`), Maps keys, DSNs.

---

## Env File Load Order

Vite loads files in this order — later files override earlier ones:

```
.env  →  .env.[mode]  →  .env.local  →  .env.[mode].local
```

- `.env` — committed, base defaults for all environments
- `.env.[mode]` — committed, environment-specific values (development / staging / production)
- `.env.local` — git-ignored, personal local overrides (highest priority after mode-local)
- `.env.[mode].local` — git-ignored, personal env-specific overrides (highest priority)

`.env.local` and `.env.*.local` must be in `.gitignore` — never committed.

---

## Zod Validators by Type

All env vars arrive from Vite as strings. Use these patterns in `envSchema`:

| Type | Zod validator |
|---|---|
| Required string | `z.string().min(1)` |
| Required URL | `z.string().url()` |
| Optional URL | `z.string().url().optional()` |
| Enum | `z.enum(['development', 'staging', 'production'])` |
| Number (string → number) | `z.preprocess(val => Number(val), z.number().min(0).max(1))` |
| Boolean (string → boolean) | `z.preprocess(val => val === 'true', z.boolean())` |
| Optional string | `z.string().optional()` |

---

## Vite Config — Mode Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### package.json build scripts

```json
{
  "scripts": {
    "dev":           "vite",
    "build":         "vite build",
    "build:staging": "vite build --mode staging",
    "build:prod":    "vite build --mode production",
    "preview":       "vite preview"
  }
}
```

`vite build --mode staging` loads `.env.staging` values into the bundle.
Running plain `vite build` loads `.env.production` by default.

---

## Validation Timing

`src/config/env.ts` runs Zod validation **at module import time** — before React, Sentry, or
anything else renders. This means: import `env` as the first statement in `main.tsx`.

If validation fails, the app throws immediately with a readable message listing every
missing or invalid variable — no silent `undefined` values at runtime.
