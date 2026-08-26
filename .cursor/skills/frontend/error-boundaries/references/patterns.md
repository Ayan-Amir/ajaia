# Error Boundaries — Architecture & Boundary Components

## Three-Level Architecture

Never use a single global boundary — one crash should never blank the entire app.
Layer boundaries so failures are isolated to the smallest possible area.

```
App
├── <RootErrorBoundary>              ← Level 1: catastrophic app-wide crashes
│   └── Router
│       └── PageLayout
│           ├── <PageErrorBoundary>  ← Level 2: per-route crashes
│           │   ├── <SectionBoundary>← Level 3: widget/card isolation
│           │   │   └── <RevenueChart />   ← crash here = only this box breaks
│           │   └── <SectionBoundary>
│           │       └── <ActivityFeed />
│           └── Sidebar              ← never affected by content crashes
```

| Level | Component | Covers | Log level |
|---|---|---|---|
| 1 | `RootErrorBoundary` | Entire app | `logger.fatal` |
| 2 | `PageErrorBoundary` | One route/page | `logger.error` |
| 3 | `SectionBoundary` | One widget/card | `logger.warn` |

**Sentry rule:** Boundaries use `@/lib/logger` — never `import * as Sentry` directly.
`logger.fatal/error/warn` routes to Sentry internally via the `logging-monitoring` skill.

---

## RootErrorBoundary — `src/components/common/RootErrorBoundary.tsx`

Wraps the entire app. Catches catastrophic crashes (broken providers, bad context).

```typescript
import { ErrorBoundary } from "react-error-boundary";
import { logger } from "@/lib/logger";
import { RootFallback } from "./fallbacks/RootFallback";

export function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={RootFallback}
      onError={(error, info) => {
        logger.fatal("Root boundary caught crash", { componentStack: info.componentStack }, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## PageErrorBoundary — `src/components/common/PageErrorBoundary.tsx`

Wraps each route. Auto-resets on navigation so a crash on one page doesn't break others.

```typescript
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { PageFallback } from "./fallbacks/PageFallback";

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const resetRef = useRef<() => void>(null);

  useEffect(() => { resetRef.current?.(); }, [location.pathname]);

  return (
    <ErrorBoundary
      FallbackComponent={PageFallback}
      onError={(error, info) => {
        logger.error("Page boundary caught error", { componentStack: info.componentStack }, error);
      }}
      ref={(boundary) => {
        if (boundary) resetRef.current = () => boundary.resetErrorBoundary();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## SectionBoundary — `src/components/common/SectionBoundary.tsx`

Wraps any widget, card, or data-heavy section. Supports `silent` mode for non-critical sections.

```typescript
import { ErrorBoundary } from "react-error-boundary";
import { logger } from "@/lib/logger";
import { SectionFallback } from "./fallbacks/SectionFallback";

interface SectionBoundaryProps {
  children: React.ReactNode;
  label?: string;    // Shown in fallback: "Revenue chart failed to load"
  silent?: boolean;  // If true, renders nothing on crash (hides the broken section)
}

export function SectionBoundary({ children, label, silent = false }: SectionBoundaryProps) {
  const onError = (error: Error, info: { componentStack: string }) =>
    logger.warn("Section boundary caught error", { message: error.message, componentStack: info.componentStack });

  if (silent) {
    return <ErrorBoundary fallback={<></>} onError={onError}>{children}</ErrorBoundary>;
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <SectionFallback error={error} resetErrorBoundary={resetErrorBoundary} label={label} />
      )}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## useErrorBoundary — Forwarding Async Errors

Error boundaries only catch render errors — not async errors or event handlers.
Use `useErrorBoundary` to manually forward critical unrecoverable async errors.

```typescript
import { useErrorBoundary } from "react-error-boundary";

function DataWidget() {
  const { showBoundary } = useErrorBoundary();

  async function loadCriticalData() {
    try {
      const data = await fetchCriticalConfig();
      setData(data);
    } catch (error) {
      showBoundary(error); // forwards to nearest SectionBoundary or PageErrorBoundary
    }
  }
}
```

> Use only for **unrecoverable** async errors (broken auth state, missing critical config).
> For regular API failures, the global toast in `queryClient.ts` (ui-states skill) handles it.
