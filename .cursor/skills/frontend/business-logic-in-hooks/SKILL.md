---
name: business-logic-in-hooks
description: >-
  Keeps React components presentational; business and orchestration logic (auth, navigation,
  mutations, OAuth, side effects) lives in custom hooks under src/hooks/ or
  src/features/<feature>/hooks/. Use when a component mixes JSX with useMutation,
  useNavigate, third-party SDK callbacks, or multi-step flows — e.g. StaffGoogleSignInButton.
  Do NOT use for TanStack Query definitions in src/data/ (api-integration) or RHF form hooks
  (forms-validation).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Business Logic in Custom Hooks

## Rule

**Components render UI and wire props; hooks own behavior.**

If a component file contains orchestration (API mutations, routing, session refresh, OAuth, multi-step handlers), **extract it to a hook** in `src/hooks/` or `src/features/<feature>/hooks/`.

```tsx
// BAD — StaffGoogleSignInButton.tsx (logic + UI in one file)
export function StaffGoogleSignInButton() {
  const navigate = useNavigate();
  const googleLogin = useStaffGoogleLoginMutation();
  const login = useGoogleLogin({ onSuccess: async (...) => { ... } });
  return <Button onClick={() => login()}>...</Button>;
}
```

```tsx
// GOOD — hooks/auth/useStaffGoogleSignIn.ts
export function useStaffGoogleSignIn(options) {
  // navigate, mutate, refetchUser, useGoogleLogin, named handlers
  return { isPending, buttonLabel, handleSignInClick };
}

// GOOD — StaffGoogleSignInButton.tsx (presentation only)
export function StaffGoogleSignInButton({ disabled, onError }) {
  const { isPending, buttonLabel, handleSignInClick } = useStaffGoogleSignIn({ onError });
  return <Button disabled={disabled || isPending} onClick={handleSignInClick}>{buttonLabel}</Button>;
}
```

## What belongs in the hook

- `useNavigate`, `useAuth`, context reads for the flow
- `useMutation` / mutation `mutateAsync` **calls** (hook definitions stay in `src/data/` per **api-integration**)
- Third-party SDK setup (`useGoogleLogin`, etc.) and their success/error paths
- Derived UI state for the view: `isPending`, labels, disabled rules
- **Named** event handlers returned to the component (**named-event-handlers** skill)

## What stays in the component

- JSX structure and layout
- Passing `className`, `variant`, accessibility attributes
- Optional visual-only props (`disabled` from parent, `className`)
- Importing `#/components/ui/*` primitives

## File placement

| Scope | Path | Example |
|-------|------|---------|
| Auth flows shared on auth screens | `src/hooks/auth/useStaffGoogleSignIn.ts` | Google staff sign-in |
| One feature | `src/features/<feature>/hooks/useFeatureAction.ts` | Feature-specific wizard |
| App-wide utility | `src/hooks/useDebounce.ts` | **custom-hooks** skill |

- **One primary hook export per file** (same spirit as **one-component-per-file**).
- File name: `use<PascalCase>.ts` matching the hook name.
- Export from `src/hooks/index.ts` when the hook is part of the public hooks surface.

## When To Apply

- New button/flow that calls an API then redirects
- Refactoring a component over ~40 lines with hooks inside
- Code review: component imports both `useMutation` and `useNavigate`
- Duplicated auth or submit logic across two components → one hook

## Do Not Use

- Defining `useQuery` / `useMutation` wrappers → **api-integration** (`src/data/<feature>/`)
- React Hook Form + Zod → **forms-validation**
- Global auth provider implementation → **react-state-management**

## Checklist

- [ ] Component has no `useNavigate` / mutation orchestration unless trivial pass-through
- [ ] Hook returns a small, explicit API (`isPending`, handlers, labels)
- [ ] Handlers are named in the hook, not inline in JSX
- [ ] Data layer hooks imported from `#/data/`, not reimplemented in the hook file

## Related Skills

- **custom-hooks** — effects, deps, memoization rules
- **api-integration** — `performRequest`, mutation/query hook files in `src/data/`
- **named-event-handlers** — `handleSignInClick`, not `onClick={() => login()}`
- **one-component-per-file** — thin component file beside hook file
- **authentication-session-management** — session boundaries and redirect policy

## Anti-pattern → fix

| Smell | Fix |
|-------|-----|
| Component calls `mutateAsync` then `navigate` | Move sequence into `useFeatureSubmit` |
| `useGoogleLogin` config inside `.tsx` under `components/` | Move to `hooks/auth/useStaffGoogleSignIn.ts` |
| Two components duplicate sign-in flow | Single hook, two presentational components |
