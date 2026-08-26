---
name: named-event-handlers
description: >-
  Disallows anonymous inline functions on JSX event/callback props (onClick, onReset,
  onSubmit, onChange, etc.). Handlers must be named const arrow functions declared in
  the component or hook, then passed by reference. Use when writing or reviewing React
  components, ErrorBoundary callbacks, form handlers, and button actions.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Named Event Handlers (No Anonymous Callbacks)

## Rule

**Do not pass anonymous functions to JSX callback props.**

Forbidden:

```tsx
<ErrorBoundary onReset={() => window.location.reload()} />
<Button onClick={() => login()} />
<Button onClick={() => void logout()} />
```

Required — declare a **named** arrow function, then reference it:

```tsx
const handleReset = () => {
  window.location.reload();
};

<ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset} />
```

Same for `onClick`, `onSubmit`, `onChange`, `onError`, `onSuccess` passed to child components, and third-party props that accept callbacks (`ErrorBoundary`, `react-hook-form`, OAuth hooks config when wired from JSX).

## Naming

- Prefix with **`handle`** + PascalCase event or action: `handleReset`, `handleSignIn`, `handleLogoutClick`.
- Name describes **behavior**, not the DOM event alone: prefer `handleReloadPage` over `handleClick` when multiple buttons exist.
- One handler per distinct behavior; do not duplicate identical inline lambdas.

## Where To Declare

| Scope | Pattern |
|-------|---------|
| Component | `const handleX = () => { ... };` at top of function body, after hooks that supply deps |
| Needs stable identity for memoized children | `const handleX = useCallback(() => { ... }, [deps]);` — still named, not inline |
| Shared across siblings | Extract to custom hook: `const { handleLogout } = useAuthActions();` |
| Pure util, no React state | Module-level `const reloadPage = () => window.location.reload();` only if reused; otherwise keep in component |

## When To Apply

- Adding or editing any JSX callback prop
- Code review / refactor touching `on*=` attributes
- Wiring ErrorBoundary, buttons, forms, dialogs, toasts with user actions

## Exceptions (narrow)

- **`useEffect` / `useLayoutEffect` callbacks** — not JSX props; separate style rules apply.
- **`.map((item) => ...)`** — prefer a named row/cell component with `handleRowClick` inside; if the callback is one line and local to the map, extracting `<ItemRow item={item} />` is the fix rather than inline JSX props on shared components.
- **Library APIs that require inline factories once** (e.g. rare render props) — add a `ponytail:` comment and extract at next touch.

## Do Not Use This Skill For

- Server actions or non-React backend code
- Zod `.refine((v) => ...)` — validation lambdas, not UI handlers
- TanStack Query `queryFn: () => fetch()` — use `api-integration` patterns (named fetch functions in data layer)

## Checklist

- [ ] No `prop={() => ...}` on JSX/custom components in the diff
- [ ] Handlers are `const handleName = () => {}` or `useCallback` with the same name
- [ ] Handler names are unique and meaningful in the component

## Related Skills

- `custom-hooks` — extract repeated handler + state logic
- `component-architecture` — split large components so handlers stay small and named
- `forms-validation` — `handleSubmit` wiring with react-hook-form

## Anti-pattern → fix

```tsx
// BAD
<StaffGoogleSignInButton onError={(msg) => setGoogleError(msg)} />

// GOOD
const handleGoogleSignInError = (message: string) => {
  setGoogleError(message);
};

<StaffGoogleSignInButton onError={handleGoogleSignInError} />
```

```tsx
// BAD
onClick={() => login()}

// GOOD
const handleGoogleSignInClick = () => {
  login();
};

<Button type='button' onClick={handleGoogleSignInClick} />
```
