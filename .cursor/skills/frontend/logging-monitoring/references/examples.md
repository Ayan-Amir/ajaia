# Logging & Monitoring — Examples

## performance.ts — `src/lib/logger/performance.ts`

Uses `logger.warn` for poor vitals — never imports Sentry directly.

```typescript
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { logger } from "./logger"; // Never: import * as Sentry from "@sentry/react"

const THRESHOLDS = {
  LCP: 2500, FCP: 1800, CLS: 0.1, INP: 200, TTFB: 800,
};

export function initWebVitals(): void {
  const report = (metric: { name: string; value: number; rating: string }) => {
    const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
    const isGood = metric.value <= threshold;

    logger.info(`Web Vital: ${metric.name}`, { value: metric.value, rating: metric.rating, threshold });

    if (!isGood && import.meta.env.PROD) {
      // Route through logger.warn — logger.ts sends this to Sentry internally
      logger.warn(`Poor Web Vital: ${metric.name}`, {
        value: metric.value, threshold, rating: metric.rating,
      });
    }
  };

  onLCP(report); onFCP(report); onCLS(report); onINP(report); onTTFB(report);
}

export function trackQueryPerformance(queryKey: string, durationMs: number): void {
  if (durationMs > 2000) {
    logger.warn("Slow API query detected", { queryKey, durationMs, threshold: 2000 });
  }
}
```

---

## useLogger Hook — `src/hooks/useLogger.ts`

Includes `fatal` level for components that need to report unrecoverable errors.

```typescript
import { useCallback } from "react";
import { logger, LogContext } from "@/lib/logger";

export function useLogger(feature: string) {
  const withFeature = useCallback(
    (context?: LogContext) => ({ feature, ...context }),
    [feature]
  );

  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, withFeature(context)),
    info: (message: string, context?: LogContext) =>
      logger.info(message, withFeature(context)),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, withFeature(context)),
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, withFeature(context), error),
    fatal: (message: string, context?: LogContext, error?: Error) =>
      logger.fatal(message, withFeature(context), error),
  };
}
```

**Usage:**
```typescript
function LoginForm() {
  const log = useLogger("auth");
  const handleSubmit = async (data: LoginData) => {
    log.info("Login attempt", { method: "email" });
    try {
      await loginMutation.mutateAsync(data);
      log.info("Login successful");
    } catch (error) {
      log.error("Login failed", { email: data.email }, error as Error);
    }
  };
}
```

---

## App Bootstrap — `src/main.tsx`

Sentry and Web Vitals must initialize before React renders.

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initSentry, initWebVitals, logger } from "@/lib/logger";

initSentry();      // Must be first
initWebVitals();   // Must be before React renders

window.addEventListener("unhandledrejection", (event) => {
  logger.fatal("Unhandled promise rejection", { reason: String(event.reason) },
    event.reason instanceof Error ? event.reason : undefined);
});

window.addEventListener("error", (event) => {
  logger.fatal("Uncaught error", { message: event.message, filename: event.filename, line: event.lineno },
    event.error);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

---

## ErrorBoundary Integration

This skill owns the **logger** — it does NOT define the ErrorBoundary component.
See `error-boundaries` skill for the full three-level boundary architecture.

How the boundary uses this skill's logger (implemented in error-boundaries skill):
```typescript
// In error-boundaries skill — componentDidCatch calls:
logger.fatal("Unhandled React render error", { componentStack: info.componentStack }, error);
```

The `fatal` method on `useLogger` hook is exposed specifically so boundary components can use it.

---

## Auth Events Pattern — `src/services/authService.ts`

```typescript
import { logger } from "@/lib/logger";

export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const user = await authApi.login(credentials);
    logger.info("User logged in", { userId: user.id, method: "email" }); // Never log credentials
    return user;
  } catch (error) {
    logger.error("Login failed", { method: "email" }, error as Error);
    throw error;
  }
}

export function logout(userId: string): void {
  logger.info("User logged out", { userId });
}

export function handleTokenExpiry(): void {
  logger.warn("Session token expired", {});
}
```
