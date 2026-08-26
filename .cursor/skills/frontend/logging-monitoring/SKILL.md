---
name: logging-monitoring
description: Use when setting up or extending client-side logging, Sentry error tracking, Web Vitals performance monitoring, or the useLogger hook. Do NOT use for ErrorBoundary component implementation (use error-boundaries skill), queryClient toast wiring (use ui-states skill), or server-side logging.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Logging & Monitoring

## Stack Context
- Framework: React 19 + TypeScript + Vite
- Error tracking: `@sentry/react` — staging and production only
- Performance: `web-vitals` (LCP, FCP, CLS, INP, TTFB)
- Logger location: `src/lib/logger/` — **all logging flows through here, never directly**
- Hook location: `src/hooks/useLogger.ts`
- Bootstrap: `src/main.tsx` — Sentry and Web Vitals must init before React renders
- Env vars: `VITE_SENTRY_DSN` — required in `.env.staging` and `.env.production` only
- Import alias: `@/lib/logger` — public API only, never import internal files directly

**Initialization order (must be respected):**
1. `initSentry()` — before React renders
2. `initWebVitals()` — before React renders
3. `queryClient` (ui-states skill) — depends on `@/lib/logger` being available
4. React tree + providers

## When To Use
- Setting up `src/lib/logger/` for the first time
- Adding or extending Sentry integration (`sentry.ts`)
- Implementing Web Vitals or slow-query tracking (`performance.ts`)
- Adding the `useLogger` hook to a component
- Deciding what log level to use or what events to log
- Adding global unhandled error/rejection listeners in `main.tsx`
- Reviewing existing logging for PII leaks or level misuse

## Do Not Use
- `ErrorBoundary` implementation — use `error-boundaries` skill
- `queryClient.ts` toast wiring — owned by `ui-states` skill; this skill only defines `@/lib/logger` which queryClient imports
- Server-side or Node.js logging
- Auth error handling beyond logging — use `authentication-session-management` skill

## Folder Structure
```
src/
├── lib/
│   └── logger/
│       ├── index.ts          # Public API — re-exports only
│       ├── logger.ts         # Core logger (levels, env-aware, Sentry calls)
│       ├── sentry.ts         # Sentry.init + PII strip in beforeSend
│       └── performance.ts    # Web Vitals + slow query tracking
├── hooks/
│   └── useLogger.ts          # Component-level hook with feature context
└── main.tsx                  # Bootstrap: initSentry(), initWebVitals()
```

> **Sentry import rule:** Direct `import * as Sentry from "@sentry/react"` is allowed **only**
> in `src/lib/logger/logger.ts` and `src/lib/logger/sentry.ts`. All other files must use
> `@/lib/logger` — never import Sentry directly outside these two files.

## How To Apply
1. Read `references/patterns.md` for logger architecture, log levels, and Sentry import rule
2. Implement `src/lib/logger/logger.ts` — core levels, env-aware output, Sentry routing
3. Implement `src/lib/logger/sentry.ts` — `initSentry()` with PII strip in `beforeSend`
4. Implement `src/lib/logger/performance.ts` using `logger.warn` (not direct Sentry) for poor vitals
5. Wire `initSentry()` and `initWebVitals()` in `src/main.tsx` before React renders
6. Add global `unhandledrejection` and `error` listeners — see `references/examples.md`
7. Use `useLogger(feature)` in components — never call `logger` directly from JSX
8. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For logger architecture, log levels table, Sentry init, and core implementations → read `references/patterns.md`
- For useLogger hook, performance.ts, bootstrap, auth events, and global listeners → read `references/examples.md`
- For what to log, what level to use, and PII rules → read `references/decisions.md`
- For what NOT to do (direct Sentry, console scatter, PII, skill conflicts) → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)
- To install dependencies: run `scripts/setup.sh` (execute, do not read)

## Pipeline
- Depends on: nothing — this skill is foundational; it must be set up first
- Feeds into: `ui-states` (`queryClient.ts` imports `@/lib/logger`), `error-boundaries` (boundaries use `logger.fatal`), `api-integration` (query errors flow through logger), `authentication-session-management` (auth events logged via logger)
- **This skill must be completed before any other skill that references `@/lib/logger`**

## Human Check
- Open Sentry dashboard and confirm a test error appears with correct environment tag
- Confirm PII (email, IP) is stripped — check a captured event in Sentry for `user.email` and `user.ip_address`
- Open browser DevTools → Performance tab and confirm Web Vitals are logged to console in dev
- Confirm `debug` and `info` logs do NOT appear in Sentry in staging/prod (check Sentry issues)
- Trigger an unhandled promise rejection and confirm it appears in Sentry as `fatal`
- Confirm `VITE_SENTRY_DSN` is NOT committed to `.env` or `.env.local` — only in `.env.staging` / `.env.production`
- Run `yarn tsc --noEmit` and confirm zero errors
