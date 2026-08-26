---
name: environment-management
description: Use when setting up or managing .env files, adding environment variables, validating them with Zod at startup, or configuring dev/staging/production builds in a Vite project. Do NOT use for runtime feature flags, server-side config, or secrets that must never reach the browser bundle.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Environment Management

## Stack Context
- Framework: React 19 + TypeScript + Vite
- Validation: Zod (`z.object`) — runs at module import, before React renders
- Env accessor: `src/config/env.ts` — single typed export, never use `import.meta.env` directly
- Env files: project root — `.env`, `.env.development`, `.env.staging`, `.env.production`
- Personal overrides: `.env.local`, `.env.*.local` — always git-ignored
- Build commands: `vite build --mode staging`, `vite build --mode production`
- Import alias: `@/config/env` — used everywhere in the app

## When To Use
- Setting up `.env` files in a Vite project for the first time
- Adding a new environment variable to the project
- Validating env vars at startup with Zod
- Configuring different values for dev, staging, or production
- A developer asks "why is my env var undefined" or "where do I put this config value"
- Replacing hardcoded API URLs, third-party keys, or any value that differs per environment

## Do Not Use
- Runtime feature flags toggled without a build — use a feature flag service
- Server-side or Node.js environment config
- Secrets that must never reach the browser — remove `VITE_` prefix; they belong on the server
- Sentry DSN management — `logging-monitoring` skill references this skill's `env.ts`

## Folder Structure
```
project-root/
├── .env                  # Base defaults — committed, no secrets
├── .env.development      # Dev values — committed, no secrets
├── .env.staging          # Staging values — committed, no secrets
├── .env.production       # Production values — committed, no secrets
├── .env.local            # Personal overrides — git-ignored, never committed
├── .env.*.local          # Env-specific personal overrides — git-ignored
└── src/
    └── config/
        └── env.ts        # Zod schema + typed default export
```

## How To Apply
1. Read `references/patterns.md` for VITE_ prefix rule, env file load order, and Zod approach
2. Create `.env`, `.env.development`, `.env.staging`, `.env.production` — see `references/examples.md`
3. Add `.env.local` and `.env.*.local` to `.gitignore`
4. Implement `src/config/env.ts` with Zod schema — see `references/examples.md` for full schema
5. Import `env` as the **first import** in `src/main.tsx` — validation runs before React renders
6. Use `env.VITE_X` everywhere — never `import.meta.env.VITE_X` or `process.env.X` directly
7. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For VITE_ prefix rule, env file load order, Zod validators, and vite.config setup → read `references/patterns.md`
- For .env file examples, full Zod schema, main.tsx wiring, and usage patterns → read `references/examples.md`
- For env file ownership table and adding a new variable checklist → read `references/decisions.md`
- For common mistakes and bad/good code examples → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)

## Pipeline
- Depends on: nothing — env validation must run before all other skills
- Feeds into: `logging-monitoring` (`VITE_SENTRY_DSN` consumed via `env.ts`), `api-integration` (`VITE_API_BASE_URL`), `authentication-session-management` (any auth-related env vars)
- **`src/config/env.ts` must be the first import in `main.tsx`** — before Sentry, React, or anything else

## Human Check
- Delete a required var from `.env` locally, restart dev server, and confirm the error message lists the missing key clearly
- Run `vite build --mode staging` and confirm staging values appear in the bundle (inspect built JS for the API URL)
- Confirm `.env.local` and `.env.*.local` are in `.gitignore` and not tracked by git
- Confirm no raw secrets (JWT keys, DB passwords) exist in any `VITE_` variable
- Confirm `process.env` is not used anywhere in the frontend source
- Run `yarn tsc --noEmit` and confirm zero errors
