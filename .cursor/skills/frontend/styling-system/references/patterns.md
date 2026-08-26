# Styling Patterns

## Token Definition (index.css)
All new visual values must be added here first as semantic tokens before being used in any component:

```css
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --color-primary-foreground: #ffffff;
  --color-destructive: #ef4444;
  --radius-md: 0.375rem;
  --spacing-section: 2rem;
}
```

This is why `tailwind.config.ts` is banned - token mapping now lives here.

## Class Composition Pattern
Always route class composition through a shared helper placed in `src/utils/cn.ts` or `src/lib/cn.ts`.
Do not place `cn.ts` under `src/services/` because that folder is reserved for API/data-layer concerns.

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## CVA Variant Pattern
Always define reusable component states using CVA with `defaultVariants` set:

```ts
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> & { className?: string };

const buttonClassName = ({ className, size, variant }: ButtonProps): string =>
  cn(buttonVariants({ size, variant }), className);
```

Rules:
- Always set `defaultVariants` - never leave variant defaults undefined.
- Never duplicate CVA logic between parent and child components.
- Always extend existing variants before creating new ones.

## Responsive Utility Pattern
- Build mobile-first with base utilities first.
- Add `sm`, `md`, `lg`, `xl`, `2xl` overrides only where required.
- Keep responsive changes in one component-level class contract.

## Naming Conventions
- Token names: kebab-case semantic names - `--color-primary`, `--radius-md`, `--spacing-section`.
- Never use visual names for tokens - `--color-blue` is wrong, `--color-primary` is correct.
- CVA variant keys: camelCase - `defaultSize`, `primaryVariant`.
- Breakpoint names: match Tailwind defaults - `sm`, `md`, `lg`, `xl`, `2xl`.
- Component files in `ui/`: PascalCase - `Button.tsx`, `InputField.tsx`.

## Cross-Skill Boundary Notes
When a styling task touches these areas, defer to owner skills:
- TanStack Query hooks -> `api-integration-data-layer`
- `queryClient.ts` / logger / Sentry -> `logging-monitoring`
- ErrorBoundary implementation -> `error-boundaries`
- RHF defaults (for example `onBlur`) -> `validation-schemas`
- Auth context -> `react-state-management`
- Auth types file location -> `type-definitions`
- Folder naming conventions -> `routing-navigation`
