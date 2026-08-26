# Decisions

## Decision Table: Token vs Local Utility

| Situation | Choose | Why |
|---|---|---|
| Value reused in 2+ components | Create semantic token | Prevent repeated literals and drift |
| One-off spacing tweak in a single file | Local utility class | Avoid token bloat |
| Brand color change expected | Semantic token | Enables global update |
| Temporary experiment not shipping | Local class with TODO | Keeps theme stable until validated |

## Decision Table: CVA vs Plain Class

| Situation | Choose | Why |
|---|---|---|
| Reusable component with multiple states | CVA variants | Clear API and defaults |
| Single state leaf component | Plain class list | Lower complexity |
| Caller needs style extension | `cn(base, className)` | Predictable composition |
| Variant conflict across callers | Normalize through CVA key | Centralized contract |

## Decision Table: File Placement

| Artifact | Location |
|---|---|
| Global style tokens | `src/index.css` |
| Class merging helper | `src/utils/cn.ts` |
| Reusable styled primitives | `src/components/ui/` |
| Feature-specific styling | feature folder component |

## Cross-Skill Ownership Boundaries

| Pattern | Owner Skill | Action In This Skill |
|---|---|---|
| TanStack Query hooks | `api-integration-data-layer` | Do not define/query pattern here |
| `queryClient.ts`, logger/Sentry | `logging-monitoring` (+ toast in `ui-states`) | Reference owner and stop |
| ErrorBoundary implementation | `error-boundaries` | Reference owner and stop |
| RHF mode defaults (`onBlur`) | `validation-schemas` | Reference owner and stop |
| Auth context implementation | `react-state-management` | Reference owner and stop |
| Auth types file location | `type-definitions` | Coordinate and defer |
| Folder naming conventions | `routing-navigation` | Follow owner guidance |
