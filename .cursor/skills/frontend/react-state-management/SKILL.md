---
name: react-state-management
description: Use when choosing or implementing global client state (Context, Zustand), or deciding how server state relates to UI stores. Do NOT use for TanStack Query hook implementations (api-integration), field-level form state (forms-validation), or generic effect-only hooks (custom-hooks). NOT for managing WebSocket connection lifecycle or event handling — use websocket.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# React State Management

## Stack Context

- Framework: React + TypeScript + Vite
- Global UI / client state: Zustand (`src/store/`) with devtools/persist when needed
- Cross-cutting auth-style context: `src/context/` (example: `AuthContext.tsx`)
- Server state: TanStack Query — **hook implementations** live under **api-integration** (`src/data/<feature>/`)
- URL-driven state: React Router — see **routing-navigation**
- Import alias in snippets: `#/` as in the boilerplate

## When To Use

- Picking Context vs Zustand vs local `useState`
- Implementing or extending a Zustand slice for UI chrome (theme, sidebar)
- Implementing auth/session context provider + consumer hook
- Guardrails for keeping API data out of client stores

## Do Not Use

- Creating `useQuery` / `useMutation` files → **api-integration**
- React Hook Form state and Zod → **forms-validation**
- Reusable non-global hooks → **custom-hooks**
- Managing WebSocket connection lifecycle or event handling → **websocket**

## Folder Structure

```text
src/
├── store/
│   └── useUIStore.ts
├── context/
│   └── AuthContext.tsx
└── data/
    └── <feature>/
        ├── queries/
        └── mutations/
```

## How To Apply

1. Classify state: local vs shared vs server vs URL (see `references/decisions.md`).
2. For Context or Zustand code, follow `references/patterns.md` and `references/examples.md`.
3. Never mirror React Query entities into Zustand; read `references/anti-patterns.md`.
4. Run `scripts/lint.sh` and `scripts/typecheck.sh` after edits.

## References

- Context + Zustand patterns → `references/patterns.md`
- Auth / UI store examples → `references/examples.md`
- When to use which store → `references/decisions.md`
- Forbidden overlaps → `references/anti-patterns.md`
- Provider / hydration issues → `references/troubleshooting.md`

## Scripts

- Lint: `scripts/lint.sh`
- Typecheck: `scripts/typecheck.sh`
- Build smoke: `scripts/test.sh`

## Pipeline

- **Depends on:** `type-definitions` for store/context typing
- **Feeds into:** `component-architecture`, `api-integration` (server cache stays authoritative)

## Human Check

- Provider wraps the tree where hooks are used; misuse throws a clear error
- Zustand selectors avoid broad object returns when possible
- No server entities persisted into UI stores “for caching”
- Manual smoke: login/logout or theme toggle flows if touched
