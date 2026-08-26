# Guards And Access

Use this reference for auth guards, guest guards, role guards, forbidden handling, and
unauthorized handling.

## Auth Guard

Use a dedicated auth guard for protected routes.

```tsx
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '../routePaths';

type AuthGuardProps = {
	children?: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
	const location = useLocation();

	const isAuthenticated = false; // replace with real auth state

	if (!isAuthenticated) {
		return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
	}

	if (children) {
		return <>{children}</>;
	}

	return <Outlet />;
}
```

Rules:

- Keep auth guards focused only on access control.
- Preserve the intended destination when the login flow requires it.
- Use `replace` for auth redirects.
- Keep auth checks centralized at the route level.
- Do not fetch heavy business data inside guards.
- Do not duplicate auth checks across every page.

## Guest Guard

Use a guest guard for login or signup flows.

```tsx
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '../routePaths';

type GuestGuardProps = {
	children?: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
	const isAuthenticated = true; // replace with real auth state

	if (isAuthenticated) {
		return <Navigate to={ROUTES.DASHBOARD} replace />;
	}

	if (children) {
		return <>{children}</>;
	}

	return <Outlet />;
}
```

Rules:

- Prevent authenticated users from landing on login or signup screens unnecessarily.
- Redirect authenticated users to the correct post-login destination.
- Keep guest-access behavior centralized.

## Role Guard

Use a dedicated role guard for route-level role protection.

```tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '../routePaths';

export type UserRole = 'admin' | 'manager' | 'member';

type RoleGuardProps = {
	children: ReactNode;
	allowedRoles: UserRole[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
	const userRole: UserRole = 'member'; // replace with real role source

	const isAllowed = allowedRoles.includes(userRole);

	if (!isAllowed) {
		return <Navigate to={ROUTES.FORBIDDEN} replace />;
	}

	return <>{children}</>;
}
```

Rules:

- Protect the route itself, not only hidden UI controls.
- Keep role checks explicit and strongly typed.
- Redirect authenticated-but-forbidden users to a forbidden route.
- Keep role enforcement centralized.

## Forbidden vs Unauthorized

Keep unauthorized and forbidden flows separate.

Definitions:

- Unauthorized = user is not authenticated
- Forbidden = user is authenticated but lacks permission

Rules:

- Redirect unauthenticated users to login or unauthorized flows.
- Redirect authenticated-but-disallowed users to forbidden flows.
- Apply one consistent convention product-wide.
- Do not mix auth failures with permission failures.

## Parent Guard Pattern

Prefer parent route wrappers for shared access control.

Good:

```tsx
{
	element: (
		<AuthGuard>
			<AppLayout />
		</AuthGuard>
	),
	children: [
		{
			path: ROUTES.DASHBOARD,
			element: <DashboardPage />,
		},
		{
			path: ROUTES.PROFILE,
			element: <ProfilePage />,
		},
	],
}
```

Bad:

```tsx
{
	path: ROUTES.DASHBOARD,
	element: (
		<AuthGuard>
			<DashboardPage />
		</AuthGuard>
	),
}

{
	path: ROUTES.PROFILE,
	element: (
		<AuthGuard>
			<ProfilePage />
		</AuthGuard>
	),
}
```

## Nested Role Protection Example

```tsx
{
	element: (
		<AuthGuard>
			<AppLayout />
		</AuthGuard>
	),
	children: [
		{
			path: ROUTES.ADMIN,
			element: (
				<RoleGuard allowedRoles={['admin']}>
					<AdminPage />
				</RoleGuard>
			),
		},
	],
}
```

## Access Control Rules

- Hidden navigation links are not access control.
- Route protection must exist independently of UI visibility.
- Keep access checks aligned between route guards and loader checks.
- Keep guard logic small and predictable.
- Avoid mixing unrelated business logic into route protection.

## Pending Auth State

Protected routes must not flash restricted content while auth state is unresolved.

Good:

```tsx
if (isLoadingAuthState) {
	return <PageLoader />;
}
```

Bad:

```tsx
return <ProtectedPage />;
```

before auth state resolves.

Rules:

- Resolve auth state before rendering protected content.
- Use shared loading components from the design system.
- Prevent layout flicker during auth initialization.

## Naming Standards

```txt
src/app/router/guards/
  AuthGuard.tsx
  GuestGuard.tsx
  RoleGuard.tsx
```

Rules:

- Use PascalCase for guard component filenames.
- Suffix all guard components with `Guard`.
- Keep one responsibility per guard.
