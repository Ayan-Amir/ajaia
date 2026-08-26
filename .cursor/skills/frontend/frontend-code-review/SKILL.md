---
name: frontend-code-review
description: "Use this skill whenever a review, audit, or quality check is needed on
frontend React/TypeScript code. Triggers include: reviewing a pull request, auditing
a file or component, checking a full codebase for quality issues, pre-merge reviews,
or any request to find problems, improvements, or standard violations in frontend code.
Use for phrases like: 'review this component', 'check my PR', 'audit the codebase',
'what's wrong with this file', 'is this code up to standard', 'review before merging'.
Covers all 22 frontend skill domains: component architecture, API integration, forms,
state, routing, auth, types, validation, styling, testing, accessibility, performance,
logging, error handling, SEO, WebSocket, environment, hooks, utils, linting, and more.
NOT for writing new features (use the relevant domain skill directly), NOT for
backend or mobile code review, NOT for infrastructure or CI/CD pipeline review."
allowed-tools: Read, Write, Edit, Bash
model: claude-sonnet-4-20250514
---

# Frontend Code Review

## Overview

This skill reviews React/TypeScript frontend code against all 22 frontend skill
domains. It produces a structured severity-grouped report and offers targeted fixes
after the report is complete.

---

## Step 1 — Determine Scope

Before reviewing, identify what is being reviewed:

| Input | Scope mode |
|---|---|
| "review this file / component" | SINGLE FILE |
| "review my PR" / diff provided | DIFF |
| "audit the codebase" / "review everything" | FULL CODEBASE |
| No explicit scope, just code pasted | SINGLE FILE |

For FULL CODEBASE: walk `src/` recursively. Focus on `.tsx`, `.ts` files.
Skip `node_modules/`, `dist/`, `build/`, `.next/`, coverage output.

For DIFF: review only changed files. Note which issues are in new vs existing code —
flag new code issues as higher priority.

