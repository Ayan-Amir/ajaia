# Review Checklist

Use this reference for PR reviews, routing audits, human verification checks, and
anti-pattern detection.

## PR Review Checklist

### Route Structure

- [ ] Are route paths centralized in `routePaths.ts`?
- [ ] Are dynamic routes built with `generatePath` or route helpers?
- [ ] Is the route tree declarative and readable?
- [ ] Are routes grouped by layout or access type?
- [ ] Are index routes used where appropriate?
- [ ] Is the catch-all route defined correctly?
- [ ] Is basename configured correctly if the app is hosted under a subpath?

### Layouts

- [ ] Do layout routes render `Outlet`?
- [ ] Are shared wrappers centralized in layouts?
- [ ] Is layout nesting predictable and scalable?
- [ ] Is unrelated business logic avoided inside layouts?

### Lazy Loading

- [ ] Are page-level routes lazy loaded where appropriate?
- [ ] Are lazy routes wrapped in `Suspense`?
- [ ] Do loading fallbacks use shared design-system components?
- [ ] Are trivial UI components avoided in lazy imports?

### Guards And Access Control

- [ ] Are protected routes guarded centrally?
- [ ] Are guest-only routes protected correctly?
- [ ] Are role-protected routes enforced at the route level?
- [ ] Are unauthorized and forbidden flows separated clearly?
- [ ] Is access control enforced beyond hidden navigation links?
- [ ] Are auth checks centralized instead of duplicated across pages?

### Redirects

- [ ] Are redirects using `replace` where appropriate?
- [ ] Is post-login redirect behavior correct?
- [ ] Is browser back-button behavior preserved correctly after redirects?
- [ ] Are redirect flows predictable and centralized?

### Loaders

- [ ] Are loaders free of React hooks?
- [ ] Are loader auth checks aligned with UI guard behavior?
- [ ] Are loader redirects implemented with `redirect()`?
- [ ] Are loaders focused on route concerns rather than large workflows?

### Navigation

- [ ] Are `Link` and `NavLink` preferred over manual navigation?
- [ ] Are `navigate` handlers memoized with `useCallback`?
- [ ] Are route constants used instead of hardcoded paths?
- [ ] Is navigation state serializable and minimal?

### Error And Loading States

- [ ] Are route-level loading states handled cleanly?
- [ ] Are route-level errors handled with `errorElement`?
- [ ] Do protected routes avoid flashing restricted content?
- [ ] Are loading and error states accessible?

## Human Verification Checklist

### Auth Flows

- Verify unauthenticated users are redirected correctly.
- Verify authenticated users cannot access guest-only pages.
- Verify authenticated-but-forbidden users land on the forbidden route.
- Verify protected content does not render before auth resolution.

### Redirect Behavior

- Verify intended destination preservation after login.
- Verify browser back-button behavior after redirects.
- Verify redirects do not create navigation loops.

### Route Behavior

- Verify nested layouts render correctly.
- Verify unknown routes render the Not Found page.
- Verify route transitions display loading feedback correctly.
- Verify basename routing works correctly in deployed environments.

### Accessibility

- Verify navigation remains keyboard accessible.
- Verify focus behavior after redirects is predictable.
- Verify loading and error states are screen-reader friendly.

## Anti-Patterns

### Hardcoded Route Strings

Bad:

```tsx
navigate('/dashboard');

<Link to='/login' />;
```

Good:

```tsx
navigate(ROUTES.DASHBOARD);

<Link to={ROUTES.LOGIN} />;
```

### Auth Redirects Inside Pages

Bad:

```tsx
function DashboardPage() {
	if (!user) {
		return <Navigate to='/login' />;
	}

	return <div>Dashboard</div>;
}
```

Good:

- Keep auth protection centralized in route guards.
- Keep pages focused on UI and page-level behavior.

### Hidden UI As Access Control

Bad:

```tsx
{
	isAdmin && <Link to={ROUTES.ADMIN}>Admin</Link>;
}
```

without route protection.

Good:

- Protect the route itself with a role guard or loader check.

### React Hooks Inside Loaders

Bad:

```ts
const auth = useAuth();
```

inside a loader.

Good:

- Use shared non-React auth utilities inside loaders.

### Manual URL Manipulation

Bad:

```tsx
window.location.href = ROUTES.LOGIN;
```

Good:

```tsx
navigate(ROUTES.LOGIN);
```

or:

```ts
throw redirect(ROUTES.LOGIN);
```

### Duplicated Auth Logic

Bad:

- Repeating auth checks across multiple pages.
- Repeating role checks in unrelated components.

Good:

- Centralize auth and role enforcement in guards and loaders.

### Business-Heavy Route Configs

Bad:

- Large async orchestration inside route definitions.
- Complex business workflows embedded directly in routing trees.

Good:

- Keep route config declarative and focused on routing concerns.

### Nested Main Routes Trees

Bad:

```tsx
<Routes>
	<Route />
</Routes>

<Routes>
	<Route />
</Routes>
```

Good:

- Use one centralized app router.

## Expected Outcome

Following this routing standard should produce routing systems that are:

- scalable
- predictable
- typed
- maintainable
- React Router 7 aligned
- safe for auth flows
- easy to extend
- easy to review
- consistent across projects
