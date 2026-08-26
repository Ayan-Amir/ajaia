# Constants & UI Patterns — Component Utilities

## cn() Utility — `src/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```typescript
import { cn } from "@/utils/cn";

<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Component File Template

Every component file follows this structure:

```typescript
// 1. External imports
import { cn } from "@/utils/cn";
import { type SomeEnum, SOME_LABELS } from "@/constants";

// 2. Props interface
interface ComponentNameProps {
  value: SomeEnum;
  className?: string;
}

// 3. Component
export function ComponentName({ value, className }: ComponentNameProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* content */}
    </div>
  );
}
```

---

## Status Badge Pattern

Use this pattern for any component that renders an enum as a styled badge.

### OrderStatusBadge — `src/components/common/OrderStatusBadge.tsx`

```typescript
import { cn } from "@/utils/cn";
import { OrderStatus, ORDER_STATUS_LABELS } from "@/constants";

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.Pending]:    "bg-yellow-100 text-yellow-800",
  [OrderStatus.Processing]: "bg-blue-100   text-blue-800",
  [OrderStatus.Shipped]:    "bg-indigo-100 text-indigo-800",
  [OrderStatus.Delivered]:  "bg-green-100  text-green-800",
  [OrderStatus.Cancelled]:  "bg-red-100    text-red-800",
  [OrderStatus.Refunded]:   "bg-gray-100   text-gray-800",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
```

**Usage:**
```typescript
import { OrderStatusBadge } from "@/components/common/OrderStatusBadge";
import { OrderStatus } from "@/constants";

<OrderStatusBadge status={OrderStatus.Delivered} />
<OrderStatusBadge status={order.status} className="ml-2" />
```

---

## Setup — Install cn() Dependencies

Run the setup script before using `cn()` for the first time:

```bash
# installs clsx and tailwind-merge
bash scripts/setup.sh
```
