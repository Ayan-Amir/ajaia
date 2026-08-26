---
name: component-architecture
description:
  Use when creating, updating, reviewing, or refactoring React component architecture,
  including component layer ownership, component boundaries, composition patterns, props
  API design, file splitting, reusable components, and component maintainability in React
  + TypeScript apps. Do NOT use for API integration, global state management, routing,
  form validation, styling-only tasks, design-token authoring, or advanced accessibility
  audits.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Component Architecture

## Stack Context

- Framework: React + TypeScript + Vite
- Styling: Tailwind CSS
- Variant utility: class-variance-authority when UI primitives need variants
- Class merging: `cn` utility from the project utilities
- UI primitives: `src/components/ui/`
- Shared components: `src/components/shared/`
- Feature components: `src/components/[feature]`
- Feature hooks: `src/hooks/[feature]/`
- Component parts: colocated `ComponentName.parts.tsx`
- Component constants/types: colocated when specific, shared only when reused

## When To Use

- Creating or refactoring reusable React components
- Deciding whether a component belongs in `ui`, `shared`, or feature scope
- Separating presentation components from feature logic
- Designing component props and public component APIs
- Choosing composition patterns such as `children`, slots, or compound components
- Splitting oversized component files
- Extracting reusable pieces from duplicated feature UI
- Reviewing component maintainability, ownership, and boundaries

## Do Not Use

- API integration, service calls, request clients, or TanStack Query patterns
- Global state management or domain state architecture
- Routing, navigation, route guards, or route layouts
- React Hook Form implementation or validation schema design
- Styling-only changes, Tailwind token authoring, or theme design
- Backend logic, database models, or server-side workflows
- Advanced accessibility audits, WCAG testing, or screen-reader bug triage

## Folder Structure

```txt
src/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      index.ts

    shared/
      EmptyState.tsx
      PageHeader.tsx
      DataShell.tsx
      index.ts

  [feature]/
    components/
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

## How To Apply

1. Identify whether the task is about component ownership, boundaries, composition, props
   API, splitting, or reuse.
2. Search existing `src/components/ui/`, `src/components/shared/`, and relevant
   `src/components/[feature]/` before creating a new component.
3. Choose the correct layer: UI primitive, shared component, or feature component.
4. Read only the relevant reference file listed below.
5. Keep UI primitives domain-free and feature-free.
6. Keep reusable shared components generic and stable.
7. Move feature logic into hooks when it makes the component hard to read or reuse.
8. Split files before they exceed the project’s component size limit.
9. Run the project’s existing lint, typecheck, and test commands after component changes.

## References

- For deciding whether a component belongs in `ui`, `shared`, or feature scope → read
  `references/component-layers.md`
- For separating rendering, state, effects, API logic, and feature logic → read
  `references/component-boundaries.md`
- For `children`, slots, compound components, render props, and avoiding boolean prop
  explosions → read `references/component-composition.md`
- For props interfaces, callbacks, controlled/uncontrolled APIs, generics, discriminated
  unions, and public API stability → read `references/component-api-design.md`
- For the 300-line rule, parts files, hook extraction, constants/types colocation, and
  index exports → read `references/component-splitting.md`
- For PR review checks, human verification, JSDoc basics, accessibility basics, and
  anti-patterns → read `references/review-checklist.md`

## Scripts

- No bundled scripts for this skill.
- Run the project’s existing lint, typecheck, and test commands after component changes.
- Execute project scripts directly; do not copy command details into this skill unless the
  project standardizes them.

## Pipeline

- Depends on: design-system primitives, shared hooks conventions, type definitions,
  project styling conventions, basic accessibility standards
- Coordinates with: custom-hooks, UI states, forms validation, routing navigation,
  api-integration, state management
- Feeds into: feature screens, reusable page sections, dashboards, forms, layouts,
  design-system adoption, and long-term frontend maintainability

## Human Check

- Verify the component belongs in the correct layer.
- Verify existing components were reused or extended where reasonable.
- Verify UI primitives contain no feature, API, routing, or domain logic.
- Verify shared components are generic enough for cross-feature reuse.
- Verify feature-specific logic is not leaking into shared or UI layers.
- Verify component props are understandable and stable.
- Verify composition is preferred over large boolean prop matrices.
- Verify no component file exceeds the project size limit.
- Verify basic accessibility and JSDoc expectations are met where required.
