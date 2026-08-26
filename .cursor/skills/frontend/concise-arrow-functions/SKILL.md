---
name: concise-arrow-functions
description: >-
  Use expression-bodied arrow functions when the body is a single statement — no
  braces or return. Use when writing named handlers (named-event-handlers), hooks,
  and callbacks. Apply expression form for one call or one expression; keep block
  bodies for multiple statements, try/catch, or await chains.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Concise Arrow Functions (Single Expression)

## Rule

If an arrow function body is **one expression** (one call, one optional chain, one return value), **omit `{` `}`** and use an implicit return.

```typescript
// BAD — unnecessary block
const handleGoogleOAuthError = () => {
  onError?.(MESSAGES.AUTH.GOOGLE_OAUTH_CANCELLED);
};

// GOOD
const handleGoogleOAuthError = () => onError?.(MESSAGES.AUTH.GOOGLE_OAUTH_CANCELLED);
```

```typescript
// BAD
const handleSignInClick = () => {
  startGoogleLogin();
};

// GOOD
const handleSignInClick = () => startGoogleLogin();
```

```typescript
// GOOD — single expression
const handleErrorBoundaryReset = () => window.location.reload();
```

## Use a block body `{ ... }` when

- More than one statement
- `try` / `catch` / `finally`
- `async` with `await` (multi-step async flow)
- Early `return` after conditionals inside the function
- Variable declarations needed before the final action

```typescript
// KEEP block — multiple statements + await
const handleGoogleOAuthSuccess = async (tokenResponse: { access_token?: string }) => {
  const accessToken = tokenResponse.access_token;
  if (!accessToken) {
    onError?.(MESSAGES.AUTH.GOOGLE_NO_ACCESS_TOKEN);
    return;
  }
  try {
    await googleLogin.mutateAsync({ accessToken });
    await refetchUser();
    navigate(ROUTES.HOME, { replace: true });
  } catch {
    // ...
  }
};
```

## When To Apply

- Named handlers in hooks and components (**named-event-handlers**)
- Simple `onClick` / `onReset` wrappers that delegate to one function
- Refactors that leave a one-line block body

## Do Not Use

- Collapsing multi-line logic into comma operators or nested ternaries to avoid braces
- Expression body when side effects need explicit ordering across multiple lines

## Checklist

- [ ] One-statement handlers use `() => expression`, not `() => { expression; }`
- [ ] Multi-step or async handlers still use blocks
- [ ] Handlers remain **named** (not inline in JSX)

## Related Skills

- **named-event-handlers** — name first, then concise body
- **business-logic-in-hooks** — handlers defined in hooks
- **centralized-messages** — string args still from `MESSAGES`
