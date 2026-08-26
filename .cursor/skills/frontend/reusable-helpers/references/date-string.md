# Reusable Helpers — Date & String Utilities

## date.ts — Adapter Pattern

`date.ts` wraps the project's date library. **Check which is installed before writing:**
- `dayjs` — prefer for new projects (smaller, actively maintained)
- `moment` — use only if project already has it

### Adapter — dayjs (`npm install dayjs`)

```typescript
// src/utils/date.ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type DateInput = Date | string | number | null | undefined;

const FORMAT_MAP = {
  short:    "MMM D, YYYY",          // Apr 9, 2026
  long:     "dddd, MMMM D, YYYY",  // Thursday, April 9, 2026
  time:     "hh:mm A",             // 02:30 PM
  datetime: "MMM D, YYYY hh:mm A", // Apr 9, 2026 02:30 PM
  iso:      "",
} as const;

/** @example formatDate(user.createdAt, "short") // "Apr 9, 2026" */
export function formatDate(date: DateInput, format: keyof typeof FORMAT_MAP = "short"): string {
  if (!date) return "—";
  const d = dayjs(date);
  if (!d.isValid()) return "Invalid date";
  return format === "iso" ? d.toISOString() : d.format(FORMAT_MAP[format]);
}

/** @example timeAgo(post.createdAt) // "3 hours ago" */
export function timeAgo(date: DateInput): string {
  if (!date) return "—";
  return dayjs(date).fromNow();
}

/** @example isToday(new Date()) // true */
export function isToday(date: DateInput): boolean {
  return dayjs(date).isSame(dayjs(), "day");
}

/** @example addTime(new Date(), 7, "day") // 7 days from now */
export function addTime(date: DateInput, amount: number, unit: dayjs.ManipulateType = "day"): Date {
  return dayjs(date).add(amount, unit).toDate();
}

/** @example isBetween(date, startDate, endDate) // true/false */
export function isBetween(date: DateInput, from: DateInput, to: DateInput): boolean {
  const d = dayjs(date);
  return d.isSameOrAfter(dayjs(from)) && d.isSameOrBefore(dayjs(to));
}

/** @example diffIn(endDate, startDate, "day") // 5 */
export function diffIn(dateA: DateInput, dateB: DateInput, unit: dayjs.UnitType = "day"): number {
  return dayjs(dateA).diff(dayjs(dateB), unit);
}
```

### Adapter — moment (existing projects only)

```typescript
// src/utils/date.ts
import moment from "moment";
type DateInput = Date | string | number | null | undefined;
const FORMAT_MAP = { short: "MMM D, YYYY", long: "dddd, MMMM D, YYYY", time: "hh:mm A", datetime: "MMM D, YYYY hh:mm A", iso: "" } as const;

export function formatDate(date: DateInput, format: keyof typeof FORMAT_MAP = "short"): string {
  if (!date) return "—";
  const d = moment(date);
  if (!d.isValid()) return "Invalid date";
  return format === "iso" ? d.toISOString() : d.format(FORMAT_MAP[format]);
}
export function timeAgo(date: DateInput): string { if (!date) return "—"; return moment(date).fromNow(); }
export function isToday(date: DateInput): boolean { return moment(date).isSame(moment(), "day"); }
export function addTime(date: DateInput, amount: number, unit: moment.DurationInputArg2 = "days"): Date { return moment(date).add(amount, unit).toDate(); }
export function isBetween(date: DateInput, from: DateInput, to: DateInput): boolean { return moment(date).isBetween(moment(from), moment(to), undefined, "[]"); }
export function diffIn(dateA: DateInput, dateB: DateInput, unit: moment.unitOfTime.Diff = "days"): number { return moment(dateA).diff(moment(dateB), unit); }
```

---

## string.ts — `src/utils/string.ts`

```typescript
/** @example truncate("Hello World", 5) // "Hello..." */
export function truncate(str: string, maxLength: number, ellipsis = "..."): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/** @example capitalize("hello world") // "Hello world" */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** @example titleCase("hello world") // "Hello World" */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** @example slugify("Hello World!") // "hello-world" */
export function slugify(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

/** @example humanize("firstName") // "First Name" */
export function humanize(str: string): string {
  return str.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

/** @example generateId(8) // "a3fK9pQz" */
export function generateId(length = 8): string {
  return Math.random().toString(36).slice(2, 2 + length).padEnd(length, "0");
}

/** @example maskString("4111111111111111", 4) // "············1111" */
export function maskString(str: string, visibleChars = 4, maskChar = "·"): string {
  if (str.length <= visibleChars) return str;
  return maskChar.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}

/** @example isBlank("  ") // true */
export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}
```
