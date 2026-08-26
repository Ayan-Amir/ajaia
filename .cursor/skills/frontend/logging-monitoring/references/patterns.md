# Logging & Monitoring — Core Patterns

## Logger Architecture

All Sentry calls are centralized in `src/lib/logger/logger.ts` and `src/lib/logger/sentry.ts`.
No other file may import `@sentry/react` directly.

```
component / service
      ↓
useLogger(feature)  or  logger.error(...)
      ↓
src/lib/logger/logger.ts   ← only file that calls Sentry.captureException / captureMessage
      ↓
Sentry (staging/prod only)
```

**Sentry import rule — enforced:**
- ✅ Allowed: `src/lib/logger/logger.ts`, `src/lib/logger/sentry.ts`
- ❌ Forbidden everywhere else — use `@/lib/logger` instead

---

## Log Levels & Environment Behavior

| Level | Dev (console) | Staging/Prod (Sentry) | When to use |
|---|---|---|---|
| `debug` | `console.debug` | Suppressed | Verbose state/flow — dev only |
| `info` | `console.info` | Breadcrumb only | Auth events, route changes, key actions |
| `warn` | `console.warn` | Breadcrumb + warning | Recoverable issues, slow queries, 401s |
| `error` | `console.error` | `captureException` | API failures, caught exceptions |
| `fatal` | `console.error` | `captureException` (critical) | Unhandled crashes, render errors |

> Rule: `debug` and `info` never reach Sentry in staging/prod — this keeps noise low.

---

## Core Logger — `src/lib/logger/logger.ts`

```typescript
import * as Sentry from "@sentry/react"; // Only allowed here and in sentry.ts

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export interface LogContext { [key: string]: unknown; }

const isDev = import.meta.env.DEV;

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "color: #888",
  info:  "color: #4A90E2",
  warn:  "color: #F5A623",
  error: "color: #E74C3C",
  fatal: "color: #8E44AD; font-weight: bold",
};

function consoleOutput(level: LogLevel, message: string, context?: LogContext): void {
  const formatted = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  const style = LEVEL_COLORS[level];
  const extra = context ? [context] : [];
  switch (level) {
    case "debug": console.debug(`%c${formatted}`, style, ...extra); break;
    case "info":  console.info(`%c${formatted}`, style, ...extra); break;
    case "warn":  console.warn(`%c${formatted}`, style, ...extra); break;
    default:      console.error(`%c${formatted}`, style, ...extra); break;
  }
}

function sendToSentry(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (isDev) return;
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context as Record<string, unknown>);
    scope.setLevel(level === "fatal" ? "fatal" : level === "error" ? "error" : "warning");
    if (level === "warn") {
      scope.addBreadcrumb({ message, level: "warning", data: context });
    } else if (level === "error" || level === "fatal") {
      if (error) Sentry.captureException(error);
      else Sentry.captureMessage(message, level === "fatal" ? "fatal" : "error");
    }
  });
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (isDev) { consoleOutput(level, message, context); return; }
  if (level === "debug" || level === "info") return; // suppressed in staging/prod
  sendToSentry(level, message, context, error);
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info:  (message: string, context?: LogContext) => log("info",  message, context),
  warn:  (message: string, context?: LogContext) => log("warn",  message, context),
  error: (message: string, context?: LogContext, error?: Error) => log("error", message, context, error),
  fatal: (message: string, context?: LogContext, error?: Error) => log("fatal", message, context, error),
};
```

---

## Sentry Init — `src/lib/logger/sentry.ts`

```typescript
import * as Sentry from "@sentry/react"; // Only allowed here and in logger.ts

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const mode = import.meta.env.MODE;
  if (!dsn || mode === "development") return;

  Sentry.init({
    dsn,
    environment: mode,
    tracesSampleRate: mode === "production" ? 0.2 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    beforeSend(event) {
      // Strip PII before sending — never remove this block
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
```

**Required env vars** — add to `.env.staging` and `.env.production` only, never `.env`:
```
VITE_SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
```

---

## Public API — `src/lib/logger/index.ts`

```typescript
export { logger } from "./logger";
export type { LogLevel, LogContext } from "./logger";
export { initSentry } from "./sentry";
export { initWebVitals, trackQueryPerformance } from "./performance";
```
