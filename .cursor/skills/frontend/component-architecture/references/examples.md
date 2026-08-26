# Examples

Use this reference for complete component architecture examples.

## Feature Component Example

```tsx
import { useCallback } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';

import { useProjectList } from './hooks/useProjectList';

export interface ProjectListProps {
	projects: Array<{
		id: string;
		name: string;
	}>;
	onCreateProject: () => void;
}

/**
 * Renders the project list area for the projects feature.
 * Used on the projects dashboard page.
 */
export function ProjectList({ projects, onCreateProject }: ProjectListProps) {
	const hasProjects = projects.length > 0;

	const handleCreateProject = useCallback(() => {
		onCreateProject();
	}, [onCreateProject]);

	if (!hasProjects) {
		return (
			<EmptyState
				title='No projects yet'
				description='Create your first project to get started.'
				action={
					<Button type='button' onClick={handleCreateProject}>
						Create project
					</Button>
				}
			/>
		);
	}

	return (
		<ul className='space-y-3'>
			{projects.map(project => (
				<li key={project.id} className='rounded-md border p-4'>
					{project.name}
				</li>
			))}
		</ul>
	);
}
```

## Feature Hook Boundary Example

```tsx
import { useCallback } from 'react';

export function useProjectList() {
	const projects = [];

	const handleCreateProject = useCallback(() => {
		// feature-specific create behavior
	}, []);

	return {
		projects,
		handleCreateProject,
	};
}
```

## Shared Component Example

```tsx
import type { ReactNode } from 'react';

export interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

/**
 * Renders a reusable empty state for pages and data sections.
 * Used by dashboards, settings pages, and admin screens.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
	return (
		<section className='rounded-lg border bg-background p-6 text-center'>
			<h2 className='text-lg font-semibold'>{title}</h2>

			{description ? (
				<p className='mt-2 text-sm text-muted-foreground'>{description}</p>
			) : null}

			{action ? <div className='mt-4'>{action}</div> : null}
		</section>
	);
}
```

## UI Primitive Example

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground',
				destructive: 'bg-destructive text-destructive-foreground',
				outline: 'border border-input bg-background',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 px-3',
				lg: 'h-11 px-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

/**
 * Renders the app button primitive with shared variants.
 * Used across UI, shared, and feature components.
 */
export function Button({
	className,
	variant,
	size,
	asChild = false,
	type = 'button',
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			type={asChild ? undefined : type}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
```

## Composition Example

```tsx
export interface PageSectionProps {
	title: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
}

/**
 * Renders a reusable page section with optional actions.
 * Used by feature pages that need consistent section layout.
 */
export function PageSection({ title, children, actions }: PageSectionProps) {
	return (
		<section>
			<header className='flex items-center justify-between gap-4'>
				<h2>{title}</h2>

				{actions ? <div>{actions}</div> : null}
			</header>

			<div>{children}</div>
		</section>
	);
}
```

## Discriminated Union Props Example

```tsx
type DataStateProps =
	| {
			status: 'loading';
	  }
	| {
			status: 'error';
			message: string;
	  }
	| {
			status: 'empty';
			title: string;
	  }
	| {
			status: 'success';
			children: React.ReactNode;
	  };

export function DataState(props: DataStateProps) {
	if (props.status === 'loading') {
		return <div>Loading...</div>;
	}

	if (props.status === 'error') {
		return <div role='alert'>{props.message}</div>;
	}

	if (props.status === 'empty') {
		return <EmptyState title={props.title} />;
	}

	return <>{props.children}</>;
}
```

## Parts File Example

```txt
src/components/projects/ProjectDetails.tsx
src/components/projects/ProjectDetails.parts.tsx
src/components/projects/hooks/useProjectDetails.ts
```

```tsx
export function ProjectDetailsHeader() {
	return <header />;
}

export function ProjectDetailsMeta() {
	return <section />;
}
```

## Index Export Example

```ts
export { ProjectList } from './ProjectList';
export type { ProjectListProps } from './ProjectList';
```

## Recommended Feature Folder

```txt
src/components/projects/
  ProjectList.tsx
  ProjectDetails.tsx
  ProjectDetails.parts.tsx

  hooks/
    useProjectList.ts
    useProjectDetails.ts

  constants/
    projectComponentConstants.ts

  types/
    projectComponentTypes.ts

  index.ts
```

## Recommended Component Workflow

```txt
Search existing ui/shared/feature components
  ↓

Choose correct layer
  ↓

Design props API
  ↓

Choose composition pattern
  ↓

Separate feature logic into hooks when needed
  ↓

Split large JSX into parts files
  ↓

Add JSDoc for reusable exports
  ↓

Check accessibility basics
  ↓

Verify file size and dependency direction
```
