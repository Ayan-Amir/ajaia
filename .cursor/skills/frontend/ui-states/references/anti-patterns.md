# UI States — Anti-Patterns

## Inline State Checks in Components

```typescript
// ❌ Scattered inline checks — inconsistent UI, repeated logic
if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error</div>;
if (!data) return <div>No data</div>;

// ✅ Use QueryStateHandler — consistent, one place
<QueryStateHandler isLoading={isLoading} isError={isError} data={data} isEmpty={(d) => !d.length}>
  {(data) => <DataTable data={data} />}
</QueryStateHandler>
```

---

## Hardcoded Error or Empty Messages

```typescript
// ❌ Hardcoded strings scattered across components
toast.error("Something went wrong");
<p>No results found</p>

// ✅ Use MESSAGES constants from @/constants
toast.error(MESSAGES.GENERIC_ERROR);
<EmptyState title={MESSAGES.EMPTY.DEFAULT} />
```

---

## Calling logger Directly Without the Abstraction

```typescript
// ❌ Direct Sentry or console calls — bypasses logging-monitoring patterns
Sentry.captureException(error);
console.error("Query failed", error);

// ✅ Use @/lib/logger — owned by logging-monitoring skill
logger.error("Query failed", { queryKey }, error instanceof Error ? error : undefined);
```

---

## Catching Errors Per-Component Instead of Globally

```typescript
// ❌ Per-component catch — duplicates error handling, inconsistent toast
const { data } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
useEffect(() => {
  if (isError) toast.error("Failed to load");
}, [isError]);

// ✅ queryClient.ts handles toast globally — no per-component catch needed
// Just use QueryStateHandler for inline ErrorState
```

---

## Using index as key for Dynamic Data

```typescript
// ❌ Index key for dynamic/real data — breaks reconciliation on reorder/delete
{items.map((item, i) => <ItemCard key={i} item={item} />)}

// ✅ Stable unique id from the data
{items.map((item) => <ItemCard key={item.id} item={item} />)}
```

> Skeleton components (CardSkeleton, TableSkeleton, etc.) are the **only exception** — they
> use index keys intentionally because they are static placeholder arrays with no identity.
> This exception does not apply to any component rendering real data.

---

## Skipping Empty State Handling

```typescript
// ❌ Rendering nothing or undefined when data is empty
{data?.map((item) => <Row key={item.id} item={item} />)}

// ✅ Always handle the empty case explicitly
<QueryStateHandler
  isLoading={isLoading}
  isError={isError}
  data={data}
  isEmpty={(d) => d.length === 0}
  emptyTitle="No items yet"
>
  {(items) => items.map((item) => <Row key={item.id} item={item} />)}
</QueryStateHandler>
```

---

## Using Spinner for Section-Level Loading When Shape Is Known

```typescript
// ❌ Generic spinner for a card list — jarring, layout shift on load
if (isLoading) return <Spinner />;

// ✅ Skeleton matching the content shape
if (isLoading) return <CardSkeleton count={3} />;
// or via QueryStateHandler:
<QueryStateHandler loadingFallback={<CardSkeleton count={3} />} ...>
```
