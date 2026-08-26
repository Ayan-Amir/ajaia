import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const componentVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        neutral: "bg-muted text-muted-foreground hover:bg-slate-300",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
    },
  },
);

export interface ComponentProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof componentVariants> {}

export const Component = React.forwardRef<HTMLButtonElement, ComponentProps>(
  ({ className, tone, size, ...props }, ref) => {
    return <button ref={ref} className={cn(componentVariants({ tone, size }), className)} {...props} />;
  },
);

Component.displayName = "Component";
