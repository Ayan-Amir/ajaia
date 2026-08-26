# Component Boundaries

Use this reference for separating rendering, state, effects, API logic, and feature logic
inside React components.

## Separation Of Concerns

Separate presentation, feature logic, and side effects.

Good architecture:

```txt
UI rendering
  ↓

feature component
  ↓

feature hook
  ↓

API/state layer
```

Rules:

- Keep components focused on rendering.
- Move complex state and effects into hooks.
- Keep API orchestration outside presentational components.
- Avoid mixing rendering and large business workflows.

## Presentation Components

Presentation components should be props in, JSX out.

```tsx
export interface UserCardProps {
	name: string;
	email: string;
	onEdit: () => void;
}

/**
 * Displays a user summary card.
 */
export function UserCard({ name, email, onEdit }: UserCardProps) {
	return (
		<div>
			<h2>{name}</h2>

			<p>{email}</p>

			<button type='button' onClick={onEdit}>
				Edit
			</button>
		</div>
	);
}
```

Rules:

- No API calls inside presentation components.
- No TanStack Query hooks inside pure presentation components.
- No route loaders or route orchestration.
- Minimal local UI state only.
- Receive data and callbacks through props.
- Keep presentation components reusable and easy to test.

## Feature Components

Feature components may coordinate feature-specific behavior.

```tsx
export function UserListSection() {
	const { users, isLoading, handleEditUser } = useUserListSection();

	if (isLoading) {
		return <UsersSkeleton />;
	}

	return <UserList users={users} onEdit={handleEditUser} />;
}
```

Rules:

- Feature components may use feature hooks.
- Keep rendering readable.
- Avoid large business workflows directly inside JSX-heavy files.
- Split large sections into smaller child components.

## Feature Hooks

Move complex logic into hooks.

```txt
src/components/[feature]/hooks/useUserListSection.ts
```

```tsx
export function useUserListSection() {
	const { data, isLoading } = useUsers();

	const handleEditUser = useCallback((userId: string) => {
		openUserEditor(userId);
	}, []);

	return {
		users: data ?? [],
		isLoading,
		handleEditUser,
	};
}
```

Rules:

- Use hooks for derived state, effects, subscriptions, and orchestration.
- Keep hooks feature-scoped unless broadly reusable.
- Keep hook return values stable and predictable.
- Avoid massive “god hooks”.

## Local State Rules

Keep local state close to the component when only the component needs it.

Good examples:

- dialog open state
- dropdown state
- hover state
- selected tab state
- local search input

Bad examples:

- large server-state orchestration
- cross-feature business state
- duplicated async data management

Rules:

- Use local state for UI behavior.
- Promote state upward only when sharing is required.
- Keep server state in the appropriate data layer.

## Side Effects

Move heavy effects into hooks.

Bad:

```tsx
useEffect(() => {
	fetchUsers();
	subscribeToSocket();
	startAnalytics();
}, []);
```

inside a large UI component.

Good:

```tsx
const { users, isLoading } = useUserListSection();
```

Rules:

- Keep rendering readable.
- Group related effects into hooks.
- Avoid large effect blocks inside JSX-heavy components.
- Separate orchestration from rendering.

## Container And Presentation Pattern

Prefer container/presentation separation when complexity grows.

```txt
UserListSection.tsx
  ↓
UserList.tsx
  ↓
UserCard.tsx
```

Rules:

- Containers coordinate feature behavior.
- Presentational components render UI.
- Avoid deeply coupling API logic with low-level UI.

## Domain Logic Boundaries

Keep business/domain rules outside generic UI components.

Bad:

```tsx
export function Button() {
	if (user.role === 'admin') {
		...
	}
}
```

Good:

```tsx
<AdminActionButton />
```

using:

```tsx
<Button />
```

internally.

Rules:

- UI primitives must not know domain rules.
- Shared components should avoid feature-specific behavior.
- Domain logic belongs in feature components or hooks.

## Data State Boundaries

Keep loading, empty, and error states near the feature boundary.

```tsx
if (isLoading) {
	return <UsersSkeleton />;
}

if (!users.length) {
	return <EmptyState />;
}

return <UserList users={users} />;
```

Rules:

- Do not push loading/error handling deep into UI primitives.
- Feature boundaries should decide which UI state to render.
- Reuse shared state components where appropriate.

## Composition Over Configuration

Prefer composition instead of boolean prop explosions.

Bad:

```tsx
<Card showHeader showFooter showActions showBorder />
```

Good:

```tsx
<Card>
	<CardHeader />
	<CardContent />
	<CardFooter />
</Card>
```

Rules:

- Prefer slots, children, and composition.
- Avoid large configuration prop matrices.
- Keep component APIs understandable.

## Done Criteria

Component boundaries are correct when:

- Rendering and orchestration are separated.
- Complex effects live in hooks.
- UI primitives contain no domain logic.
- Presentation components stay reusable.
- Feature components remain readable.
- Large workflows are not embedded directly into JSX-heavy files.
- Composition is preferred over prop explosion.
