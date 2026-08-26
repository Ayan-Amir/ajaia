# Environment Management — Decision Guide

## Which File Owns What

| File | Committed? | Purpose |
|---|---|---|
| `.env` | ✅ Yes | Base defaults for all environments |
| `.env.development` | ✅ Yes | Dev-specific non-secret values |
| `.env.staging` | ✅ Yes | Staging values (safe to commit — no raw secrets) |
| `.env.production` | ✅ Yes | Production values (safe to commit — no raw secrets) |
| `.env.local` | ❌ No | Personal local overrides — never committed |
| `.env.*.local` | ❌ No | Env-specific personal overrides — never committed |
| `src/config/env.ts` | ✅ Yes | Zod schema + typed default export |

---

## Adding a New Environment Variable — Checklist

Follow all steps in order. Skipping any step causes silent `undefined` at runtime.

1. Add `VITE_MY_NEW_VAR=` to `.env` (empty or a safe default)
2. Add real values to `.env.development`, `.env.staging`, `.env.production`
3. Add the var to `envSchema` in `src/config/env.ts` with the correct Zod validator:
   - Required string → `z.string().min(1)`
   - Required URL → `z.string().url()`
   - Optional → append `.optional()`
   - Number → `z.preprocess(val => Number(val), z.number())`
   - Boolean → `z.preprocess(val => val === 'true', z.boolean())`
4. Restart the dev server — Vite caches env vars at startup
5. Use `env.VITE_MY_NEW_VAR` (not `import.meta.env`) wherever needed

---

## Should This Value Be a VITE_ Var?

| Value type | In VITE_ var? | Reason |
|---|---|---|
| API base URL | ✅ Yes | Public, needed by browser |
| Stripe publishable key (`pk_`) | ✅ Yes | Designed to be public |
| Google Maps key | ✅ Yes | Public-safe |
| Sentry DSN | ✅ Yes | Public-safe — no write access |
| Feature flag toggle | ✅ Yes | Build-time only |
| JWT signing secret | ❌ No | Private — server only |
| Database password | ❌ No | Private — server only |
| Stripe secret key (`sk_`) | ❌ No | Private — server only |
| Private API key | ❌ No | Private — server only |

---

## Which Build Command to Use

| Target environment | Command |
|---|---|
| Local development | `yarn dev` |
| Staging build | `yarn build:staging` (`vite build --mode staging`) |
| Production build | `yarn build:prod` (`vite build --mode production`) |
| Preview production build locally | `yarn preview` |

Never run plain `vite build` for staging — it loads `.env.production` by default.
