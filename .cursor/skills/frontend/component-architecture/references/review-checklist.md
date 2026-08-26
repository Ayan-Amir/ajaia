# Review Checklist

Use this reference for PR reviews, architecture audits, human verification checks,
anti-pattern detection, and done criteria.

## PR Review Checklist

### Component Layering

- [ ] The correct layer was chosen: `ui`, `shared`, or feature.
- [ ] Existing components were searched before creating new ones.
- [ ] UI primitives are domain-free and feature-free.
- [ ] Shared components are reusable across features.
- [ ] Feature-specific UI remains inside `src/components/[feature]/`.
- [ ] Shared UI is not duplicated across features.

### Dependency Direction

- [ ] UI primitives do not import shared or feature code.
- [ ] Shared components do not import feature-specific components.
- [ ] Feature components only depend downward.
- [ ] No circular dependencies exist between component layers.

Allowed:

```txt
feature → shared → ui
```

Forbidden:

```txt
ui → shared
ui → feature
shared → feature
```

### Component Boundaries

- [ ] Rendering and orchestration are separated correctly.
- [ ] Complex effects are extracted into hooks.
- [ ] API orchestration is not embedded inside presentational components.
- [ ] Components remain readable and focused.
- [ ] Local UI state is reasonable and scoped correctly.

### Component Composition

- [ ] Composition is preferred over boolean prop matrices.
- [ ] `children` or slots are used for flexible layouts.
- [ ] Compound components are used only when beneficial.
- [ ] Layout components remain generic.
- [ ] Feature-specific behavior is not leaking into reusable components.

### Component API Design

- [ ] Props are typed with interfaces.
- [ ] No `any` types exist.
- [ ] Callback names are semantic and intention-revealing.
- [ ] Controlled/uncontrolled ownership is clear.
- [ ] Invalid prop combinations are minimized.
- [ ] Shared APIs remain understandable and stable.

### Component Splitting

- [ ] No component file exceeds 300 lines.
- [ ] Large JSX sections are extracted into parts files when needed.
- [ ] Complex logic is extracted into hooks.
- [ ] Feature constants/types are colocated correctly.
- [ ] Shared abstractions were created intentionally.

### React And JSX Rules

- [ ] No inline JSX arrow handlers exist.
- [ ] JSX handlers are stable and memoized where needed.
- [ ] Lists use stable keys.
- [ ] Buttons have explicit `type`.
- [ ] Expensive derived values are memoized intentionally.
- [ ] Loading, empty, and error states are handled where relevant.

### Documentation And Accessibility Basics

- [ ] Exported reusable public components have useful JSDoc.
- [ ] Semantic HTML is used where appropriate.
- [ ] Interactive elements are keyboard reachable.
- [ ] Inputs have labels where relevant.
- [ ] Focus states remain visible.
- [ ] ARIA is not replacing proper semantics unnecessarily.

## Human Verification Checklist

- Verify the component exists in the correct layer.
- Verify the component is easy to navigate and review.
- Verify no duplicated reusable UI exists across features.
- Verify rendering and orchestration are separated.
- Verify component APIs are understandable.
- Verify composition patterns feel natural and scalable.
- Verify loading, empty, and error states render correctly.
- Verify keyboard interaction still works.
- Verify no oversized “god components” remain.

## Anti-Patterns

### Wrong Layer Ownership

Bad:

```txt
src/components/dashboard/Button.tsx
```

Good:

```txt
src/components/ui/Button.tsx
```

### Shared UI Duplication

Bad:

```txt
src/components/home/EmptyState.tsx
src/components/settings/EmptyState.tsx
```

Good:

```txt
src/components/shared/EmptyState.tsx
```

### UI Primitive With Domain Logic

Bad:

```tsx
export function Button() {
	if (user.role === 'admin') {
		...
	}
}
```

Good:

- Keep UI primitives presentation-only.
- Keep domain logic in feature components or hooks.

### Boolean Prop Explosion

Bad:

```tsx
<Card showHeader showFooter showActions isCompact />
```

Good:

```tsx
<Card>
	<CardHeader />
	<CardContent />
</Card>
```

### Inline JSX Handlers

Bad:

```tsx
<button onClick={() => onDelete(id)}>Delete</button>
```

Good:

```tsx
const handleDelete = useCallback(() => {
	onDelete(id);
}, [id, onDelete]);

<button type='button' onClick={handleDelete}>
	Delete
</button>;
```

### Oversized Component

Bad:

```txt
DashboardPage.tsx // 700 lines
```

Good:

```txt
DashboardPage.tsx
DashboardPage.parts.tsx
useDashboardPage.ts
```

### Feature Logic Inside Shared Component

Bad:

```tsx
export function PageHeader() {
	const billingData = useBilling();
}
```

Good:

- Keep shared components generic.
- Pass feature data through props.

## Done Criteria

A component architecture task is complete only when:

1. The correct component layer was chosen.
2. Existing components were reused where possible.
3. Component boundaries are clear.
4. Composition is preferred over prop explosion.
5. Component APIs are strongly typed and understandable.
6. No component exceeds the project size limit.
7. Complex logic is extracted appropriately.
8. Shared abstractions are intentional.
9. Basic accessibility and documentation expectations are met.
10. The architecture is easier to maintain after the change.

## Expected Outcome

Following this standard should produce components that are:

- scalable
- reusable
- maintainable
- predictable
- easy to review
- easy to extend
- separated by ownership
- free from duplicated shared UI
- aligned with modern React architecture standards
