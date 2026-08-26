# Loaders And Redirects

Use this reference for loader auth checks, loader role checks, redirects, post-login
redirects, navigation blocking, and route-level access enforcement.

## Loader-Based Auth Protection

Use loader redirects when navigation must be blocked before rendering.

```ts
import { redirect } from 'react-router-dom';

import { ROUTES } from '../routePaths';

function readSessionToken(): string | null {
	return localStorage.getItem('token');
}

export function requireSessionToken(): string {
	const token = readSessionToken();

	if (!token) {
		throw redirect(ROUTES.LOGIN);
	}

	return token;
}
```

Protected loader example:

```ts
export async function dashboardLoader() {
	const token = requireSessionToken();

	return { token };
}
```

Rules:

- Use loader redirects when auth must block navigation before render.
- Keep auth enforcement aligned between loaders and UI guards.
- Keep loader auth logic lightweight and predictable.
- Use the same auth source of truth as the rest of the app.
- Never use React hooks inside loaders.

## Role-Based Loader Protection

Use loader-level role checks when route access must be enforced before rendering.

```ts
import { redirect } from 'react-router-dom';

import { ROUTES } from '../routePaths';

export type UserRole = 'admin' | 'manager' | 'member';

export function requireRole(userRole: UserRole, allowedRoles: UserRole[]) {
	if (!allowedRoles.includes(userRole)) {
		throw redirect(ROUTES.FORBIDDEN);
	}
}
```

Protected admin loader example:

```ts
export async function adminLoader() {
	const role: UserRole = 'member';

	requireRole(role, ['admin']);

	return null;
}
```

Rules:

- Keep loader role checks aligned with component guard behavior.
- Use one consistent forbidden handling strategy product-wide.
- Do not duplicate role-checking logic across multiple loaders unnecessarily.
- Prefer shared helper functions for access enforcement.

## Redirect After Login

When a user is redirected from a protected route, return them to the original destination
after successful login.

```tsx
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../routePaths';

type RedirectState = {
	from?: {
		pathname?: string;
	};
};

export function useRedirectAfterLogin() {
	const location = useLocation();
	const navigate = useNavigate();

	const state = location.state as RedirectState | null;

	const redirectTo = state?.from?.pathname ?? ROUTES.DASHBOARD;

	const redirectAfterLogin = useCallback(() => {
		navigate(redirectTo, {
			replace: true,
		});
	}, [navigate, redirectTo]);

	return {
		redirectAfterLogin,
	};
}
```

Rules:

- Prefer the original intended destination when available.
- Fallback to a safe default route.
- Use `replace` after login to avoid broken back-button behavior.
- Keep redirect logic centralized.

## Role-Based Default Landing Routes

Centralize role-based landing logic in one helper.

```ts
import { ROUTES } from '../routePaths';

export type UserRole = 'admin' | 'manager' | 'member';

export function getDefaultRouteByRole(role: UserRole): string {
	switch (role) {
		case 'admin':
			return ROUTES.ADMIN;

		case 'manager':
			return ROUTES.DASHBOARD;

		case 'member':
			return ROUTES.PROFILE;

		default:
			return ROUTES.ROOT;
	}
}
```

Rules:

- Do not hardcode landing routes across multiple auth flows.
- Keep role-to-route mapping centralized.
- Always use route constants.

## Redirect Patterns

Good:

```tsx
<Navigate to={ROUTES.LOGIN} replace />
```

Good:

```ts
throw redirect(ROUTES.FORBIDDEN);
```

Bad:

```tsx
window.location.href = '/login';
```

Rules:

- Use `Navigate` for component-level redirects.
- Use `redirect()` inside loaders and actions.
- Avoid `window.location` for internal app navigation.
- Use `replace` when the previous route should not remain in history.

## Loader Rules

- Loaders run outside React.
- Never use React hooks inside loaders.
- Keep loaders route-focused.
- Avoid large business workflows inside route loaders.
- Use loaders for navigation-coupled data and access checks.
- Keep loaders predictable and serializable.

## Actions And Navigation State

Use route actions only when the route owns the form workflow.

Rules:

- Use actions for route-bound mutations when appropriate.
- Use `useNavigation()` for pending navigation and submission state.
- Keep mutation workflows aligned with project architecture.
- Avoid mixing unrelated async orchestration into route configs.

## Route Error Handling

Use route-level error handling for loader and action failures.

```tsx
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return <div>{error.status}</div>;
	}

	return <div>Something went wrong.</div>;
}
```

Rules:

- Use `errorElement` for route-level failures.
- Keep error UIs user-safe and accessible.
- Avoid leaking sensitive internal details.
- Keep route error handling separate from business-specific error logic.

## Pending Navigation UI

Route transitions should provide clear loading feedback.

Good:

```tsx
const navigation = useNavigation();

const isLoading = navigation.state === 'loading';
```

Rules:

- Lazy routes must show loading fallbacks.
- Data routes should expose loading or submitting state when needed.
- Loading states should come from the shared design system.
- Avoid blank screens during route transitions.

## Naming Standards

```txt
src/app/router/loaders/
  requireAuth.ts
  requireRole.ts
```

Rules:

- Use camelCase for loader helper files.
- Keep loader helpers small and focused.
- Use action-oriented names like `requireAuth`.
