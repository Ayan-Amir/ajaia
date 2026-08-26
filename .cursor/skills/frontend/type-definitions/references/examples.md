# Complete Working Examples

## Example 1: Feature Type Files + Mapping
```ts
// src/types/invoices/invoices.api.types.ts
export interface InvoiceApi {
  id: string;
  issued_at: string;
  due_at: string | null;
  amount_cents: number;
  paid: boolean;
}

export interface ListInvoicesApiResponse {
  data: InvoiceApi[];
  next_cursor: string | null;
}

// src/types/invoices/invoices.types.ts
export interface Invoice {
  id: string;
  issuedAtIso: string;
  dueAtIso: string | null;
  amountCents: number;
  paid: boolean;
}

export interface InvoicesPage {
  invoices: Invoice[];
  nextCursor: string | null;
}

// src/types/invoices/invoices.mapper.ts
import type { InvoiceApi, ListInvoicesApiResponse } from './invoices.api.types';
import type { Invoice, InvoicesPage } from './invoices.types';

export const mapInvoice = (api: InvoiceApi): Invoice => ({
  id: api.id,
  issuedAtIso: api.issued_at,
  dueAtIso: api.due_at,
  amountCents: api.amount_cents,
  paid: api.paid,
});

export const mapInvoicesPage = (api: ListInvoicesApiResponse): InvoicesPage => ({
  invoices: api.data.map(mapInvoice),
  nextCursor: api.next_cursor,
});

// src/types/invoices/index.ts
export type { Invoice, InvoicesPage } from './invoices.types';
export type { InvoiceApi, ListInvoicesApiResponse } from './invoices.api.types';
```

## Example 2: Service Usage with Explicit Boundaries
```ts
// src/features/invoices/services/listInvoices.ts
import { apiClient } from '@/services/apiClient';
import type { RequestOptions } from '@/types/services.types';
import type { InvoicesPage } from '@/types/invoices';
import type { ListInvoicesApiResponse } from '@/types/invoices';
import { mapInvoicesPage } from '@/types/invoices/invoices.mapper';

export const listInvoices = async (
  accountId: string,
  options: RequestOptions = {},
): Promise<InvoicesPage> => {
  const response = await apiClient.get<ListInvoicesApiResponse>(
    `/accounts/${accountId}/invoices`,
    { signal: options.signal },
  );

  return mapInvoicesPage(response.data);
};
```

## Example 3: Auth Type Location
```ts
// src/types/auth/auth.types.ts
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAtIso: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}
```

## Example 4: Shared Contracts
```ts
// src/types/common/api.types.ts
export interface ApiListEnvelope<T> {
  data: T[];
  next_cursor: string | null;
}

// src/types/common/error.types.ts
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```
