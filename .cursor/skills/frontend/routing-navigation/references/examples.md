# Examples

Use this reference for complete route configuration examples.

## Basic App Route Tree

```tsx
import { Navigate, type RouteObject } from 'react-router';

import { ROUTES } from './routePaths';

import { RootLayout } from './layouts/RootLayout';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { RoleGuard } from './guards/RoleGuard';

export const routes: RouteObject[] = [
	{
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Navigate to={ROUTES.DASHBOARD} replace />,
			},
			{
				element: <AuthLayout />,
				children: [
					{
						path: ROUTES.LOGIN,
						element: (
							<GuestGuard>
								<LoginPage />
							</GuestGuard>
						),
						lazy: () => import('@/pages/login/LoginRoute'),
					},
				],
			},
			{
				element: (
					<AuthGuard>
						<AppLayout />
					</AuthGuard>
				),
				children: [
					{
						path: ROUTES.DASHBOARD,
						lazy: () => import('@/pages/dashboard/DashboardRoute'),
					},
					{
						path: ROUTES.PROFILE,
						lazy: () => import('@/pages/profile/ProfileRoute'),
					},
					{
						path: ROUTES.ADMIN,
						element: (
							<RoleGuard allowedRoles={['admin']}>
								<AdminPage />
							</RoleGuard>
						),
						lazy: () => import('@/pages/admin/AdminRoute'),
					},
				],
			},
			{
				path: ROUTES.FORBIDDEN,
				lazy: () => import('@/pages/forbidden/ForbiddenRoute'),
			},
			{
				path: ROUTES.UNAUTHORIZED,
				lazy: () => import('@/pages/unauthorized/UnauthorizedRoute'),
			},
			{
				path: ROUTES.NOT_FOUND,
				lazy: () => import('@/pages/notFound/NotFoundRoute'),
			},
		],
	},
];
```

## Route Constants Example

```ts
export const ROUTES = {
	ROOT: '/',
	LOGIN: '/login',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	ADMIN: '/admin',
	FORBIDDEN: '/forbidden',
	UNAUTHORIZED: '/unauthorized',
	NOT_FOUND: '*',
} as const;
```

## Dynamic Route Helpers Example

```ts
import { generatePath } from 'react-router';

export const ROUTE_HELPERS = {
	userDetail: (userId: string) => generatePath('/users/:userId', { userId }),

	projectDetail: (projectId: string) =>
		generatePath('/projects/:projectId', { projectId }),
} as const;
```

## Layout Example

```tsx
import { Outlet } from 'react-router';

export function AppLayout() {
	return (
		<div className='app-shell'>
			<header>Header</header>

			<main>
				<Outlet />
			</main>
		</div>
	);
}
```

## Router Setup Example

```tsx
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { routes } from './routeConfig';

export const router = createBrowserRouter(routes);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
```

## Basename Example

```ts
export const router = createBrowserRouter(routes, {
	basename: '/app',
});
```

## React Router Lazy Route Module Example

Use this pattern when the route should lazy-load its component, loader, action, or error
boundary together.

```tsx
{
	path: ROUTES.DASHBOARD,
	lazy: () => import('@/pages/dashboard/DashboardRoute'),
}
```

```tsx
// pages/dashboard/DashboardRoute.tsx

export { DashboardPage as Component } from './DashboardPage';
export { dashboardLoader as loader } from './dashboardLoader';
export { DashboardErrorBoundary as ErrorBoundary } from './DashboardErrorBoundary';
```

## React Component Lazy Example

Use this only when splitting a component instead of a complete route module.

```tsx
import { lazy } from 'react';

const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
```

## Nested Route Example

```tsx
{
	path: ROUTES.SETTINGS,
	element: <SettingsLayout />,
	children: [
		{
			index: true,
			element: (
				<Navigate
					to={ROUTES.PROFILE_SETTINGS}
					replace
				/>
			),
		},
		{
			path: ROUTES.PROFILE_SETTINGS,
			element: <ProfileSettingsPage />,
		},
		{
			path: ROUTES.ACCOUNT_SETTINGS,
			element: <AccountSettingsPage />,
		},
	],
}
```

## Index Route Example

```tsx
{
	index: true,
	element: (
		<Navigate
			to={ROUTES.DASHBOARD}
			replace
		/>
	),
}
```

## Catch-All Route Example

```tsx
{
	path: ROUTES.NOT_FOUND,
	element: <NotFoundPage />,
}
```

## Recommended Route Grouping Pattern

```txt
RootLayout
├── AuthLayout
│   └── guest routes
│
├── AppLayout
│   └── authenticated routes
│
├── Forbidden
├── Unauthorized
└── NotFound
```

## Recommended Organization Pattern

```txt
src/
  app/
    router/
      routeConfig.tsx
      routePaths.ts
      routeHelpers.ts
      guards/
      layouts/
      loaders/

  pages/
    login/
    dashboard/
    profile/
    settings/
    admin/
```
