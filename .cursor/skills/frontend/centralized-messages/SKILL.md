---
name: centralized-messages
description: >-
  Toast copy and toast-related API error fallbacks live in src/constants/messages.ts
  as MESSAGES — use with toast.success/error and getApiErrorMessage(..., MESSAGES.*).
  Do NOT put headings, button labels, empty/loading inline text, or form field hints
  in MESSAGES; keep those in TSX (or feature constants). Use when adding or reviewing
  react-toastify messages and mutation/auth error toasts.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Centralized Messages (Toasts Only)

## Rule

**`MESSAGES` is for transient toast notifications and their API fallbacks** — not static page UI.

```typescript
// GOOD — toast
import { MESSAGES } from '#/constants';
toast.error(MESSAGES.AUTH.GOOGLE_SIGN_IN_ERROR);
toast.error(getApiErrorMessage(error, MESSAGES.AUTH.STAFF_ACCESS_DENIED));

// GOOD — heading / label stays in the component
<h1>New job request</h1>
<Button type="button">Continue</Button>

// BAD — page copy in messages.ts
TITLE_NEW: 'New job request',
CONTINUE: 'Continue',
```

## Belongs in `MESSAGES`

- `toast.success` / `toast.error` / `toast.info` strings
- Default strings passed to `getApiErrorMessage` when the result is shown in a toast
- Shared toast copy reused across hooks (e.g. auth)

## Does **not** belong in `MESSAGES`

- Page titles, subtitles, section headings
- Button and link labels (`Back`, `Submit`, `Sign in with Google`)
- Loading / empty / placeholder text in layout
- Inline validation under fields (`setErrors({ openings: '…' })`)
- `window.confirm` body text (keep next to the confirm call in TSX or hook)

Those stay as literals in components/hooks unless the project adds a separate copy file (not `messages.ts`).

## File layout

```typescript
// src/constants/messages.ts
export const MESSAGES = {
  AUTH: {
    GOOGLE_SIGN_IN_SUCCESS: '...',
    GOOGLE_SIGN_IN_ERROR: '...',
  },
  // JOB_CREATE: { DRAFT_SAVED: '...' } — when job-create adds toasts
} as const;
```

- Group by domain; **SCREAMING_SNAKE** keys.
- Import from **`#/constants`**.

## Checklist

- [ ] New toast strings added under `MESSAGES`, not inline in hooks (unless one-off prototype)
- [ ] No headings/labels/empty states added to `messages.ts`
- [ ] API fallback used with toast: `getApiErrorMessage(error, MESSAGES.*)`

## Related Skills

- **constants-and-ui-patterns** — routes, enums, `generic.ts`
- **ui-states** — loading/empty UI in components
- **business-logic-in-hooks** — hooks call `toast` + `MESSAGES`, not page copy
