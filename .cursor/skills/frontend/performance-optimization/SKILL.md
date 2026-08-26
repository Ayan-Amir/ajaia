---
name: performance-optimization
description: Use when improving React TypeScript UI runtime performance, bundle impact, list rendering, lazy loading, static assets, or debounced or throttled interactions in a Vite app. Do NOT use for API or query-layer performance as the primary focus, ESLint or Prettier-only tasks, or non-UI backend work — use api-integration, code-quality-and-linting, or the relevant platform skill instead. NOT for meta tag management or structured data that affects SEO — use seo-and-metadata.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Performance Optimization

## Stack Context

- Framework: React + TypeScript + Vite
- List virtualization: `react-window` (or `react-virtualized` when already in the project)
- Static assets: `public/` for non-bundled or cache-friendly files
- Source: `src/` application code
- Import alias: `@/` for internal modules (match Vite and `tsconfig` paths in the consuming repo)

## When To Use

- Reducing avoidable rerenders or stabilizing expensive subtrees after profiling
- Splitting oversized components that cause broad rerenders
- Optimizing long or heavy lists, including virtualization
- Code-splitting heavy routes or features with `React.lazy` and `Suspense`
- Debouncing or throttling high-frequency handlers
- Right-sizing static assets and dependency imports for bundle health

## Do Not Use

- Network, cache, or server latency optimization as the main goal — use `api-integration`
- Code style, ESLint, Prettier, or import-order-only fixes — use `code-quality-and-linting`
- Component API design or folder layout without a performance angle — use `component-architecture`
- Form validation schema design — use `validation-schemas`
- Meta tag management or structured data that affects SEO — use `seo-and-metadata`

## Folder Structure

React TypeScript boilerplate (typical):

```text
.
├── vite.config.ts
├── package.json
├── public/                   ← static assets not bundled as modules
└── src/
    ├── components/
    └── features/
```

This skill package (`performance-optimization`):

```text
performance-optimization/
├── SKILL.md
├── references/
│   ├── patterns.md
│   ├── examples.md
│   ├── decisions.md
│   ├── anti-patterns.md
│   └── troubleshooting.md
└── scripts/
    └── build.sh
```

## How To Apply

1. Confirm behavior is correct; read `references/patterns.md` for core rules, workflows, and guardrails.
2. For implementation snippets (split, virtualize, lazy, debounce, images), read `references/examples.md`.
3. For trade-offs (memo versus split, `public/` versus `src/`, debounce timing), read `references/decisions.md`.
4. When debugging a specific symptom, read `references/troubleshooting.md` and `references/anti-patterns.md` as needed.
5. After dependency or chunking changes, run `scripts/build.sh` from the boilerplate root (execute; do not read) and compare bundle output to a baseline.
6. Report performance work using ONLY the template in `references/examples.md`.

## References

- Rules, workflows, package guardrails, agent output contract → read `references/patterns.md`
- Code examples and mandatory review markdown shape → read `references/examples.md`
- Decision tables → read `references/decisions.md`
- What not to do → read `references/anti-patterns.md`
- Symptom-based fixes → read `references/troubleshooting.md`

## Scripts

- From the boilerplate root, run this skill's `scripts/build.sh` using its workspace path (execute, do not read). Use output for bundle and chunk comparison after optimization or new dependencies.

## Pipeline

- Depends on: correct feature behavior first; structural patterns from `component-architecture`; hook stability patterns from `custom-hooks` when relevant; network and data-fetch performance from `api-integration` when the bottleneck is not render-bound.
- This skill refines UI render paths, lists, chunks, assets, and interaction handlers after correctness and data flow are sound.
- Feeds into: CI bundle budgets, release notes for dependency or chunk changes, and human verification in Human Check.

Rule: never optimize before correctness is established.

## Human Check

Before accepting agent output:

- Capture React DevTools Profiler before and after for touched components and compare commit or render cost.
- Compare bundle impact when adding or changing dependencies or lazy boundaries (for example using build output from `scripts/build.sh`).
- Manually test scroll behavior for virtualized lists (smoothness, row correctness, edge states).
- Reject changes that add complexity without a clear measured or observable gain.
