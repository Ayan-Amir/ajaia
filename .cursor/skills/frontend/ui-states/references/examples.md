# UI States — Component Examples

## Spinner — `src/components/common/Spinner.tsx`
```typescript
import { cn } from "@/utils/cn";
interface SpinnerProps { size?: "sm" | "md" | "lg"; className?: string; }
const SIZE_CLASSES = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-4" };
export function Spinner({ size = "md", className }: SpinnerProps) {
  return <div role="status" aria-label="Loading" className={cn("animate-spin rounded-full border-muted border-t-primary", SIZE_CLASSES[size], className)} />;
}
```

## PageLoader — `src/components/common/PageLoader.tsx`
For full-page transitions — route-level Suspense fallback, auth loading.
```typescript
import { Spinner } from "@/components/common/Spinner";
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

## EmptyState — `src/components/common/EmptyState.tsx`
```typescript
import { MESSAGES } from "@/constants";
import { cn } from "@/utils/cn";
interface EmptyStateProps { title?: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string; }
export function EmptyState({ title = MESSAGES.EMPTY.DEFAULT, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center px-4", className)}>
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

## ErrorState — `src/components/common/ErrorState.tsx`
Shown inside a section/card alongside the automatic toast.
```typescript
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/utils/cn";
interface ErrorStateProps { title?: string; message?: string; className?: string; }
export function ErrorState({ title = "Something went wrong", message = "An error occurred while loading this content.", className }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("my-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
```

---

## QueryStateHandler — `src/components/common/QueryStateHandler.tsx`

```typescript
import { Spinner } from "./Spinner";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { MESSAGES } from "@/constants";

interface QueryStateHandlerProps<T> {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  children: (data: T) => React.ReactNode;
}

export function QueryStateHandler<T>({
  isLoading, isError, data, isEmpty,
  loadingFallback, errorFallback, emptyFallback,
  emptyTitle, emptyDescription, children,
}: QueryStateHandlerProps<T>) {
  if (isLoading) return <>{loadingFallback ?? <div className="flex justify-center py-12"><Spinner /></div>}</>;
  if (isError) return <>{errorFallback ?? <ErrorState />}</>;
  if (!data || (isEmpty && isEmpty(data))) {
    return <>{emptyFallback ?? <EmptyState title={emptyTitle ?? MESSAGES.EMPTY.DEFAULT} description={emptyDescription} />}</>;
  }
  return <>{children(data)}</>;
}
```

**Usage example:**

```typescript
<QueryStateHandler
  isLoading={isLoading}
  isError={isError}
  data={data}
  isEmpty={(d) => d.length === 0}
  loadingFallback={<CardSkeleton count={3} />}
  emptyTitle="No products found"
  emptyDescription="Try adjusting your filters."
>
  {(products) => (
    <div className="grid grid-cols-3 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )}
</QueryStateHandler>
```

---

## Skeleton Components — `src/components/common/skeletons/`

> **Index key exception:** Skeleton components use array index as `key`. This is intentional —
> these are **static placeholder arrays** with no identity or reordering. Do NOT copy this
> pattern for dynamic data lists; real data must use a stable unique id as key.

```typescript
// CardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </>
  );
}

// TableSkeleton.tsx
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ListSkeleton.tsx
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md flex-none" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// FormSkeleton.tsx
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 mt-2" />
    </div>
  );
}
```
