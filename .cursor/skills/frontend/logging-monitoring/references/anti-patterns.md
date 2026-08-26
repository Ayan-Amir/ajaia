# Logging & Monitoring — Anti-Patterns

## Direct Sentry Imports Outside Logger Files

```typescript
// ❌ Direct Sentry in a component, service, or performance.ts
import * as Sentry from "@sentry/react";
Sentry.captureException(error);
Sentry.captureMessage("Poor Web Vital: LCP", { level: "warning" });

// ✅ Route everything through the logger abstraction
import { logger } from "@/lib/logger";
logger.error("Something failed", { context }, error);
logger.warn("Poor Web Vital: LCP", { value, threshold });
```

**Rule:** `import * as Sentry` is only allowed in `src/lib/logger/logger.ts` and
`src/lib/logger/sentry.ts`. Everywhere else is a violation — including `performance.ts`.

---

## Scattered console.log Across Components

```typescript
// ❌ Raw console calls — lost in production, no Sentry routing, no context
console.log("user logged in", user);
console.error("fetch failed", error);

// ✅ Use logger or useLogger hook
const log = useLogger("auth");
log.info("User logged in", { userId: user.id });
log.error("Fetch failed", { endpoint }, error);
```

---

## Logging PII in Error Context

```typescript
// ❌ PII in context — will appear in Sentry events
logger.error("Login failed", { email: data.email, password: data.password });

// ✅ Log the action, not the credentials
logger.error("Login failed", { method: "email" }, error as Error);
```

PII is also stripped server-side via `beforeSend` in `sentry.ts` as a second line of defence,
but the primary rule is: never put PII into the `context` argument in the first place.

---

## Defining queryClient.ts in This Skill

```typescript
// ❌ Do not define queryClient.ts here — it belongs to ui-states skill
export const queryClient = new QueryClient({ ... });

// ✅ This skill provides @/lib/logger — queryClient (ui-states) imports it
// Coordinate via ui-states skill (PR #55) for the single queryClient.ts source of truth
```

---

## Defining ErrorBoundary in This Skill

```typescript
// ❌ Do not define ErrorBoundary here — it belongs to error-boundaries skill
export class ErrorBoundary extends React.Component { ... }

// ✅ This skill provides logger.fatal — the boundary (error-boundaries skill) calls it
// componentDidCatch in error-boundaries skill:
logger.fatal("Unhandled React render error", { componentStack }, error);
```

---

## Hardcoded staleTime Magic Number

```typescript
// ❌ Magic number — inconsistent with the constants-first pattern
staleTime: 5 * 60 * 1000,

// ✅ Use STALE_TIME from @/constants (defined in ui-states skill)
import { STALE_TIME } from "@/constants";
staleTime: STALE_TIME.MEDIUM,
```

---

## Missing fatal Level in useLogger

```typescript
// ❌ Hook that omits fatal — components cannot report unrecoverable errors
return { debug, info, warn, error }; // missing fatal

// ✅ All five levels must be exposed
return { debug, info, warn, error, fatal };
```

---

## Initializing Sentry After React Renders

```typescript
// ❌ Too late — errors during render are missed
ReactDOM.createRoot(...).render(<App />);
initSentry(); // After render — wrong

// ✅ Init before React renders
initSentry();
initWebVitals();
ReactDOM.createRoot(...).render(<App />);
```
