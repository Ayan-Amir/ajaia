# Auth Session Examples

Complete working examples for route guards, token/session service, HTTP client auth handling, and logout flow.

Type declarations and auth context internals are owned by `type-definitions` and `react-state-management`.
This file consumes those contracts and focuses on auth/session behavior patterns.

## 1) `src/services/auth-service.ts`

```ts
import type { AuthSession } from "@/types/auth/auth.types";

const SESSION_KEY = "auth_session";

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
```

## 2) `src/routes/PrivateRoute.tsx`

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/services/auth-service";

export function PrivateRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
```

## 3) `src/routes/RoleRoute.tsx`

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { getSession, isAuthenticated } from "@/services/auth-service";
import type { UserRole } from "@/types/auth/auth.types";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getSession()?.user.role;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
```

## 4) `src/services/http-client.ts`

```ts
import axios from "axios";
import { clearSession, getAccessToken } from "@/services/auth-service";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearSession();
      window.location.assign("/login");
    }

    if (status === 403) {
      window.location.assign("/forbidden");
    }

    return Promise.reject(error);
  }
);
```

## 5) `src/routes/createBrowserRouter.tsx`

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { isAuthenticated } from "@/services/auth-service";

export const router = createBrowserRouter([
  { path: "/login", element: <div>Login Page</div> },
  { path: "/forbidden", element: <div>Forbidden</div> },

  {
    element: <PrivateRoute />,
    children: [
      { path: "/dashboard", element: <div>Dashboard</div> },
      {
        element: <RoleRoute allowedRoles={["admin"]} />,
        children: [{ path: "/admin", element: <div>Admin</div> }],
      },
    ],
  },

  {
    path: "*",
    element: isAuthenticated() ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/login" replace />
    ),
  },
]);
```

## 6) Logout action example

```ts
import { clearSession } from "@/services/auth-service";

export function logout() {
  clearSession();
  window.location.replace("/login");
}
```
