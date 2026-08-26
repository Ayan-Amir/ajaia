# Architecture

This architecture describes the React + Tailwind styling system itself: how semantic tokens flow into utilities, how class composition is standardized, and how reusable variants propagate into UI primitives and feature components.

## Tailwind Styling System Architecture

```mermaid
flowchart LR
  A["src/index.css\n@theme semantic tokens\n--color-primary, --radius-md, --spacing-section"] --> B["Tailwind utility generation\n(token-backed classes)"]

  B --> C["Base utility usage\nin components"]
  C --> D["src/utils/cn.ts\nclsx + tailwind-merge"]

  D --> E["CVA variant contracts\nvariant + size + defaultVariants"]
  E --> F["src/components/ui/*\nshared primitives"]
  F --> G["feature components/pages\ncompose primitives"]

  H["Responsive rules\nmobile-first: base -> sm -> md -> lg -> xl -> 2xl"] --> F
  H --> G

  I["Governance rules\nno inline styles\nno hardcoded repeated values\nno tailwind.config.ts token mapping"] --> A
  I --> E

  J["Validation\nyarn lint + yarn typecheck + yarn test"] --> G
```

## Layer Responsibilities

- `src/index.css`: single source of truth for semantic design tokens.
- Tailwind utilities: consume tokens for consistent style primitives.
- `src/utils/cn.ts`: deterministic class merge behavior for conditional styling.
- CVA variants: reusable state/size/tone contracts with `defaultVariants`.
- `src/components/ui/*`: shared building blocks that enforce styling contracts.
- Feature components/pages: compose primitives without redefining core variant logic.

## Output Contract

A correct implementation should show:
- token-first styling updates in `src/index.css`,
- CVA-driven reusable variant APIs,
- consistent `cn()` class composition,
- mobile-first responsive behavior across UI layers.
