# Decision Guide

## Decision Table
| Situation | Choose | Why |
|---|---|---|
| Backend shape differs from UI shape | Separate `*.api.types.ts` + `*.types.ts` with mapper | Prevents leakage of backend naming into UI |
| Type used by multiple features | `src/types/common/` | Avoids duplicated contracts |
| Type only used in one feature | `src/types/<feature>/` | Keeps scope local and maintainable |
| Auth contract update | `src/types/auth/auth.types.ts` | This skill owns auth type file location |
| Unsure if field can be null | Model explicitly as `T \| null` and confirm backend | Avoids runtime assumptions |
| Helper type only used in one file | Keep file-local, do not barrel export | Reduces noisy public API |
| Runtime error normalization needed | Use utility outside `*.types.ts` | Keeps type files definition-only |

## Boundary Decisions
- Use `interface` for object shapes expected to evolve.
- Use `type` for unions, mapped types, and utility composition.
- Prefer `readonly` for immutable view models consumed by UI.
- Avoid `Partial<T>` at API boundaries unless contract explicitly supports sparse updates.

## Export Decisions
- Export only public contracts from feature `index.ts`.
- Do not root-export temporary migration types.
- Keep internal transform helper types private to mappers.

## Cross-Skill Ownership Decisions
- TanStack Query hook signatures and query keys belong to `api-integration-data-layer`.
- `queryClient.ts` ownership belongs to `logging-monitoring` (toast patterns from `ui-states`).
- ErrorBoundary component and fallback contracts belong to `error-boundaries`.
- Logger and Sentry wiring contracts belong to `logging-monitoring`.
- RHF default mode (`onBlur`) decisions belong to `validation-schemas`.
- Auth context interfaces/state machine belong to `react-state-management`.
- Folder naming policy belongs to `routing-navigation`.
