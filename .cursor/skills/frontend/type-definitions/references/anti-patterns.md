# Anti-Patterns

## 1) Using `any` at Service Boundaries
Bad:
```ts
const response = await apiClient.get<any>('/orders');
return response.data;
```

Good:
```ts
const response = await apiClient.get<ListOrdersApiResponse>('/orders');
return mapOrdersPage(response.data);
```

## 2) Reusing API Types as Domain Types
Bad:
```ts
export type Order = OrderApiItem;
```

Good:
```ts
export interface Order {
  id: string;
  totalCents: number;
}
```

## 3) Runtime Logic Inside `*.types.ts`
Bad:
```ts
export const toAppError = (e: unknown) => ({ code: 'x', message: String(e) });
```

Good:
```ts
// Keep runtime transforms in src/utils/, keep *.types.ts definition-only.
```

## 4) Exporting Internal Helpers Publicly
Bad:
```ts
export type RawOrderMappingPair = [OrderApiItem, Order];
```

Good:
```ts
// Keep internal helper type file-local unless required by external modules.
```

## 5) Cross-Skill Ownership Violations
Do not define these patterns in this skill:
- TanStack Query hooks or key factories (`api-integration-data-layer` owns)
- `queryClient.ts` setup (`logging-monitoring` owns)
- ErrorBoundary implementation (`error-boundaries` owns)
- Logger/Sentry abstraction (`logging-monitoring` owns)
- RHF mode defaults (`validation-schemas` owns)
- Auth context implementation (`react-state-management` owns)
- Folder naming conventions (`routing-navigation` owns)
