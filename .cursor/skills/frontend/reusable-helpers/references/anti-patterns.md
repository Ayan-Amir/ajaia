# Reusable Helpers — Anti-Patterns

## Importing from Individual Files Instead of the Barrel

```typescript
// ❌ Bypasses the barrel — fragile, breaks if files are reorganised
import { formatDate } from "@/utils/date";
import { truncate } from "@/utils/string";

// ✅ Always import from the barrel
import { formatDate, truncate } from "@/utils";
```

---

## Inline Helpers Inside Components

```typescript
// ❌ Inline helper — cannot be reused, not tested, duplicated across files
function ProductCard({ product }) {
  const formatted = product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return <span>${formatted}</span>;
}

// ✅ Use the util — consistent, tested, readable
import { formatCurrency } from "@/utils";
<span>{formatCurrency(product.price)}</span>
```

---

## Using a Third-Party Library When a Pure Helper Exists

```typescript
// ❌ Importing lodash for something already in utils
import { groupBy } from "lodash";

// ✅ Use the pure TypeScript version in utils
import { groupBy } from "@/utils";
```

---

## Writing Helpers Without JSDoc @example

```typescript
// ❌ No documentation — caller cannot know input/output without reading the body
export function slugify(str: string): string { ... }

// ✅ Always include @example showing concrete input → output
/**
 * Convert a string to a URL-safe slug.
 * @example slugify("Hello World!") // "hello-world"
 */
export function slugify(str: string): string { ... }
```

---

## Using any Instead of Generics

```typescript
// ❌ Loses type safety — caller gets `any` back
export function groupBy(array: any[], key: string): Record<string, any[]> { ... }

// ✅ Typed with generic
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> { ... }
```

---

## Putting Component Logic in utils

```typescript
// ❌ React dependency in a utility — not reusable outside React, not testable as a pure fn
export function useFormattedDate(date: string) {
  const [formatted, setFormatted] = useState(formatDate(date));
  useEffect(() => { setFormatted(formatDate(date)); }, [date]);
  return formatted;
}

// ✅ Keep pure transform in utils — wrap in a hook only if React state is truly needed
// In most cases just call formatDate(date) directly in the component
import { formatDate } from "@/utils";
const formatted = formatDate(date, "short");
```

---

## Writing a Zod Schema in validation.ts

```typescript
// ❌ Zod schemas do not belong in utils/validation.ts
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

// ✅ Zod schemas live in src/validation/ — use the validation-schemas skill
// utils/validation.ts is for lightweight boolean/string helpers only (isEmail, validateRequired)
```

---

## Forgetting to Export from the Barrel

```typescript
// ❌ Added helper to src/utils/string.ts but forgot to add to index.ts
// Result: import { myHelper } from "@/utils" silently fails

// ✅ Add every new domain file and every new named export to src/utils/index.ts
export * from "./string"; // ensures myHelper is accessible via @/utils
```
