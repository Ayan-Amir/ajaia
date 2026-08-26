# Architecture

## Type Boundary Flow
```mermaid
flowchart LR
    A[Backend JSON Contract] --> B[API Types<br/>src/types/feature/*.api.types.ts]
    B --> C[Mapper Boundary<br/>src/types/feature/*.mapper.ts]
    C --> D[Domain Types<br/>src/types/feature/*.types.ts]
    D --> E[Services + Hooks Consumption]

    F[Shared Contracts<br/>src/types/common/*] --> E
    G[Auth Types<br/>src/types/auth/auth.types.ts] --> E

    E --> H[UI Components]
```

## Layer Responsibilities
- API types mirror transport payloads exactly.
- Mappers translate transport shape into domain/UI shape.
- Domain types model what frontend features consume.
- Shared contracts hold cross-feature primitives (error, pagination, envelopes).
- Auth type file location is standardized under `src/types/auth/`.

## Ownership Boundaries
- Query orchestration and hook design are delegated to `api-integration-data-layer`.
- Error boundary rendering is delegated to `error-boundaries`.
- Logging, Sentry, and query client wiring are delegated to `logging-monitoring`.
