# Reusable Helpers — Number & Array Utilities

## number.ts — `src/utils/number.ts`

```typescript
/**
 * Format a number as currency using the browser's Intl API.
 * @example formatCurrency(1234.5) // "$1,234.50"
 * @example formatCurrency(1234.5, "EUR", "de-DE") // "1.234,50 €"
 */
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

/**
 * Format a large number with compact notation.
 * @example formatCompact(1500000) // "1.5M"
 * @example formatCompact(3200) // "3.2K"
 */
export function formatCompact(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/**
 * Clamp a number between min and max.
 * @example clamp(150, 0, 100) // 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to N decimal places.
 * @example roundTo(3.14159, 2) // 3.14
 */
export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate what percentage `part` is of `total`.
 * @example percentage(25, 200) // 12.5
 */
export function percentage(part: number, total: number, decimals = 1): number {
  if (total === 0) return 0;
  return roundTo((part / total) * 100, decimals);
}

/**
 * Format bytes into a human-readable size string.
 * @example formatBytes(1048576) // "1 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
```

---

## array.ts — `src/utils/array.ts`

```typescript
/**
 * Group an array of objects by a key.
 * @example groupBy(users, "role") // { admin: [...], user: [...] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const group = String(item[key]);
    return { ...acc, [group]: [...(acc[group] ?? []), item] };
  }, {} as Record<string, T[]>);
}

/**
 * Pick specific keys from an object.
 * @example pick(user, ["id", "name"]) // { id: 1, name: "Ali" }
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {} as Pick<T, K>);
}

/**
 * Omit specific keys from an object.
 * @example omit(user, ["password"]) // user without password
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
}

/**
 * Remove duplicate primitive values from an array.
 * @example unique([1, 2, 2, 3]) // [1, 2, 3]
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicate objects by a key.
 * @example uniqueBy(users, "id")
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Sort an array of objects by a key, ascending or descending.
 * @example sortBy(users, "name") // alphabetical ascending
 * @example sortBy(users, "createdAt", "desc")
 */
export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === "asc" ? -1 : 1;
    if (a[key] > b[key]) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Split an array into smaller arrays of a given size.
 * @example chunk([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

/**
 * Flatten a nested array one level deep.
 * @example flattenOnce([[1,2],[3,4]]) // [1,2,3,4]
 */
export function flattenOnce<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array);
}
```
