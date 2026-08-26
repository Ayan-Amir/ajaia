# Route Patterns

Use this reference for route constants, dynamic route helpers, router setup, layouts, lazy
loading, basename, and not-found routes.

## Import Standard

For React Router 7 data-router apps, prefer imports from `react-router` and
`react-router/dom`.

```tsx
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
```

Rules:

- Prefer `react-router` for routing APIs such as `createBrowserRouter`, `Navigate`,
  `Outlet`, `Link`, `NavLink`, `useNavigate`, `redirect`, and `generatePath`.
- Prefer `react-router/dom` for `RouterProvider` in DOM applications.
- Use `react-router-dom` only when the existing project has not migrated yet.
- Keep import style consistent across the app.

## Route Constants

Keep all route paths centralized in `src/app/router/routePaths.ts`.

```ts
export const ROUTES = {
	ROOT: '/',
	LOGIN: '/login',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	SETTINGS: '/settings',
	FORBIDDEN: '/forbidden',
	UNAUTHORIZED: '/unauthorized',
	NOT_FOUND: '*',
} as const;
```

Rules:

- Never hardcode route strings across components.
- Use route constants in `Link`, `NavLink`, `Navigate`, loaders, actions, and
  `useNavigate`.
- Keep route keys uppercase.
- Use nested route objects only when the project has enough routes to justify grouping.

## Dynamic Route Helpers

Keep dynamic path creation centralized in `src/app/router/routeHelpers.ts`.

Prefer `generatePath` for dynamic routes.

```ts
import { generatePath } from 'react-router';

export const ROUTE_HELPERS = {
	userDetail: (userId: string) => generatePath('/users/:userId', { userId }),
	projectDetail: (projectId: string) =>
		generatePath('/projects/:projectId', { projectId }),
} as const;
```

Rules:

- Never concatenate route strings manually.
- Use descriptive param names.
- Validate required params before navigation when needed.
- Keep helper names action-oriented and specific.

Bad:

```ts
navigate('/users/' + id);
```

Good:

```ts
navigate(ROUTE_HELPERS.userDetail(id));
```

## Router Setup

Create the app router in `src/app/router/index.tsx`.

```tsx
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { routes } from './routeConfig';

export const router = createBrowserRouter(routes);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
```

Rules:

- Use `createBrowserRouter` for the main app router.
- Use `RouterProvider` from `react-router/dom` for DOM apps.
- Keep router creation isolated in one place.
- Avoid nested top-level `<Routes>` trees for the main application.
- Export the router provider cleanly for app entrypoint usage.

## Route Configuration

Keep route configuration in `src/app/router/routeConfig.tsx`.

Rules:

- Keep the route tree declarative.
- Group routes by layout or access type.
- Use index routes for default child pages.
- Prefer parent wrappers for shared guards or layouts.
- Do not repeat the same guard on every child when a parent route can handle it.
- Do not put large business workflows inside route definitions.

## Layout Routes

Use layout routes for shared page structure.

Each layout must render `Outlet`.

```tsx
import { Outlet } from 'react-router';

export function AppLayout() {
	return (
		<div>
			<header>App Header</header>

			<main>
				<Outlet />
			</main>
		</div>
	);
}
```

Rules:

- Use layouts to organize shared chrome and page structure.
- Keep unrelated permission logic out of layouts unless intentionally required.
- Prefer nested routing over duplicated wrappers.
- Name layout files with PascalCase, such as `AppLayout.tsx`.

## Lazy Loading

Prefer React Router route-level `lazy` when splitting complete route modules.

Use route-level `lazy` when the route owns its page component, loader, action, or error
boundary.

```tsx
{
	path: ROUTES.DASHBOARD,
	lazy: () => import('@/pages/dashboard/DashboardRoute'),
}
```

The lazy route module should export route properties.

```tsx
export { DashboardPage as Component } from './DashboardPage';
export { dashboardLoader as loader } from './dashboardLoader';
export { DashboardErrorBoundary as ErrorBoundary } from './DashboardErrorBoundary';
```

Use React `lazy()` and `Suspense` when only splitting a page component and the project is
not using route modules.

```tsx
import { lazy, Suspense } from 'react';

import { PageLoader } from '@/components/ui/PageLoader';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

const withSuspense = (node: React.ReactNode) => (
	<Suspense fallback={<PageLoader />}>{node}</Suspense>
);
```

Rules:

- Prefer route-level `lazy` for enterprise-scale data-router apps.
- Use React `lazy()` only for component-level code splitting.
- Lazy load route pages, not small shared UI components.
- Use shared design-system loading components for fallbacks.
- Do not use raw text, empty fragments, or bare strings as route loading fallbacks.
- Keep lazy imports consistent with the project’s chosen pattern.

## Basename

If the app is deployed under a subpath, configure `basename` once in router setup.

```ts
export const router = createBrowserRouter(routes, {
	basename: '/app',
});
```

Rules:

- Keep `basename` aligned with deployment configuration.
- Do not hardcode the base path across links or helpers.
- Confirm redirects and dynamic route helpers still work with the configured base path.

## Not Found Route

Always define a catch-all route.

```tsx
{
	path: ROUTES.NOT_FOUND,
	element: withSuspense(<NotFoundPage />),
}
```

Rules:

- Unknown routes must render a dedicated Not Found page.
- Do not leave users on blank or broken states.
- Keep the catch-all route last in the relevant route group.

## Naming Standards

Use camelCase for route utility files and PascalCase for React components.

```txt
src/app/router/
  index.tsx
  routeConfig.tsx
  routePaths.ts
  routeHelpers.ts
  layouts/
    RootLayout.tsx
    AppLayout.tsx
    AuthLayout.tsx
```

Rules:

- Route config file: `routeConfig.tsx`
- Route constants file: `routePaths.ts`
- Route helpers file: `routeHelpers.ts`
- Layout components: `RootLayout.tsx`, `AppLayout.tsx`, `AuthLayout.tsx`
- Page components: `DashboardPage.tsx`, `LoginPage.tsx`, `NotFoundPage.tsx`
