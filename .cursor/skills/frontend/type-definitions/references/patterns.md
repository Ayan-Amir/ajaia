# Type Definition Patterns

## Goal
Keep API contracts, domain types, and shared boundaries explicit, composable, and safe.

## Placement Pattern
- Put shared cross-feature contracts in `src/types/common/`.
- Put auth contracts in `src/types/auth/auth.types.ts`.
- Put feature-local contracts in `src/types/<feature>/`.
- Keep API-facing types in `<feature>.api.types.ts`.
- Keep UI/domain-facing types in `<feature>.types.ts`.
- Re-export public feature types from `src/types/<feature>/index.ts`.

## API Contract Pattern
```ts
// src/types/orders/orders.api.types.ts
export interface OrderApiItem {
  id: string;
  status: 'pending' | 'paid' | 'failed';
  total_cents: number;
  customer_email: string | null;
  created_at: string;
}

export interface ListOrdersApiResponse {
  data: OrderApiItem[];
  next_cursor: string | null;
}
```

## Domain Type Pattern
```ts
// src/types/orders/orders.types.ts
export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'failed';
  totalCents: number;
  customerEmail: string | null;
  createdAtIso: string;
}

export interface OrdersPage {
  items: Order[];
  nextCursor: string | null;
}
```

## Mapper Boundary Pattern
```ts
// src/types/orders/orders.mapper.ts
import type { ListOrdersApiResponse, OrderApiItem } from './orders.api.types';
import type { Order, OrdersPage } from './orders.types';

const mapOrder = (api: OrderApiItem): Order => ({
  id: api.id,
  status: api.status,
  totalCents: api.total_cents,
  customerEmail: api.customer_email,
  createdAtIso: api.created_at,
});

export const mapOrdersPage = (api: ListOrdersApiResponse): OrdersPage => ({
  items: api.data.map(mapOrder),
  nextCursor: api.next_cursor,
});
```

## Shared Error + Pagination Pattern
```ts
// src/types/common/error.types.ts
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// src/types/common/pagination.types.ts
export interface CursorPage<TItem> {
  items: TItem[];
  nextCursor: string | null;
}
```

## Service Boundary Pattern
```ts
// src/types/services.types.ts
export interface RequestOptions {
  signal?: AbortSignal;
  traceId?: string;
}
```

## Export Hygiene Pattern
```ts
// src/types/orders/index.ts
export type { Order, OrdersPage } from './orders.types';
export type { OrderApiItem, ListOrdersApiResponse } from './orders.api.types';
```

## Ownership Notes
- This skill owns type location and contract shape guidance.
- Query hooks are owned by `api-integration-data-layer`.
- ErrorBoundary and logger/Sentry implementations are owned by `error-boundaries` and `logging-monitoring`.
