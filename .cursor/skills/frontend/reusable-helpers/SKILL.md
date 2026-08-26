---
name: reusable-helpers
description: Use when writing, extracting, or locating a shared utility function (date, string, number, array, validation, storage, URL, async). Do NOT use for component logic, Zod validation schemas, React hooks, or API-layer helpers — those belong in their own skills. NOT for utilities that require React state or effects — use custom-hooks instead.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# Reusable Helpers

## Stack Context
- Framework: React 19 + TypeScript + Vite
- No third-party utility libraries (lodash, ramda, etc.) — pure TypeScript only
- Date library: project-specific — check if `dayjs` or `moment` is installed; prefer `dayjs` for new projects
- All helpers live in `src/utils/` — one file per domain
- Public import alias: `@/utils` — always import from the barrel, never from individual files directly
- Validation regex lives in `@/constants` (`REGEX.EMAIL`, `REGEX.URL`, etc.)

## When To Use
- Writing or extracting a utility or helper function into `src/utils/`
- Formatting dates, relative time, strings, numbers, currencies, or bytes
- Manipulating arrays or objects (group, sort, chunk, pick, omit)
- Writing field validators used outside of a Zod schema
- Wrapping localStorage or sessionStorage
- Building or parsing URL query strings
- Adding debounce, throttle, retry, or sleep logic
- A developer asks "where should I put this function" or writes inline logic that belongs in utils

## Do Not Use
- Zod validation schemas for forms — use `validation-schemas` skill
- React hooks — use `custom-hooks` skill
- Utilities that require React state or effects — use `custom-hooks` skill
- API service functions or query helpers — use `api-integration` skill
- Component-specific logic that is not reused elsewhere

## Folder Structure
```
src/
└── utils/
    ├── index.ts        # Barrel — re-exports everything; always import from here
    ├── date.ts         # Date formatting, relative time, date arithmetic
    ├── string.ts       # Truncate, capitalize, slugify, mask, humanize
    ├── number.ts       # Currency, compact, clamp, round, bytes
    ├── array.ts        # groupBy, pick, omit, unique, sortBy, chunk
    ├── validation.ts   # isEmail, isUrl, isPhone, validateRequired, etc.
    ├── storage.ts      # localStorage / sessionStorage typed wrappers
    ├── url.ts          # parseQueryString, buildQueryString, joinPaths
    └── async.ts        # debounce, throttle, sleep, retry, asyncPool
```

## How To Apply
1. Check `references/patterns.md` for the writing rules (pure functions, typing, JSDoc)
2. Identify which domain file the helper belongs to (`date.ts`, `string.ts`, etc.)
3. Read the relevant reference file for existing helpers and the pattern to follow
4. Write the helper as a named export with a JSDoc `@example`
5. Add it to `src/utils/index.ts` barrel if it's a new file or a new export
6. Import via `@/utils` — never from individual domain files directly
7. Run `scripts/validate.sh` to confirm zero TypeScript errors

## References
- For writing rules, JSDoc requirements, barrel export, and usage examples → read `references/patterns.md`
- For date formatting and relative time (dayjs + moment adapters) → read `references/date-string.md`
- For string manipulation helpers → read `references/date-string.md`
- For number, currency, and byte formatting + array/object helpers → read `references/number-array.md`
- For validation helpers, storage wrappers, URL utils, and async helpers → read `references/validation-storage-url-async.md`
- For what NOT to do → read `references/anti-patterns.md`

## Scripts
- To validate TypeScript: run `scripts/validate.sh` (execute, do not read)

## Pipeline
- Depends on: `environment-management` (env.ts available), `constants` (REGEX constants for validation.ts)
- Feeds into: `component-architecture` (components import formatting helpers), `validation-schemas` (field validators complement Zod schemas), `api-integration` (URL and async helpers used in services)

## Human Check
- Confirm each new helper has a JSDoc `@example` that matches its actual output
- Test edge cases: null/undefined inputs, empty strings, zero values, empty arrays
- Confirm no `any` types — run `yarn tsc --noEmit` and check for zero errors
- Confirm the helper is exported from `src/utils/index.ts` and importable via `@/utils`
- Confirm no third-party library was imported — only pure TypeScript or the project's existing date lib
