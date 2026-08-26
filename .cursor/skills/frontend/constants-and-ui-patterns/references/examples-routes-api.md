# Constants — Routes & API Endpoints

## routes.ts — `src/constants/routes.ts`

Never hardcode paths in `<Link>`, `navigate()`, or `<Route path>`.

```typescript
export const ROUTES = {
  // Public
  HOME:             "/",
  LOGIN:            "/login",
  REGISTER:         "/register",
  FORGOT_PASSWORD:  "/forgot-password",
  RESET_PASSWORD:   "/reset-password",

  // Authenticated
  DASHBOARD:        "/dashboard",
  PROFILE:          "/profile",
  SETTINGS:         "/settings",

  // Dynamic segments — use builder functions below for type-safe interpolation
  USERS:            "/users",
  USER_DETAIL:      "/users/:id",
  PRODUCTS:         "/products",
  PRODUCT_DETAIL:   "/products/:id",

  // Admin
  ADMIN:            "/admin",
  ADMIN_USERS:      "/admin/users",
} as const;

// Use these for dynamic segments — never string-concatenate manually
export const buildRoute = {
  userDetail:    (id: string | number) => `/users/${id}`,
  productDetail: (id: string | number) => `/products/${id}`,
};
```

**Usage:**
```typescript
import { ROUTES, buildRoute } from "@/constants";

<Link to={ROUTES.DASHBOARD}>Dashboard</Link>
navigate(buildRoute.userDetail(user.id))
<Route path={ROUTES.USER_DETAIL} element={<UserDetail />} />
```

---

## api.ts — `src/constants/api.ts`

Never hardcode `/api/users` or any endpoint path in a query function.

```typescript
import env from "@/config/env"; // environment-management skill

export const API_BASE_URL = env.VITE_API_BASE_URL;

export const API = {
  AUTH: {
    LOGIN:            "/auth/login",
    LOGOUT:           "/auth/logout",
    REGISTER:         "/auth/register",
    REFRESH:          "/auth/refresh",
    FORGOT_PASSWORD:  "/auth/forgot-password",
    RESET_PASSWORD:   "/auth/reset-password",
    ME:               "/auth/me",
  },

  USERS: {
    BASE:   "/users",
    BY_ID:  (id: string | number) => `/users/${id}`,
    AVATAR: (id: string | number) => `/users/${id}/avatar`,
  },

  // Example domain — replace with your own
  PRODUCTS: {
    BASE:       "/products",
    BY_ID:      (id: string | number) => `/products/${id}`,
    CATEGORIES: "/products/categories",
  },
} as const;
```

**Usage in React Query:**
```typescript
import { API } from "@/constants";

queryFn: () => apiClient.get(API.USERS.BY_ID(userId))
queryFn: () => apiClient.get(API.PRODUCTS.BASE)
```

> `API_BASE_URL` is read from `env.VITE_API_BASE_URL` (environment-management skill) —
> never from `import.meta.env` directly.
