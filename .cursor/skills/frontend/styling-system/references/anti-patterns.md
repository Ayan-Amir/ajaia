# Anti-Patterns

## 1) Hardcoded Visual Values In Components

Bad:
```tsx
<div className="rounded-[7px] bg-[#0284c7] px-[14px]">Buy</div>
```

Good:
```tsx
<div className="rounded-md bg-primary px-3.5">Buy</div>
```
Reason: token/utility naming supports reuse and global tuning.

## 2) Inline Style For Standard UI

Bad:
```tsx
<button style={{ backgroundColor: "#0284c7", borderRadius: 8 }}>Save</button>
```

Good:
```tsx
<button className="rounded-md bg-primary text-primary-foreground">Save</button>
```
Reason: inline styles bypass utility consistency and variants.

## 3) Variant Logic Scattered Across Callers

Bad:
```tsx
<button className={isDanger ? "bg-red-600" : "bg-sky-600"}>Delete</button>
```

Good:
```tsx
<button className={cn(buttonVariants({ variant: isDanger ? "danger" : "primary" }))}>Delete</button>
```
Reason: reusable components should centralize variant contracts.

## 4) Owning Another Skill's Contract

Bad:
```ts
// Added queryClient and Sentry init inside styling work
export const queryClient = new QueryClient();
Sentry.init({ dsn: "..." });
```

Good:
```ts
// Styling task defers operational ownership to logging-monitoring
// and keeps only component styling updates in this scope.
```
Reason: cross-skill overlap creates conflicting source-of-truth.
