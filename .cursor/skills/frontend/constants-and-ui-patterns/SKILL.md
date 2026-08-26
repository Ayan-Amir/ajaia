---
name: constants-and-ui-patterns
description: Use when defining or locating constants, enums, route paths, API endpoints, regex patterns, messages, UI config values, or deciding where a shared component belongs. Do NOT use for Zod validation schemas, React hooks, API service functions, or component implementation details — those belong in their own skills.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Constants & UI Patterns

## Stack Context
- Framework: React 19 + TypeScript + Vite
- UI library: Shadcn/ui — `src/components/ui/` is **Shadcn-owned**, never write custom components there
- Class merging: `clsx` + `tailwind-merge` via `cn()` utility at `@/utils/cn`
- Constants location: `src/constants/` — one file per domain, barrel at `src/constants/index.ts`
- Import alias: `@/constants` — always import from the barrel, never from individual files
- `STALE_TIME` lives in `src/constants/ui.ts` — referenced by the `ui-states` skill for queryClient config

## When To Use
- Defining or adding to any constant file (`routes.ts`, `api.ts`, `enums.ts`, `regex.ts`, `messages.ts`, `ui.ts`)
- A developer hardcodes a path, status string, role, message, or numeric value inside a component
- Deciding where a shared component belongs (`ui/`, `common/`, or feature folder)
- Building a reusable UI component that depends on enums or shared constants (e.g. a status badge)
- Setting up the `cn()` utility or component file structure for the first time

## Do Not Use
- Zod validation schemas — use `validation-schemas` skill
- React hooks — use `custom-hooks` skill
- API service functions or React Query hooks — use `api-integration` skill
- Component state or data-fetching logic — use `component-architecture` skill

## Folder Structure
```
src/
├── constants/
│   ├── index.ts      # Barrel — always import from here
│   ├── routes.ts     # App route paths + builder functions
│   ├── api.ts        # API base URL + endpoint paths
│   ├── enums.ts      # Status, role, domain enums + display label maps
│   ├── regex.ts      # Validation regex patterns
│   ├── messages.ts   # User-facing strings (errors, success, empty states)
│   └── ui.ts         # Z-index, breakpoints, durations, STALE_TIME, pagination, file limits
└── components/
    ├── ui/           # Shadcn/ui ONLY — CLI-generated, never edit manually
    ├── common/       # Custom shared components (2+ features)
    └── [feature]/    # Feature-scoped components (1 feature only)
```

## How To Apply
1. Read `references/patterns.md` for naming rules, component placement rules, and when to centralize
2. Add the constant to the correct domain file — see references for each domain's full implementation
3. Export it from `src/constants/index.ts` if a new domain file was created
4. Use `@/constants` barrel import everywhere — never import from individual files directly
5. For a new shared component, confirm placement using the decision table in `references/patterns.md`
6. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For naming rules, component placement decision table, and when to centralize vs keep local → read `references/patterns.md`
- For route paths, builder functions, and API endpoint constants → read `references/examples-routes-api.md`
- For enums, display label maps, and regex patterns → read `references/examples-enums-regex.md`
- For user-facing messages, UI config constants (STALE_TIME, Z_INDEX, etc.), and barrel export → read `references/examples-messages-ui.md`
- For cn() utility, component file template, and status badge pattern → read `references/examples-components.md`
- For what NOT to do → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)
- To install cn() dependencies: run `scripts/setup.sh` (execute, do not read)

## Pipeline
- Depends on: `environment-management` (`VITE_API_BASE_URL` consumed in `api.ts`)
- Feeds into: `ui-states` (`STALE_TIME`, `MESSAGES` consumed in queryClient and components), `validation-schemas` (`REGEX` consumed in Zod schemas), `reusable-helpers` (`REGEX` consumed in `validation.ts`), `routing-navigation` (`ROUTES` consumed in router and Link components), `api-integration` (`API` endpoints consumed in query functions)

## Human Check
- Confirm no magic strings or hardcoded paths remain in components (`grep -r '"/dashboard"' src/`)
- Confirm all enums have a display label map before any component renders them as text
- Confirm `STALE_TIME.STATIC` uses `Infinity` (not a numeric value)
- Confirm `src/components/ui/` contains only Shadcn CLI-generated files — no custom components
- Confirm every new constant file is exported from `src/constants/index.ts`
- Run `yarn tsc --noEmit` and confirm zero errors
