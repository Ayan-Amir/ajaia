# Constants & UI Patterns — Anti-Patterns

## 1. Hardcoded Route Paths

```typescript
// ❌ Magic string — breaks on rename, untraceable
<Link to="/dashboard">Dashboard</Link>
navigate("/users/" + user.id)

// ✅
import { ROUTES, buildRoute } from "@/constants";
<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
navigate(buildRoute.userDetail(user.id))
```

---

## 2. Hardcoded API Endpoints

```typescript
// ❌ Hardcoded paths scattered across query functions
queryFn: () => apiClient.get(`/api/users/${userId}`)
queryFn: () => apiClient.get("/products")

// ✅
import { API } from "@/constants";
queryFn: () => apiClient.get(API.USERS.BY_ID(userId))
queryFn: () => apiClient.get(API.PRODUCTS.BASE)
```

---

## 3. Importing from import.meta.env Directly

```typescript
// ❌ Bypasses validation — missing vars silently become undefined
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// ✅ Uses the validated env object from environment-management skill
import env from "@/config/env";
export const API_BASE_URL = env.VITE_API_BASE_URL;
```

---

## 4. Formatting Enum Values Inline

```typescript
// ❌ Presentation logic scattered — duplicated across every usage
<span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
<td>{user.role.toLowerCase()}</td>

// ✅ Label map is the single source of truth
import { ORDER_STATUS_LABELS, USER_ROLE_LABELS } from "@/constants";
<span>{ORDER_STATUS_LABELS[order.status]}</span>
<td>{USER_ROLE_LABELS[user.role]}</td>
```

---

## 5. Importing from Individual Constant Files

```typescript
// ❌ Bypasses the barrel — breaks tree-shaking and import hygiene
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/enums";
import { REGEX } from "@/constants/regex";

// ✅ Always import from the barrel
import { ROUTES, UserRole, REGEX } from "@/constants";
```

---

## 6. Custom Components in src/components/ui/

```typescript
// ❌ Mixing custom components with Shadcn primitives
// src/components/ui/OrderStatusBadge.tsx  ← WRONG location

// ✅ Custom components belong in common/ (2+ features) or feature folder (1 feature)
// src/components/common/OrderStatusBadge.tsx
```

The `ui/` folder is Shadcn-owned. Only add via CLI: `npx shadcn@latest add button`.

---

## 7. Skipping the Barrel Export

```typescript
// ❌ New constant file created but not exported from index.ts
// src/constants/notifications.ts — added, but forgotten in index.ts

// ✅ Every new file must be added to src/constants/index.ts
export * from "./notifications";
```

---

## 8. Business Logic in Constants

```typescript
// ❌ Constants with logic — untestable, confusing
export const IS_ADMIN = (role: string) => role === "admin" && featureFlags.adminEnabled;

// ✅ Constants are static values only — logic belongs in hooks or utils
export enum UserRole { Admin = "admin" }
// Logic lives in a hook: useIsAdmin(), or utility: hasRole()
```

---

## 9. STALE_TIME Key Mismatch

```typescript
// ❌ Using FOREVER key — inconsistent with ui-states skill
export const STALE_TIME = { FOREVER: Infinity };

// ✅ Use STATIC — aligned with queryClient defaults in ui-states skill
export const STALE_TIME = { STATIC: Infinity };
```
