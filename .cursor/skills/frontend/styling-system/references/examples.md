# Complete Working Examples

## Example A: Token + Button Variant Setup

`src/index.css`
```css
@import "tailwindcss";

@theme {
  --color-primary: #0284c7;
  --color-primary-foreground: #f0f9ff;
  --color-muted: #e2e8f0;
  --color-muted-foreground: #0f172a;
  --radius-md: 0.5rem;
}
```

`src/utils/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`src/components/ui/Button.tsx`
```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-muted text-muted-foreground hover:bg-slate-300",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);

Button.displayName = "Button";
```

## Example B: Responsive Card Grid

`src/components/ui/ProductGrid.tsx`
```tsx
import { type ReactNode } from "react";

type ProductGridProps = {
  children: ReactNode;
};

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
```

## Example C: Using Template Component

`src/features/catalog/CatalogPage.tsx`
```tsx
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/ui/ProductGrid";

export function CatalogPage() {
  return (
    <main className="bg-surface text-surface-foreground">
      <ProductGrid>
        <article className="rounded-md border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Starter Pack</h2>
          <p className="mt-2 text-sm text-slate-600">Token-driven card with mobile-first spacing.</p>
          <Button className="mt-4" size="sm" variant="primary">
            Add to cart
          </Button>
        </article>
      </ProductGrid>
    </main>
  );
}
```
