# Component Layers

Use this reference for deciding whether a component belongs in `ui`, `shared`, or feature
scope.

## Layer Model

| Layer              | Location                    | Purpose                                          |
| ------------------ | --------------------------- | ------------------------------------------------ |
| UI primitives      | `src/components/ui/`        | App-wide low-level design-system building blocks |
| Shared components  | `src/components/shared/`    | Reusable cross-feature components and sections   |
| Feature components | `src/components/[feature]/` | Feature-specific UI, composition, and screens    |

## UI Primitive Layer

Use `src/components/ui/` for components that are generic, visual, and app-wide.

Examples:

- Button
- Input
- Card
- Badge
- Dialog
- Tabs
- Tooltip
- Checkbox

Rules:

- Keep UI primitives domain-free.
- Keep UI primitives feature-free.
- Do not import API clients, feature hooks, routes, or domain models.
- Use typed props.
- Use design-system styling conventions.
- Use variants instead of duplicating primitives for style changes.
- Prefer named exports and stable `index.ts` re-exports.

## Shared Component Layer

Use `src/components/shared/` for reusable components used by more than one feature.

Examples:

- EmptyState
- PageHeader
- DataShell
- FilterBar
- ConfirmDialog
- SearchInput
- SectionCard

Rules:

- Use shared when the component is reused by two or more features.
- Compose UI primitives from `src/components/ui/`.
- Keep props generic and stable.
- Avoid leaking one feature’s internal types.
- Do not duplicate shared sections across feature folders.
- Extract duplicated feature markup into `shared/`.

## Feature Component Layer

Use `src/components/[feature]/` for components that belong to one product feature.

Examples:

```txt
src/components/dashboard/DashboardStatsCard.tsx
src/components/profile/ProfileSummary.tsx
src/components/billing/BillingPlanCard.tsx
```

Rules:

- Keep feature-specific UI in the feature folder.
- Use feature hooks for feature-specific state or behavior.
- Feature components may know about feature domain types.
- Do not promote to shared until reuse is real or clearly planned.
- Extract to shared when a second feature needs the same UI.

## Promotion Rule

Start specific, then promote when reuse becomes real.

```txt
feature component
  ↓ reused by second feature
shared component
  ↓ becomes low-level visual primitive
ui primitive
```

Rules:

- Do not copy-paste composites across features.
- Move shared UI into `src/components/shared/`.
- Move only truly generic visual primitives into `src/components/ui/`.
- Update imports after promotion.
- Keep public APIs stable after promotion.

## Search Before Creating

Before adding a component:

1. Search `src/components/ui/`.
2. Search `src/components/shared/`.
3. Search relevant `src/components/[feature]/`.
4. Extend existing components when reasonable.
5. Create a new component only when no existing component fits.

## Dependency Direction

Allowed dependency direction:

```txt
feature components
  → shared components
    → ui primitives
```

Forbidden dependency direction:

```txt
ui primitives → shared components
ui primitives → feature components
shared components → feature-specific components
```

Rules:

- UI primitives must not import from shared or feature folders.
- Shared components may import UI primitives.
- Feature components may import shared and UI components.
- Avoid circular dependencies between component layers.

## Feature Folder Organization

```txt
src/components/[feature]/
  FeaturePanel.tsx
  FeaturePanel.parts.tsx
  FeatureList.tsx
  hooks/
    useFeaturePanel.ts
  constants/
    featureComponentConstants.ts
  types/
    featureComponentTypes.ts
```

Rules:

- Keep feature-specific hooks inside the feature folder.
- Keep feature-only constants and types colocated.
- Extract shared constants/types only when reused across features.
- Use parts files before components become oversized.

## Ownership Examples

Good:

```txt
src/components/ui/Button.tsx
src/components/shared/EmptyState.tsx
src/components/dashboard/DashboardStatsCard.tsx
```

Bad:

```txt
src/components/dashboard/Button.tsx
src/components/home/EmptyState.tsx
src/components/settings/EmptyState.tsx
```

## Done Criteria

Layer ownership is correct when:

- UI primitives are domain-free and feature-free.
- Shared components are reusable across features.
- Feature components stay feature-specific.
- Duplicated shared markup has been extracted.
- Imports follow the dependency direction.
- Components are placed where future maintainers would expect them.
