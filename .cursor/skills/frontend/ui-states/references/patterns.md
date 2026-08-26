# UI States — Core Patterns

## The Four States Rule

Every component that fetches data **must** explicitly handle all four states. No exceptions.

```
loading → Skeleton (preferred) or Spinner
error   → log via logger + toast (automatic) + inline ErrorState
empty   → EmptyState with a helpful message
success → render data
```

Use `QueryStateHandler` to handle all four in one place — never inline `isLoading` checks.

---

## STALE_TIME Constants

Add to `src/constants/index.ts` (or `src/constants.ts`) before using `queryClient.ts`:

```typescript
export const STALE_TIME = {
  SHORT: 30_000,        // 30s — frequently updated data (notifications, feeds)
  MEDIUM: 5 * 60_000,  // 5m  — standard API data (lists, profiles)
  LONG: 30 * 60_000,   // 30m — rarely changed data (config, enums)
  STATIC: Infinity,    // Never refetch — truly static data (country list, etc.)
} as const;
```

---

## logger Reference

`@/lib/logger` is **owned by the `logging-monitoring` skill**. Set it up there first.
Minimal contract this skill expects:

```typescript
// src/lib/logger.ts — implement in logging-monitoring skill
export const logger = {
  error: (message: string, context?: Record<string, unknown>, error?: Error) => {
    // Sentry.captureException / console.error — see logging-monitoring skill
  },
};
```

Do not define the full logger here — import it from `@/lib/logger` as-is.

---

## queryClient.ts Pattern

File: `src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { logger } from "@/lib/logger";
import { MESSAGES, STALE_TIME } from "@/constants";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return MESSAGES.GENERIC_ERROR;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.MEDIUM, // Global fallback — per-query overrides take precedence
      retry: 2,                     // For transient network failures only — see retry rule below
    },
    mutations: {
      onError: (error: unknown) => {
        const message = getErrorMessage(error);
        logger.error("Mutation failed", { message }, error instanceof Error ? error : undefined);
        toast.error(message);
      },
    },
  },
});

queryClient.getQueryCache().subscribe((event) => {
  if (
    event.type === "observerResultsUpdated" &&
    event.query.state.status === "error" &&
    event.query.getObserversCount() > 0
  ) {
    const error = event.query.state.error;
    const message = getErrorMessage(error);
    logger.error(
      "Query failed",
      { queryKey: JSON.stringify(event.query.queryKey), message },
      error instanceof Error ? error : undefined
    );
    toast.error(message);
  }
});
```

**Wire `ToastContainer` in `AppProviders`:**

```typescript
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover />
    </QueryClientProvider>
  );
}
```

---

## staleTime Override Rule

The global `staleTime: STALE_TIME.MEDIUM` in `queryClient.ts` is the **fallback only**.
Per-query `staleTime` always takes precedence and must be set whenever the query's
freshness requirement differs from the default:

```typescript
// Per-query override — always wins over global default
useQuery({ queryKey: ["config"], queryFn: fetchConfig, staleTime: STALE_TIME.STATIC });
```

---

## Retry Rule — 4xx Errors

The global `retry: 2` is for transient **network failures** only.
4xx client errors will **never resolve** on retry — set `retry: false` on those queries:

```typescript
// Any query that can return 4xx (auth, not-found, validation)
useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
  retry: false, // 4xx errors must not be retried
});
```

Rule: if the query calls an endpoint that can return 401, 403, 404, or 422 — set `retry: false`.

---

## Button Loading State (Mutations)

```typescript
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" /> Saving...
        </span>
      ) : "Save"}
    </Button>
  );
}
```
