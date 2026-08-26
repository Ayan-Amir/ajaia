---
name: function-component-declarations
description: >-
  Define React components with function declarations (export function Foo), not
  const arrow assignments (const Foo = () =>). Use when creating or reviewing
  components under src/components/, src/pages/, and route modules. Arrow functions
  remain for event handlers and hooks inside components (named-event-handlers,
  concise-arrow-functions).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Function Declarations for Components

## Rule

**React components use `function` declarations**, not `const Component = () =>`.

```tsx
// BAD
const Home = (): JSX.Element => {
  return <div>...</div>;
};
export default Home;

// GOOD
export default function Home(): JSX.Element {
  return <div>...</div>;
}
```

```tsx
// GOOD — named export (auth, shared UI)
export function StaffAuthCard(props: StaffAuthCardProps) {
  return <Card>...</Card>;
}
```

## Still use arrow functions for

- Event handlers: `const handleLogoutClick = () => void logout();`
- Hooks: `export function useStaffGoogleSignIn()` (hooks use `function`, not component const)
- Small inline helpers **inside** a component when not a separate component file

Do **not** use `const MyPage = () =>` for page or feature components.

## Default exports

Prefer **`export default function PageName()`** in page files, or **`export function ComponentName()`** + barrel re-export — match the folder’s existing pattern.

## When To Apply

- New component or page files
- Review diffs that introduce `const X = (): JSX.Element =>`
- Aligning legacy arrow components with auth/routes style

## Related Skills

- **one-component-per-file** — one component per module; use `function` for that component
- **concise-arrow-functions** — handlers only, not component identity
- **component-architecture** — folder placement

## Checklist

- [ ] No `const ComponentName = (` for React components
- [ ] Handlers inside components may still use concise arrows
