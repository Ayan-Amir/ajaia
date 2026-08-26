# Component Splitting

Use this reference for the 300-line rule, parts files, hook extraction, constants/types
colocation, index exports, and long-term component maintainability.

## Component Size Limit

No component file may exceed 300 lines.

Rules:

- 300 lines is a hard limit.
- Count imports, types, helpers, hooks, and JSX.
- Split components before they become difficult to review.
- Large JSX sections should be extracted before the file becomes unmanageable.
- Avoid “god components”.

## When To Split

Split a component when:

- JSX becomes difficult to scan
- Multiple UI sections exist
- The file mixes rendering and orchestration
- Local helpers dominate the file
- Multiple effects exist
- Multiple loading/error branches exist
- Different sections can be reused independently
- The component exceeds the size limit

## Recommended Splits

Preferred split structure:

```txt
UserDetails.tsx
UserDetails.parts.tsx
useUserDetails.ts
userDetails.constants.ts
userDetails.types.ts
```

Rules:

- Keep rendering-focused pieces in `.parts.tsx`.
- Keep orchestration and state in hooks.
- Keep feature-only constants colocated.
- Keep feature-only types colocated.
- Extract shared pieces only when reuse is real.

## Parts Files

Use parts files for extracted rendering sections.

```txt
ComponentName.parts.tsx
```

Example:

```tsx
export function UserDetailsHeader() {
	return <header />;
}

export function UserDetailsMeta() {
	return <section />;
}
```

Rules:

- Use parts files before creating many tiny component files.
- Keep parts rendering-focused.
- Avoid moving unrelated business logic into parts.
- Use clear section-oriented naming.

## Hook Extraction

Move orchestration and complex logic into hooks.

Bad:

```tsx
export function DashboardPage() {
	useEffect(() => {
		...
	}, []);

	const handleSave = async () => {
		...
	};

	const filteredItems = expensiveFilter(items);

	return (...);
}
```

Better:

```tsx
export function DashboardPage() {
	const {
		filteredItems,
		isLoading,
		handleSave,
	} = useDashboardPage();

	return (...);
}
```

Rules:

- Extract effects, derived state, orchestration, and subscriptions into hooks.
- Keep rendering readable.
- Avoid massive hooks that become new “god objects”.
- Keep hook names feature-oriented.

## Constants Colocation

Colocate feature-only constants.

```txt
src/components/dashboard/constants/dashboardCard.constants.ts
```

Rules:

- Keep feature-only constants near the feature.
- Extract shared constants only when reused.
- Avoid giant global constants folders.
- Use constants for limits, variants, reusable labels, and configuration.

## Types Colocation

Colocate feature-only component types.

```txt
src/components/dashboard/types/dashboardCard.types.ts
```

Rules:

- Keep feature-specific types near the feature.
- Extract shared types only when reused broadly.
- Avoid giant global types folders for feature-local concerns.
- Keep component props close to the owning component unless reused.

## Index Exports

Use stable folder exports.

```ts
export { UserCard } from './UserCard';
export type { UserCardProps } from './UserCard';
```

Rules:

- Use named exports.
- Re-export stable public APIs through `index.ts`.
- Avoid deep relative imports across the app.
- Keep internal/private parts unexported unless intentionally reusable.

## Folder Organization

Recommended structure:

```txt
src/components/dashboard/
  DashboardPage.tsx
  DashboardPage.parts.tsx

  hooks/
    useDashboardPage.ts

  constants/
    dashboardPage.constants.ts

  types/
    dashboardPage.types.ts

  index.ts
```

Rules:

- Group related files together.
- Keep ownership obvious.
- Keep feature-specific files inside the feature folder.
- Avoid dumping unrelated files into shared/global folders.

## Extraction Priority

Preferred extraction order:

```txt
large JSX section
  ↓
.parts.tsx

complex orchestration
  ↓
hook

reusable visual pattern
  ↓
shared component

generic visual primitive
  ↓
ui primitive
```

Rules:

- Split incrementally.
- Do not prematurely over-abstract.
- Extract only when readability or reuse improves.

## Review Questions

Before splitting, ask:

- Is the file becoming hard to review?
- Is JSX dominating readability?
- Are effects mixed with rendering?
- Would another engineer find this easy to navigate?
- Is this section reusable?
- Is this abstraction solving a real problem?

## Anti-Patterns

### God Component

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

### Premature Abstraction

Bad:

```txt
AbstractCardFactory.tsx
UniversalRenderer.tsx
```

without real reuse.

Good:

- Extract only after patterns become real.

### Giant Shared Folder

Bad:

```txt
shared/
  everything/
```

Good:

- Keep feature-specific code inside the feature.
- Promote shared code intentionally.

### Global Types Dump

Bad:

```txt
types/
  everything.ts
```

Good:

```txt
dashboard/types/dashboardCard.types.ts
```

## Done Criteria

Component splitting is correct when:

- No file exceeds 300 lines.
- JSX-heavy sections are extracted.
- Complex orchestration lives in hooks.
- Feature-specific constants/types are colocated.
- Shared abstractions are intentional.
- Folder ownership remains obvious.
- The component is easier to review after splitting.