For SINGLE FILE: review the file in full. Still check cross-skill boundaries
(e.g. does this component handle its own auth guard when it shouldn't?).

---

## Step 2 — Load Domain References

Do NOT load all 22 skill references upfront. Load only what the code touches.

Scan the code first, then load references for relevant domains:

| If code contains | Load reference from |
|---|---|
| API calls, React Query, fetch/axios | frontend/api-integration/ |
| TypeScript types, interfaces, generics | frontend/type-definitions/ |
| Zod / Yup schemas | frontend/validation-schemas/ |
| React Hook Form, form submit logic | frontend/forms-validation/ |
| useState, useReducer, Zustand, Redux | frontend/react-state-management/ |
| React Router, route guards, navigation | frontend/routing-navigation/ |
| Token handling, session, auth context | frontend/authentication-session-management/ |
| Error boundaries, try/catch, error UI | frontend/error-boundaries/ |
| Loading states, empty states, skeletons | frontend/ui-states/ |
| Tailwind classes, CVA, design tokens | frontend/styling-system/ |
| useEffect, custom use* hooks | frontend/custom-hooks/ |
| Helper functions, utils, constants | frontend/reusable-helpers/, frontend/constants-and-ui-patterns/ |
| ESLint, Prettier, import order | frontend/code-quality-and-linting/ |
| React.memo, useMemo, useCallback, lazy | frontend/performance-optimization/ |
| ARIA, semantic HTML, keyboard nav | frontend/accessibility/ |
| WebSocket, real-time events | frontend/websocket/ |
| Meta tags, JSON-LD, OpenGraph | frontend/seo-and-metadata/ |
| jest, RTL, MSW, test files | frontend/testing/ |
| logger, Sentry, console usage | frontend/logging-monitoring/ |
| .env files, environment variables | frontend/environment-management/ |

---

## Step 3 — Run the Review

Check each loaded domain against its skill patterns. For every issue found, record:

- **Severity** (see below)
- **Domain** — which skill owns this issue
- **File** — relative path from src/
- **Line** — specific line number if identifiable
- **Issue** — what is wrong, stated plainly
- **Fix** — one concrete line of what correct looks like

### Severity Levels

| Level | Meaning | Examples |
|---|---|---|
| 🔴 Critical | Breaks correctness, security, or user experience | Exposed token in localStorage, missing error boundary around async, broken auth guard, N+1 query in render |
| 🟡 Warning | Violates a skill pattern, will cause problems at scale | Missing loading/error state, inline style instead of Tailwind token, useEffect with missing deps, no input validation |
| 🔵 Suggestion | Improvement opportunity, not a violation | Component could be split, helper could be extracted to utils, missing JSDoc on public hook |

### Auto-Fix Eligible (flag separately)
Issues in `code-quality-and-linting` domain (ESLint, Prettier, import order) are
auto-fix eligible. Flag these with ⚡ — they can be fixed with `scripts/lint.sh`
without human judgment.

---

## Step 4 — Output the Report

Always output the report before offering fixes. Format:

```
## Frontend Code Review — [scope: SINGLE FILE / DIFF / FULL CODEBASE]
**Reviewed:** [filename or "X files across src/"]
**Date:** [today]

---

### Summary
| Severity | Count |
|---|---|
| 🔴 Critical | N |
| 🟡 Warning | N |
| 🔵 Suggestion | N |
| ⚡ Auto-fixable (linting) | N |
| **Domains affected** | X of 22 |

---

### 🔴 Critical Issues

#### [Domain Name — Skill: skill-directory-name]
**File:** src/path/to/file.tsx, Line N
**Issue:** [plain description of what is wrong]
**Fix:** [one concrete example of correct code or pattern]

[repeat per critical issue]

---

### 🟡 Warnings

#### [Domain Name — Skill: skill-directory-name]
**File:** src/path/to/file.tsx, Line N
**Issue:** [plain description]
**Fix:** [concrete fix]

[repeat per warning]

---

### 🔵 Suggestions

#### [Domain Name — Skill: skill-directory-name]
**File:** src/path/to/file.tsx, Line N
**Issue:** [plain description]
**Fix:** [concrete fix]

---

### ⚡ Auto-Fixable (Linting)
These can be resolved by running: `scripts/lint.sh`
- [file:line — issue description]
- [file:line — issue description]

---

### Domains Checked
[List all domains checked with ✅ clean or issue count]
```

---

## Step 5 — Offer Fixes

After the report is output, ask:

```
I found [N critical, N warnings, N suggestions] across [X domains].

Which issues would you like me to fix? You can say:
- A severity level ("fix all critical issues")
- A domain ("fix all accessibility issues")
- A specific item ("fix item 2 in warnings")
- "fix linting" to auto-apply all ⚡ items

I'll fix one group at a time and confirm before moving to the next.
```

### Fix Behavior

- Load the relevant domain skill before applying any fix
- Fix only what was agreed — do not touch other lines
- After each fix, show a before/after diff
- Ask "Shall I continue to the next item?" before proceeding
- Never batch fixes across severity levels without confirmation
- Exception: ⚡ linting fixes can all be applied in one pass via `scripts/lint.sh`
  in `frontend/code-quality-and-linting/`

---

## Review Principles

These apply across all domains regardless of which skill reference is loaded:

1. **Flag patterns, not preferences** — only raise issues that a skill explicitly
   covers. Do not invent rules.

2. **One fix per issue** — give the concrete correct pattern, not a list of options.
   The developer decides; you advise.

3. **Cross-domain issues get the primary owning skill** — if a form is missing
   validation AND has an accessibility issue, report under both domains separately.

4. **New code vs existing code** — in DIFF mode, always note if an issue is in
   newly added lines (higher priority) vs pre-existing code (lower priority, flag
   but don't block merge).

5. **Systemic issues get one entry** — if the same pattern violation appears in
   20 files, report it once with "affects N files" rather than 20 separate entries.
   List the files in a collapsed section.

6. **Empty state is a valid finding** — if a domain is entirely missing (e.g. no
   error boundaries anywhere in the codebase), that is a Critical issue, not just
   a suggestion.

---

## References

Load these only when reviewing the relevant domain — do not preload:

- API patterns → frontend/api-integration/references/
- Component patterns → frontend/component-architecture/references/
- Auth patterns → frontend/authentication-session-management/references/
- Routing patterns → frontend/routing-navigation/references/
- Form patterns → frontend/forms-validation/references/
- State patterns → frontend/react-state-management/references/
- Type patterns → frontend/type-definitions/references/
- Validation patterns → frontend/validation-schemas/references/
- Styling patterns → frontend/styling-system/references/
- Hook patterns → frontend/custom-hooks/references/
- Helper patterns → frontend/reusable-helpers/references/
- Linting patterns → frontend/code-quality-and-linting/references/
- Performance patterns → frontend/performance-optimization/references/
- Accessibility patterns → frontend/accessibility/references/
- WebSocket patterns → frontend/websocket/references/
- SEO patterns → frontend/seo-and-metadata/references/
- Testing patterns → frontend/testing/references/
- Logging patterns → frontend/logging-monitoring/references/
- Environment patterns → frontend/environment-management/references/
- UI state patterns → frontend/ui-states/references/
- Error patterns → frontend/error-boundaries/references/
- Constants patterns → frontend/constants-and-ui-patterns/references/
