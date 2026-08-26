# Logging & Monitoring — Decision Guide

## What to Log

### Always Log
| Event | Level | Where |
|---|---|---|
| API query failure | `error` | `queryClient.ts` (automatic via ui-states skill) |
| API mutation failure | `error` | `queryClient.ts` (automatic via ui-states skill) |
| Unhandled JS exception | `fatal` | `window.addEventListener("error")` in `main.tsx` |
| Unhandled promise rejection | `fatal` | `window.addEventListener("unhandledrejection")` in `main.tsx` |
| Unhandled React render error | `fatal` | ErrorBoundary `componentDidCatch` (error-boundaries skill) |
| User login / logout | `info` | `authService.ts` |
| Session token expiry | `warn` | `authService.ts` |
| Slow API call (>2s) | `warn` | `trackQueryPerformance()` |
| Poor Web Vital | `warn` | `initWebVitals()` (automatic) |
| 401 Unauthorized response | `warn` | Axios/fetch interceptor |

### Log Selectively
| Event | Level | Note |
|---|---|---|
| Form submissions | `info` | Log the action, never log field values |
| Route/page navigation | `info` | Log path only, not query params that may contain PII |
| Retry attempts | `warn` | Only if retries keep failing |
| Feature flag evaluations | `debug` | Dev only — suppressed in staging/prod |

### Never Log
- Passwords, tokens, API keys, or secrets of any kind
- Full credit card or payment data
- Personal data (email, phone, name) in error `context` — strip in `beforeSend`
- Every render cycle or `useEffect` run
- Successful GET responses (too verbose)

---

## Which Log Level to Use

| Situation | Level |
|---|---|
| Verbose dev-only tracing | `debug` |
| Normal flow events (login, navigate) | `info` |
| Something unexpected but recoverable | `warn` |
| A caught exception or API failure | `error` |
| App crash or unhandled render failure | `fatal` |

**Rule:** If you're unsure between `warn` and `error` — ask: "can the user continue using the app?" If yes → `warn`. If the feature is broken → `error`.

---

## queryClient Ownership

`queryClient.ts` is **owned by the `ui-states` skill** — it handles toast wiring and default options.
This skill (`logging-monitoring`) provides `@/lib/logger` which `queryClient.ts` imports.

**staleTime:** Use `STALE_TIME.MEDIUM` from `@/constants` (defined in ui-states skill) — never hardcode `5 * 60 * 1000`.

Do not define or duplicate `queryClient.ts` in this skill.

---

## ErrorBoundary Ownership

`ErrorBoundary` component is **owned by the `error-boundaries` skill**.
This skill provides `logger.fatal` which the boundary calls inside `componentDidCatch`.

Do not define `ErrorBoundary` in this skill — reference `error-boundaries` skill instead.
