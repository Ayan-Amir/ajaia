# Error Boundaries — Anti-Patterns

## Single Global Boundary for the Entire App

```typescript
// ❌ One boundary = one crash blanks the entire app
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <EntireApp />
</ErrorBoundary>

// ✅ Three-level architecture — Root + Page + Section
<RootErrorBoundary>           {/* app-level */}
  <PageErrorBoundary>         {/* per route */}
    <SectionBoundary>         {/* per widget */}
      <RevenueChart />
    </SectionBoundary>
  </PageErrorBoundary>
</RootErrorBoundary>
```

---

## No Boundary at All

```typescript
// ❌ Render crash fails silently in production — blank screen, no recovery
<Dashboard />

// ✅ Wrap every page and critical widget
<PageErrorBoundary>
  <Dashboard />
</PageErrorBoundary>
```

---

## Direct Sentry Import Inside a Boundary

```typescript
// ❌ Violates the logging-monitoring skill rule — Sentry only allowed in src/lib/logger/
import * as Sentry from "@sentry/react";
onError={(error) => { Sentry.captureException(error); }}

// ✅ Route through logger — logger.ts handles Sentry internally
import { logger } from "@/lib/logger";
onError={(error, info) => { logger.fatal("Root boundary caught crash", { componentStack: info.componentStack }, error); }}
```

---

## Using Error Boundaries for API Failures

```typescript
// ❌ API errors are not render crashes — boundaries do not catch them
<ErrorBoundary fallback={<p>Failed to load users</p>}>
  <UserList />   {/* fetch fails — boundary does NOT trigger */}
</ErrorBoundary>

// ✅ Use QueryStateHandler from ui-states skill for API failures
<QueryStateHandler isLoading={isLoading} isError={isError} data={data} ...>
  {(users) => <UserList users={users} />}
</QueryStateHandler>
```

---

## Swallowing Async Errors Silently

```typescript
// ❌ Silent catch — crash never reaches Sentry, user sees nothing
async function loadCriticalData() {
  try { await fetchConfig(); }
  catch { /* nothing */ }
}

// ✅ Forward to boundary for unrecoverable failures
const { showBoundary } = useErrorBoundary();
async function loadCriticalData() {
  try { await fetchConfig(); }
  catch (error) { showBoundary(error); }
}
```

---

## Using showBoundary for Routine API Errors

```typescript
// ❌ Overkill — blanks the section for a recoverable API failure
const { showBoundary } = useErrorBoundary();
async function loadData() {
  try { await fetchUsers(); }
  catch (error) { showBoundary(error); } // renders fallback for a simple 500
}

// ✅ Let queryClient.ts toast handle routine API failures automatically
// Only use showBoundary for truly unrecoverable errors (broken auth state, missing critical config)
```

---

## Missing PageErrorBoundary Reset on Navigation

```typescript
// ❌ Boundary stays crashed when user navigates to another route
<ErrorBoundary FallbackComponent={PageFallback} onError={...}>
  {children}
</ErrorBoundary>

// ✅ Auto-reset on location change using useLocation + ref
const location = useLocation();
const resetRef = useRef<() => void>(null);
useEffect(() => { resetRef.current?.(); }, [location.pathname]);
```

---

## Wrong Log Level per Boundary

```typescript
// ❌ Section crash logged as fatal — inflates severity in Sentry
onError={(error) => logger.fatal("Section crashed", {}, error)}

// ✅ Match severity to impact
// RootErrorBoundary  → logger.fatal
// PageErrorBoundary  → logger.error
// SectionBoundary    → logger.warn
```
