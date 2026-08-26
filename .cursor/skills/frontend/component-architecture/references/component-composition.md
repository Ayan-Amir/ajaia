# Component Composition

Use this reference for `children`, slots, compound components, render props, and avoiding
boolean prop explosions.

## Composition First

Prefer composition when a component has flexible sections.

Bad:

```tsx
<PageCard
	showHeader
	showFooter
	showActions
	title='Settings'
	description='Manage your account'
/>
```

Good:

```tsx
<PageCard>
	<PageCardHeader>
		<PageCardTitle>Settings</PageCardTitle>
		<PageCardDescription>Manage your account</PageCardDescription>
	</PageCardHeader>

	<PageCardContent>
		<AccountSettings />
	</PageCardContent>

	<PageCardFooter>
		<SaveButton />
	</PageCardFooter>
</PageCard>
```

Rules:

- Use `children` for flexible content.
- Use slots when the component has named layout regions.
- Avoid growing boolean prop matrices.
- Keep composition readable and explicit.

## Children Pattern

Use `children` when a component wraps arbitrary content.

```tsx
export interface PageSectionProps {
	title: string;
	children: React.ReactNode;
}

/**
 * Renders a page section with a title and flexible content.
 */
export function PageSection({ title, children }: PageSectionProps) {
	return (
		<section>
			<h2>{title}</h2>
			<div>{children}</div>
		</section>
	);
}
```

Rules:

- Use `children` for flexible body content.
- Keep wrapper props minimal.
- Do not add props for every possible child variation.

## Named Slot Props

Use named slots when specific regions need custom content.

```tsx
export interface DataShellProps {
	header: React.ReactNode;
	filters?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

/**
 * Renders a reusable data layout with optional header, filters, and footer slots.
 */
export function DataShell({ header, filters, children, footer }: DataShellProps) {
	return (
		<section>
			<header>{header}</header>

			{filters ? <div>{filters}</div> : null}

			<div>{children}</div>

			{footer ? <footer>{footer}</footer> : null}
		</section>
	);
}
```

Rules:

- Use slot props for named regions.
- Keep slot names semantic.
- Avoid mixing slots with many layout booleans.
- Prefer `ReactNode` for flexible slots.

## Compound Components

Use compound components for reusable UI patterns with multiple related pieces.

```tsx
<Card>
	<Card.Header>
		<Card.Title>Billing</Card.Title>
	</Card.Header>

	<Card.Content>
		<BillingSummary />
	</Card.Content>
</Card>
```

Rules:

- Use compound components when child pieces are tightly related.
- Keep the API discoverable.
- Avoid compound APIs for simple one-off components.
- Keep state sharing explicit and typed.

## Render Props

Use render props only when the parent owns reusable behavior and the child controls
rendering.

```tsx
<DataState isLoading={isLoading} error={error} data={users}>
	{resolvedUsers => <UserList users={resolvedUsers} />}
</DataState>
```

Rules:

- Use render props sparingly.
- Prefer normal composition first.
- Use render props when behavior reuse matters more than visual reuse.
- Keep render function types clear.

## Avoid Boolean Prop Explosion

Boolean prop explosion happens when a component accumulates many toggles.

Bad:

```tsx
<Panel showTitle showIcon showActions isCompact isBordered hasFooter />
```

Better:

```tsx
<Panel variant='compact'>
	<PanelHeader>
		<PanelTitle />
		<PanelActions />
	</PanelHeader>

	<PanelContent />
</Panel>
```

Rules:

- Replace many booleans with composition.
- Use semantic variants for visual differences.
- Split components when behavior combinations become hard to reason about.
- Avoid APIs where many prop combinations are invalid.

## Controlled Composition

Let parent components own behavior when behavior is feature-specific.

```tsx
<ConfirmDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
	<ConfirmDialogContent>Delete this project?</ConfirmDialogContent>
</ConfirmDialog>
```

Rules:

- Keep reusable components behavior-light.
- Push feature-specific decisions to the parent.
- Use controlled props for open/selected/value state when parent needs control.
- Keep uncontrolled defaults only for simple local UI.

## Layout Composition

Use layout components to define structure, not business rules.

Good:

```tsx
<TwoColumnLayout sidebar={<Filters />} main={<Results />} />
```

Bad:

```tsx
<TwoColumnLayout userRole='admin' shouldFetchBillingData />
```

Rules:

- Layout components should not own feature business logic.
- Pass rendered content into layout regions.
- Keep layout components generic.

## Composition Review Questions

Ask these before adding props:

- Is this prop only controlling whether a child region exists?
- Would `children` or a named slot be clearer?
- Are many prop combinations invalid?
- Is the component becoming hard to test?
- Would splitting into smaller pieces improve readability?
- Is this behavior feature-specific?

## Done Criteria

Composition is correct when:

- Flexible UI uses `children` or slots.
- Boolean prop matrices are avoided.
- Compound components are used only when they improve API clarity.
- Render props are used only for reusable behavior.
- Layout components stay generic.
- Feature-specific behavior stays outside generic components.
