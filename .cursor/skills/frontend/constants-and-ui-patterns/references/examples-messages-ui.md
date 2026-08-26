# Constants — Messages, UI Config & Barrel Export

## messages.ts — `src/constants/messages.ts`

All user-facing strings live here. Never hardcode error or success text in components.

```typescript
export const MESSAGES = {
  ERROR: {
    GENERIC:        "Something went wrong. Please try again.",
    NETWORK:        "Network error. Check your connection and retry.",
    UNAUTHORIZED:   "You are not authorized to perform this action.",
    NOT_FOUND:      "The requested resource was not found.",
    SESSION_EXPIRED:"Your session has expired. Please log in again.",
    VALIDATION:     "Please fix the errors below before continuing.",
  },

  SUCCESS: {
    SAVED:    "Changes saved successfully.",
    CREATED:  "Created successfully.",
    DELETED:  "Deleted successfully.",
    UPDATED:  "Updated successfully.",
    SENT:     "Sent successfully.",
    COPIED:   "Copied to clipboard.",
  },

  EMPTY: {
    DEFAULT:  "No data available.",
    SEARCH:   "No results found for your search.",
    FILTERED: "No items match the selected filters.",
    LIST:     "No items yet.",
  },

  CONFIRM: {
    DELETE: "Are you sure you want to delete this? This action cannot be undone.",
    LOGOUT: "Are you sure you want to log out?",
  },
} as const;
```

**Usage:**
```typescript
import { MESSAGES } from "@/constants";

toast.error(MESSAGES.ERROR.GENERIC);
<EmptyState message={MESSAGES.EMPTY.SEARCH} />
```

---

## ui.ts — `src/constants/ui.ts`

```typescript
export const STALE_TIME = {
  SHORT:  30_000,        // 30 seconds — frequently changing data (notifications, prices)
  MEDIUM: 5 * 60_000,   // 5 minutes  — standard data (user profiles, lists)
  LONG:   30 * 60_000,  // 30 minutes — rarely changing data (config, enums)
  STATIC: Infinity,     // Never refetch — truly static (countries, currencies)
} as const;

export const Z_INDEX = {
  BASE:    0,
  CARD:    10,
  HEADER:  100,
  SIDEBAR: 200,
  MODAL:   300,
  TOAST:   400,
  TOOLTIP: 500,
} as const;

export const BREAKPOINTS = {
  SM:  640,
  MD:  768,
  LG:  1024,
  XL:  1280,
  XXL: 1536,
} as const;

export const TRANSITION_DURATION = {
  FAST:   150,
  NORMAL: 300,
  SLOW:   500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE:      1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

export const FILE_LIMITS = {
  MAX_SIZE_MB:        10,
  MAX_SIZE_BYTES:     10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  ALLOWED_DOC_TYPES:   ["application/pdf", "text/csv"] as const,
} as const;
```

> `STALE_TIME` key is `STATIC` (not `FOREVER`) — aligned with the `ui-states` skill's queryClient defaults.

---

## Barrel Export — `src/constants/index.ts`

```typescript
export * from "./routes";
export * from "./api";
export * from "./enums";
export * from "./regex";
export * from "./messages";
export * from "./ui";
```

Every new constant file must be added here. Always import from `@/constants`, never from individual files.

```typescript
// ✅
import { ROUTES, API, UserRole, REGEX, MESSAGES, STALE_TIME, Z_INDEX } from "@/constants";

// ❌
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/enums";
```
