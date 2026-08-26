# Error Boundaries — Fallback Components & Wiring

## RootFallback — `src/components/common/fallbacks/RootFallback.tsx`

```typescript
import { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";

export function RootFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Unexpected Error</h1>
        <p className="text-muted-foreground max-w-md">
          The application encountered an unexpected error. Our team has been notified.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-4 rounded-md bg-muted p-4 text-left text-xs text-destructive overflow-auto max-w-lg">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={resetErrorBoundary}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>Go Home</Button>
      </div>
    </div>
  );
}
```

---

## PageFallback — `src/components/common/fallbacks/PageFallback.tsx`

```typescript
import { FallbackProps } from "react-error-boundary";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Page failed to load</h2>
        <p className="text-sm text-muted-foreground">Something went wrong loading this page.</p>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">Reload page</Button>
    </div>
  );
}
```

---

## SectionFallback — `src/components/common/fallbacks/SectionFallback.tsx`

```typescript
import { FallbackProps } from "react-error-boundary";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface SectionFallbackProps extends FallbackProps { label?: string; }

export function SectionFallback({ resetErrorBoundary, label }: SectionFallbackProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20",
      "bg-destructive/5 p-6 text-center min-h-[120px]"
    )}>
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm font-medium text-foreground">{label ?? "This section failed to load"}</p>
      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={resetErrorBoundary}>
        <RefreshCw className="h-3 w-3" /> Try again
      </Button>
    </div>
  );
}
```

---

## AppProviders — Root boundary wraps everything

```typescript
// src/providers/AppProviders.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "@/lib/queryClient";
import { RootErrorBoundary } from "@/components/common/RootErrorBoundary";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover />
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
```

---

## AppRouter — PageErrorBoundary per route

```typescript
// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { PageErrorBoundary } from "@/components/common/PageErrorBoundary";
import { PageLoader } from "@/components/common/PageLoader";
import { ROUTES } from "@/constants";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={
          <PageErrorBoundary>
            <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
          </PageErrorBoundary>
        } />
        <Route path={ROUTES.USERS} element={
          <PageErrorBoundary>
            <Suspense fallback={<PageLoader />}><UsersPage /></Suspense>
          </PageErrorBoundary>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Dashboard — SectionBoundary per widget

```typescript
// src/pages/Dashboard.tsx
import { SectionBoundary } from "@/components/common/SectionBoundary";

export function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Critical widget — shows fallback with try-again button */}
      <SectionBoundary label="Revenue chart failed to load">
        <RevenueChart />
      </SectionBoundary>

      {/* Non-critical — disappears silently on crash */}
      <SectionBoundary silent>
        <RecentActivityFeed />
      </SectionBoundary>

      <SectionBoundary label="User stats failed to load">
        <UserStatsCard />
      </SectionBoundary>
    </div>
  );
}
```
