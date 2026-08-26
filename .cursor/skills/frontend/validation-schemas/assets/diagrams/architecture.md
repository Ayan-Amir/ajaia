# Architecture

## Validation flow architecture

```mermaid
flowchart LR
  A[Form Component] --> B[Feature Form Hook]
  B --> C[Zod Resolver]
  C --> D[Domain Schema in src/validation]
  D --> E[Shared Primitives and Messages]
  B --> F[Submit Handler]
  F --> G[API Client]
  G --> H[Backend Validation Error Payload]
  H --> I[applyApiErrors Utility]
  I --> B
```

## Layer boundaries
- UI components render fields and messages only.
- Feature form hooks own RHF wiring and submit orchestration.
- Validation schemas own all runtime field and cross-field constraints.
- Shared primitives/messages provide reuse across domains.
- Error mapping utility bridges backend errors into RHF field state.

## Out-of-scope boundaries
- Data fetching hooks and cache ownership stay in `api-integration-data-layer`.
- Query client and telemetry setup stay in `logging-monitoring` (toast behavior in `ui-states`).
- Error boundary components stay in `error-boundaries`.
- Auth context state container stays in `react-state-management`.
- Route folder naming policy stays in `routing-navigation`.
