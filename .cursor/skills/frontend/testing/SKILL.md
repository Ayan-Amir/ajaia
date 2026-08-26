---
name: testing
description: Use when writing or setting up tests — unit tests for utils/hooks, component tests with RTL, API mocking with MSW, integration tests for user flows, or accessibility tests with axe. Do NOT use for non-testing tasks such as component implementation, API integration, or form validation.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Testing

## Stack Context
- Test runner: Vitest (native Vite integration)
- Component testing: React Testing Library + `@testing-library/user-event`
- DOM matchers: `@testing-library/jest-dom`
- API mocking: MSW v2 (network-level — never mock fetch/axios directly)
- Accessibility: vitest-axe (axe-core)
- Framework: React 19 + TypeScript + Vite + TanStack React Query

## When To Use
- Writing any `.test.ts` or `.test.tsx` file
- Setting up Vitest, RTL, MSW, or vitest-axe for the first time
- Testing utils, custom hooks, components, full page flows, or accessibility
- A developer asks "how do I test this", "what should I test", or "why is my test failing"

## Do Not Use
- Component implementation — use `component-architecture` skill
- API query hooks — use `api-integration` skill
- Form validation schemas — use `validation-schemas` skill

## Folder Structure
```
src/
├── utils/string.ts
├── utils/string.test.ts          # unit tests co-located with source
├── hooks/useUsers.ts
├── hooks/useUsers.test.ts        # hook tests co-located with source
├── components/common/Badge.tsx
├── components/common/Badge.test.tsx
└── tests/
    ├── setup.ts                  # Vitest global setup (MSW lifecycle, jest-dom)
    ├── utils/test-utils.tsx      # Custom render + createWrapper (all providers)
    ├── mocks/
    │   ├── handlers.ts           # MSW default request handlers
    │   ├── server.ts             # MSW Node server (Vitest)
    │   └── browser.ts            # MSW browser worker (optional, for dev)
    └── integration/
        └── LoginFlow.test.tsx    # multi-step flows
```

## How To Apply
1. Read `references/setup.md` first if this is a new project or if setup files don't exist yet
2. Use the decision table below to pick the right reference file for your task
3. Read only the reference file for your task — each is self-contained
4. Unit/hook tests go next to the source file; integration tests go in `src/tests/integration/`
5. Always import `render` from `@/tests/utils/test-utils`, never from `@testing-library/react`
6. Every component test must include at least one `axe(container)` check

## What to Test — Decision Table

| What you have | Reference file |
|---|---|
| A utility function (`formatDate`, `slugify`) | `unit-testing.md` |
| A custom hook (`useCounter`, `useAuth`) | `unit-testing.md` |
| A hook that uses React Query | `unit-testing.md` |
| A display component (Badge, Avatar) | `component-testing.md` |
| A component with user interaction or form | `component-testing.md` |
| A component that fetches data | `component-testing.md` + `api-mocking-testing.md` |
| MSW handlers for new endpoints | `api-mocking-testing.md` |
| A full page or multi-step user flow | `integration-testing.md` |
| Accessibility with axe or keyboard nav | `accessibility-testing.md` |

## References
- First-time setup (install, vite.config, tsconfig, setup.ts, test-utils) → `references/setup.md`
- Unit tests for utils and hooks → `references/unit-testing.md`
- Component tests with RTL → `references/component-testing.md`
- API mocking with MSW v2 → `references/api-mocking-testing.md`
- Integration tests for full flows → `references/integration-testing.md`
- Accessibility testing with axe → `references/accessibility-testing.md`

## Scripts
- To run tests in watch mode: `npm test`
- To run once (CI): `npm run test:run`
- To check coverage: `npm run test:coverage`
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)

## Pipeline
- Depends on: `environment-management` (env vars), `reusable-helpers` (utils under test), `api-integration` (hooks under test)
- Testing is the final validation layer — run after any skill implementation

## Human Check
- Confirm every `.test.tsx` file imports `render` from `@/tests/utils/test-utils`, not RTL directly
- Confirm every component test has at least one `axe(container)` assertion
- Confirm MSW handlers exist for every API endpoint used in tests
- Confirm `userEvent` is used for all interactions — no `fireEvent`
- Confirm no `fetch`, `axios`, or `queryClient` is mocked directly
- Run `npm run test:run` and confirm zero failures
