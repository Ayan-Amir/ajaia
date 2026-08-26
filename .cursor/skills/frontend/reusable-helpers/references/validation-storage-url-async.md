# Reusable Helpers — Validation, Storage, URL & Async Utilities

## validation.ts — `src/utils/validation.ts`

Regex patterns live in `@/constants` (`REGEX.EMAIL`, `REGEX.URL`, `REGEX.PHONE`, `REGEX.STRONG_PASSWORD`).
These helpers validate field values — for Zod form schemas use `validation-schemas` skill instead.

```typescript
import { REGEX } from "@/constants";

export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isEmail = (value: string): boolean => REGEX.EMAIL.test(value);
export const isUrl = (value: string): boolean => REGEX.URL.test(value);
export const isPhone = (value: string): boolean => REGEX.PHONE.test(value);
export const isStrongPassword = (value: string): boolean => REGEX.STRONG_PASSWORD.test(value);
export const isNonEmptyArray = <T>(value: unknown): value is T[] =>
  Array.isArray(value) && value.length > 0;
export const isEmptyObject = (obj: object): boolean => Object.keys(obj).length === 0;

/** Returns an error string if invalid, null if valid. Use with RHF's validate option. */
export const validateEmail = (value: string): string | null =>
  isEmail(value) ? null : "Please enter a valid email address";
export const validateRequired = (value: unknown): string | null =>
  isNil(value) || value === "" ? "This field is required" : null;
export const validateMinLength = (min: number) => (value: string): string | null =>
  value.length >= min ? null : `Must be at least ${min} characters`;
export const validateMaxLength = (max: number) => (value: string): string | null =>
  value.length <= max ? null : `Must be ${max} characters or fewer`;
```

---

## storage.ts — `src/utils/storage.ts`

Type-safe wrappers around localStorage and sessionStorage. Handles JSON parse errors and
storage quota errors (e.g. incognito mode) gracefully — never throws.

```typescript
type StorageType = "local" | "session";
function getStorage(type: StorageType): Storage {
  return type === "local" ? localStorage : sessionStorage;
}

export const storage = {
  /** @example storage.get<User>("user") // User | null */
  get<T>(key: string, type: StorageType = "local"): T | null {
    try {
      const item = getStorage(type).getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch { return null; }
  },

  /** @example storage.set("cart", cartItems) */
  set<T>(key: string, value: T, type: StorageType = "local"): void {
    try { getStorage(type).setItem(key, JSON.stringify(value)); }
    catch { /* Storage full or disabled (incognito) */ }
  },

  /** @example storage.remove("cart") */
  remove(key: string, type: StorageType = "local"): void {
    getStorage(type).removeItem(key);
  },

  clear(type: StorageType = "local"): void { getStorage(type).clear(); },

  has(key: string, type: StorageType = "local"): boolean {
    return getStorage(type).getItem(key) !== null;
  },
};
```

---

## url.ts — `src/utils/url.ts`

```typescript
/** @example parseQueryString("?page=1&sort=asc") // { page: "1", sort: "asc" } */
export function parseQueryString(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => { result[key] = value; });
  return result;
}

/** @example buildQueryString({ page: 1, sort: "asc", filter: null }) // "?page=1&sort=asc" */
export function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : "";
}

/** @example joinPaths("/api", "/users/", "/profile") // "/api/users/profile" */
export function joinPaths(...parts: string[]): string {
  return "/" + parts.map((p) => p.replace(/^\/|\/$/g, "")).filter(Boolean).join("/");
}

/** @example getQueryParam("?page=2", "page") // "2" */
export function getQueryParam(search: string, key: string): string | null {
  return new URLSearchParams(search).get(key);
}

/** @example isExternalUrl("https://google.com") // true */
export function isExternalUrl(url: string): boolean {
  try { return new URL(url).origin !== window.location.origin; }
  catch { return false; }
}
```

---

## async.ts — `src/utils/async.ts`

```typescript
/** Delay execution until after wait ms since last call. @example debounce(search, 300) */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}

/** Run at most once per wait ms. @example throttle(onScroll, 100) */
export function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number) {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) { lastTime = now; fn(...args); }
  };
}

/** @example await sleep(500) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff.
 * @example const data = await retry(() => fetchUser(id))
 */
export async function retry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); }
    catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }
  throw lastError;
}

/**
 * Run async tasks with a concurrency limit.
 * @example await asyncPool(3, urls, fetchUrl) // max 3 in-flight at a time
 */
export async function asyncPool<T, R>(concurrency: number, items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  for (const item of items) {
    const p = fn(item).then((r) => { results.push(r); });
    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex((e) => e === p), 1);
    }
  }
  await Promise.all(executing);
  return results;
}
```
