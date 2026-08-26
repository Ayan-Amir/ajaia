# Environment Management — Anti-Patterns

## Using import.meta.env Directly in Components or Services

```typescript
// ❌ Bypasses Zod validation — undefined at runtime if var is missing
const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// ✅ Always import the validated typed object
import env from "@/config/env";
const apiClient = axios.create({ baseURL: env.VITE_API_BASE_URL });
```

---

## Using process.env in Vite Projects

```typescript
// ❌ process.env does not work in Vite — always undefined
const url = process.env.VITE_API_BASE_URL;

// ✅ Vite uses import.meta.env — accessed through env.ts
import env from "@/config/env";
const url = env.VITE_API_BASE_URL;
```

---

## Putting Private Secrets in VITE_ Variables

```bash
# ❌ These will be visible in the compiled JS bundle — anyone can read them
VITE_JWT_SECRET=my-super-secret-key
VITE_DATABASE_PASSWORD=postgres123
VITE_STRIPE_SECRET_KEY=sk_live_...

# ✅ Private secrets belong on the server — no VITE_ prefix
JWT_SECRET=my-super-secret-key        # backend only
DATABASE_PASSWORD=postgres123         # backend only
STRIPE_SECRET_KEY=sk_live_...         # backend only
```

---

## Building for Staging Without --mode Flag

```bash
# ❌ Loads .env.production — staging build gets wrong values
vite build

# ✅ Explicitly pass the mode so .env.staging is loaded
vite build --mode staging
```

---

## Not Restarting the Dev Server After .env Changes

```bash
# ❌ Editing .env while dev server is running — changes are not picked up
# (Vite caches env vars at startup)

# ✅ Always restart after any .env change
Ctrl+C
yarn dev
```

---

## Adding a Var to .env Only (Missing envSchema)

```typescript
// ❌ Added VITE_NEW_KEY to .env but not to envSchema
// Result: env.VITE_NEW_KEY is not typed, no validation, silently undefined

// ✅ Always add to envSchema too:
const envSchema = z.object({
  // ...
  VITE_NEW_KEY: z.string().min(1), // added here
});
```

---

## Committing .env.local

```bash
# ❌ Personal overrides committed — exposes local config and causes conflicts

# ✅ Ensure .gitignore includes both:
.env.local
.env.*.local
```

---

## Hardcoding Values That Differ Per Environment

```typescript
// ❌ Hardcoded — breaks when deployed to staging or production
const apiClient = axios.create({ baseURL: "http://localhost:3000" });

// ✅ Use env var — correct URL per environment
import env from "@/config/env";
const apiClient = axios.create({ baseURL: env.VITE_API_BASE_URL });
```
