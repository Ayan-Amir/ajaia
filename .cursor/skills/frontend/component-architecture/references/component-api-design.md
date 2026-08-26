# Component API Design

Use this reference for props interfaces, callbacks, controlled/uncontrolled APIs,
generics, discriminated unions, and stable public component APIs.

## Props Interfaces

Use `interface` for component props.

```tsx
export interface UserCardProps {
	name: string;
	email: string;
	onEdit: () => void;
}
```

Rules:

- Use `interface` for exported component props.
- Keep prop names descriptive and predictable.
- Avoid `any`.
- Keep public APIs stable and readable.
- Prefer optional props only when behavior is truly optional.

## Native Element Props

Extend native element props only when wrapping a real DOM element.

```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'destructive';
}
```

Rules:

- Extend native props only for true wrapper primitives.
- Keep additional custom props small and intentional.
- Avoid leaking unnecessary DOM props through unrelated components.
- Preserve native accessibility behavior.

## Callback Props

Callbacks should describe intent clearly.

Bad:

```tsx
onClick: () => void;
```

Good:

```tsx
onDeleteUser: (userId: string) => void;
```

Rules:

- Prefer semantic callback names.
- Pass only required data.
- Avoid vague callback names in shared/public APIs.
- Keep callback behavior predictable.

## Stable Public APIs

Component APIs should remain stable over time.

Rules:

- Avoid constantly renaming public props.
- Avoid large breaking changes to shared components.
- Keep shared component APIs small.
- Prefer extension through composition instead of many new props.
- Avoid adding one-off feature behavior into shared APIs.

## Controlled Components

Use controlled APIs when the parent must own state.

```tsx
export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}
```

Rules:

- Use controlled APIs for reusable dialogs, popovers, tabs, accordions, and selections.
- Keep controlled state explicit.
- Avoid hidden internal business state in reusable components.
- Use clear `value/onChange` or `open/onOpenChange` conventions.

## Uncontrolled Components

Use uncontrolled behavior only for simple local UI state.

```tsx
export interface TooltipProps {
	defaultOpen?: boolean;
	children: React.ReactNode;
}
```

Rules:

- Use uncontrolled state for lightweight convenience behavior.
- Do not hide important feature state internally.
- Prefer controlled APIs when parent coordination is required.

## Controlled + Uncontrolled Pattern

Reusable components may support both patterns.

```tsx
export interface AccordionProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}
```

Rules:

- Keep controlled/uncontrolled behavior predictable.
- Do not mix conflicting internal and external ownership.
- Document ownership expectations clearly.

## Generics

Use generics for reusable data-driven components.

```tsx
export interface DataListProps<T> {
	items: T[];
	renderItem: (item: T) => React.ReactNode;
	getKey: (item: T) => string;
}

export function DataList<T>({ items, renderItem, getKey }: DataListProps<T>) {
	return (
		<ul>
			{items.map(item => (
				<li key={getKey(item)}>{renderItem(item)}</li>
			))}
		</ul>
	);
}
```

Rules:

- Use generics only when reuse truly benefits.
- Keep generic APIs understandable.
- Avoid over-engineered abstraction layers.
- Require stable keys for reusable lists.

## Discriminated Unions

Use discriminated unions for mutually exclusive component states.

```tsx
type EmptyStateProps =
	| {
			type: 'loading';
	  }
	| {
			type: 'error';
			message: string;
	  }
	| {
			type: 'empty';
			action?: React.ReactNode;
	  };
```

Rules:

- Use unions when prop combinations are mutually exclusive.
- Avoid invalid prop combinations.
- Prefer explicit state models over many optional props.
- Keep state shapes easy to understand.

## Avoid Prop Drilling

Do not pass unrelated props through many layers.

Bad:

```tsx
<Page>
	<Section>
		<Card>
			<UserRow
				currentUser={currentUser}
				onDeleteUser={onDeleteUser}
				permissions={permissions}
			/>
		</Card>
	</Section>
</Page>
```

Rules:

- Keep component APIs focused.
- Use composition or context intentionally.
- Avoid threading large prop chains through unrelated layers.
- Extract feature boundaries when prop drilling becomes excessive.

## Optional Props

Optional props should represent real optional behavior.

Bad:

```tsx
title?: string;
subtitle?: string;
description?: string;
caption?: string;
footerText?: string;
```

when many combinations are invalid.

Better:

```tsx
children: React.ReactNode;
```

or:

```tsx
header: React.ReactNode;
```

Rules:

- Avoid excessive optional props.
- Prefer composition for flexible layouts.
- Keep APIs predictable and valid.

## API Review Questions

Before adding props, ask:

- Is this prop feature-specific?
- Would composition be clearer?
- Are many prop combinations invalid?
- Does this belong in a wrapper instead?
- Is the API becoming hard to explain?
- Will future maintainers understand ownership quickly?

## Done Criteria

Component APIs are correct when:

- Props are strongly typed.
- Callback names are semantic.
- Controlled state ownership is explicit.
- Generic abstractions stay understandable.
- Invalid prop combinations are minimized.
- Shared component APIs remain stable.
- Composition is preferred over prop explosion.
