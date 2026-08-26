# Navigation Helpers

Use this reference for `Link`, `NavLink`, `useNavigate`, active links, navigation helper
hooks, and programmatic navigation patterns.

## Declarative Navigation

Use `Link` and `NavLink` for standard in-app navigation.

```tsx
import {
	Link,
	NavLink,
} from 'react-router-dom';

import { ROUTES } from '../routePaths';

<Link to={ROUTES.DASHBOARD}>
	Dashboard
</Link>

<NavLink to={ROUTES.PROFILE}>
	Profile
</NavLink>
```

Rules:

- Prefer declarative navigation whenever possible.
- Use route constants instead of hardcoded paths.
- Keep navigation links readable and predictable.
- Avoid `window.location` for internal navigation.

## Active Links

Use `NavLink` for active-state styling.

```tsx
<NavLink to={ROUTES.DASHBOARD} end>
	Dashboard
</NavLink>
```

Rules:

- Use `end` for exact route matching where needed.
- Keep active-state logic declarative.
- Avoid manually comparing pathnames when `NavLink` already solves the problem.

## Programmatic Navigation

Use `useNavigate()` for event-driven navigation.

Wrap navigation handlers in `useCallback`.

```tsx
import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../routePaths';

export function ExampleButton() {
	const navigate = useNavigate();

	const handleClick = useCallback(() => {
		navigate(ROUTES.DASHBOARD);
	}, [navigate]);

	return (
		<button type='button' onClick={handleClick}>
			Go
		</button>
	);
}
```

Rules:

- Use `useNavigate` for event-based navigation.
- Memoize handlers passed into JSX.
- Include all reactive dependencies in `useCallback`.
- Use `replace: true` when history replacement is intended.

## Navigation Helper Hook

Create a shared navigation hook only when reuse improves readability.

```tsx
import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../routePaths';
import { ROUTE_HELPERS } from '../routeHelpers';

export function useAppNavigation() {
	const navigate = useNavigate();

	const goToDashboard = useCallback(() => {
		navigate(ROUTES.DASHBOARD);
	}, [navigate]);

	const goToLogin = useCallback(() => {
		navigate(ROUTES.LOGIN);
	}, [navigate]);

	const goToUserDetail = useCallback(
		(userId: string) => {
			navigate(ROUTE_HELPERS.userDetail(userId));
		},
		[navigate],
	);

	return {
		goToDashboard,
		goToLogin,
		goToUserDetail,
	};
}
```

Rules:

- Keep navigation helpers thin and route-focused.
- Avoid wrapping every route unnecessarily.
- Memoize every returned helper with `useCallback`.
- Prefer route constants and route helpers over inline paths.

## Query Param Navigation

Use `createSearchParams` for query-string generation.

```tsx
import { createSearchParams, useNavigate } from 'react-router-dom';

const navigate = useNavigate();

navigate({
	pathname: ROUTES.DASHBOARD,
	search: createSearchParams({
		tab: 'activity',
	}).toString(),
});
```

Rules:

- Avoid manually concatenating query strings.
- Keep query param generation typed and centralized where possible.
- Prefer predictable search param structures.

## Relative Navigation

Use relative navigation only when route nesting clearly benefits from it.

```tsx
navigate('../');
```

Rules:

- Prefer explicit route constants for app-wide navigation.
- Use relative navigation sparingly.
- Keep nested route behavior easy to understand.

## Navigation State

Use navigation state for transient route data only.

```tsx
navigate(ROUTES.LOGIN, {
	state: {
		from: location,
	},
});
```

Rules:

- Keep navigation state serializable.
- Avoid storing large business objects in route state.
- Prefer URL params or data loaders for shareable state.

## Redirect Navigation

Good:

```tsx
navigate(ROUTES.DASHBOARD, {
	replace: true,
});
```

Bad:

```tsx
window.location.href = ROUTES.DASHBOARD;
```

Rules:

- Use `replace` when previous history should be removed.
- Avoid browser reloads for internal navigation.
- Keep redirect behavior consistent across the app.

## Accessibility Rules

- Navigation elements must remain keyboard accessible.
- Preserve semantic links where navigation behaves like links.
- Avoid clickable `div` navigation patterns.
- Keep focus behavior predictable after redirects.

Good:

```tsx
<Link to={ROUTES.PROFILE}>Profile</Link>
```

Bad:

```tsx
<div onClick={() => navigate(ROUTES.PROFILE)}>Profile</div>
```

## Naming Standards

```txt
src/app/router/
  routeHelpers.ts

src/app/hooks/
  useAppNavigation.ts
```

Rules:

- Use camelCase for utility and hook files.
- Prefix reusable navigation hooks with `use`.
- Keep route helper naming action-oriented and descriptive.
