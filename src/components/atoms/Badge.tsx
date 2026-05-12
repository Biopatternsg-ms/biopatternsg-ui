import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-label font-bold uppercase transition-colors",
  {
    variants: {
      variant: {
        // Tertiary / success tone
        success:
          "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] tracking-widest",
        // Neutral surface
        neutral:
          "px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] tracking-widest",
        // Primary accent
        primary:
          "px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] tracking-widest",
        // Live pulse badge
        live:
          "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] tracking-[0.3em]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, className }))} {...props} />
);

export { Badge, badgeVariants };
