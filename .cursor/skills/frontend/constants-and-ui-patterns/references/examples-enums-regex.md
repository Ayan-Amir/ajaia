# Constants — Enums & Regex Patterns

## enums.ts — `src/constants/enums.ts`

```typescript
// --- Roles & Status ---

export enum UserRole {
  Admin   = "admin",
  Manager = "manager",
  Member  = "member",
  Guest   = "guest",
}

export enum UserStatus {
  Active    = "active",
  Inactive  = "inactive",
  Suspended = "suspended",
  Pending   = "pending",
}

export enum OrderStatus {
  Pending    = "pending",
  Processing = "processing",
  Shipped    = "shipped",
  Delivered  = "delivered",
  Cancelled  = "cancelled",
  Refunded   = "refunded",
}

export enum PaymentStatus {
  Pending   = "pending",
  Paid      = "paid",
  Failed    = "failed",
  Refunded  = "refunded",
}

export enum NotificationType {
  Info    = "info",
  Success = "success",
  Warning = "warning",
  Error   = "error",
}

export enum SortOrder {
  Asc  = "asc",
  Desc = "desc",
}
```

---

## Display Label Maps

Every enum that renders as text in the UI **must** have a matching label map. Never call `.toLowerCase()` or format enum values inline in components.

```typescript
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]:   "Administrator",
  [UserRole.Manager]: "Manager",
  [UserRole.Member]:  "Member",
  [UserRole.Guest]:   "Guest",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.Active]:    "Active",
  [UserStatus.Inactive]:  "Inactive",
  [UserStatus.Suspended]: "Suspended",
  [UserStatus.Pending]:   "Pending",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]:    "Pending",
  [OrderStatus.Processing]: "Processing",
  [OrderStatus.Shipped]:    "Shipped",
  [OrderStatus.Delivered]:  "Delivered",
  [OrderStatus.Cancelled]:  "Cancelled",
  [OrderStatus.Refunded]:   "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]:  "Pending",
  [PaymentStatus.Paid]:     "Paid",
  [PaymentStatus.Failed]:   "Failed",
  [PaymentStatus.Refunded]: "Refunded",
};
```

**Usage:**
```typescript
import { OrderStatus, ORDER_STATUS_LABELS } from "@/constants";

// ✅ Always use the label map
<span>{ORDER_STATUS_LABELS[order.status]}</span>

// ❌ Never format inline
<span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
```

---

## regex.ts — `src/constants/regex.ts`

```typescript
export const REGEX = {
  EMAIL:           /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE:           /^\+?[1-9]\d{1,14}$/,
  URL:             /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  SLUG:            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  DIGITS_ONLY:     /^\d+$/,
  UUID:            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR:       /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
} as const;
```

**Usage in Zod schemas (`validation-schemas` skill):**
```typescript
import { REGEX } from "@/constants";

const schema = z.object({
  email:    z.string().regex(REGEX.EMAIL,    "Invalid email"),
  password: z.string().regex(REGEX.STRONG_PASSWORD, "Password too weak"),
  phone:    z.string().regex(REGEX.PHONE,    "Invalid phone number"),
});
```

**Usage in helpers (`reusable-helpers` skill):**
```typescript
import { REGEX } from "@/constants";

export const isValidEmail = (value: string) => REGEX.EMAIL.test(value);
export const isValidUrl   = (value: string) => REGEX.URL.test(value);
```
