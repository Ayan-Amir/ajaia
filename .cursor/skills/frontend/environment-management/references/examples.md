# Environment Management — Examples

## .env Files

### `.env` — Base defaults (committed, no secrets)
```bash
VITE_APP_NAME=MyApp
VITE_APP_VERSION=$npm_package_version
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_DEVTOOLS=false
```

### `.env.development`
```bash
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_DEVTOOLS=true
VITE_SENTRY_DSN=              # Empty in dev — no Sentry noise locally
```

### `.env.staging`
```bash
VITE_ENV=staging
VITE_API_BASE_URL=https://api.staging.yourapp.com
VITE_ENABLE_DEVTOOLS=false
VITE_SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
VITE_GOOGLE_MAPS_KEY=AIza...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### `.env.production`
```bash
VITE_ENV=production
VITE_API_BASE_URL=https://api.yourapp.com
VITE_ENABLE_DEVTOOLS=false
VITE_SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
VITE_GOOGLE_MAPS_KEY=AIza...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### `.env.local` — Personal overrides (git-ignored, never committed)
```bash
# Override any value locally without touching shared files
VITE_API_BASE_URL=http://localhost:4000
```

### `.gitignore` additions
```bash
.env.local
.env.*.local
```

---

## `src/config/env.ts` — Zod Schema + Typed Export

```typescript
import { z } from "zod";

const envSchema = z.object({
  // App
  VITE_APP_NAME: z.string().min(1),
  VITE_ENV: z.enum(["development", "staging", "production"]),

  // API
  VITE_API_BASE_URL: z.string().url(),

  // Sentry (optional — empty in development)
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_SENTRY_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),
  VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),
  VITE_REPLAYS_ON_ERROR_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),

  // Feature flags
  VITE_ENABLE_DEVTOOLS: z.preprocess(val => val === "true", z.boolean()),

  // Third-party (add/remove based on your project)
  VITE_GOOGLE_MAPS_KEY: z.string().optional(),
  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(import.meta.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.errors
      .filter(e => e.code === "invalid_type" && e.received === "undefined")
      .map(e => e.path.join("."));
    const invalid = error.errors
      .filter(e => !(e.code === "invalid_type" && e.received === "undefined"))
      .map(e => `${e.path.join(".")}: ${e.message}`);

    let message = "";
    if (missing.length) message += `Missing required env vars: ${missing.join(", ")}.\n`;
    if (invalid.length) message += `Invalid env vars:\n - ${invalid.join("\n - ")}`;

    throw new Error(`❌ Environment validation failed:\n${message}\nCheck your .env file.`);
  }
  throw error;
}

export default env;
```

---

## `src/main.tsx` — Wiring (env must be first import)

```typescript
// ✅ Import env FIRST — Zod validation runs immediately on import
import env from "@/config/env";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initSentry, initWebVitals } from "@/lib/logger";

initSentry();
initWebVitals();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

---

## Usage Throughout the App

```typescript
import env from "@/config/env";

// API client
const apiClient = axios.create({ baseURL: env.VITE_API_BASE_URL });

// Environment check
if (env.VITE_ENV === "development") {
  console.log("Dev mode");
}

// Optional var — safely access with nullish coalescing
const mapsKey = env.VITE_GOOGLE_MAPS_KEY ?? "";
```
