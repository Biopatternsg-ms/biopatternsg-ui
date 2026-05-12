import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary: gradient per "Glass & Gradient" rule
        primary:
          "pulse-gradient text-white shadow-md hover:shadow-primary-glow font-bold",
        // Ghost: no hard border, hover changes bg
        ghost:
          "text-on-surface hover:bg-surface-container-low font-medium",
        // Surface: fills with surface color
        surface:
          "bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest",
        // Outline variant: glass border rule (outline-variant at 15%)
        outline:
          "bg-primary-container/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 font-bold",
        // Link style
        link:
          "text-primary font-bold hover:underline decoration-2 underline-offset-4",
        // Destructive
        destructive:
          "bg-error text-on-error hover:opacity-90 font-bold",
      },
      size: {
        sm: "px-4 py-2 text-xs rounded-lg",
        md: "px-5 py-2 text-sm rounded-lg",
        lg: "px-8 py-4 text-sm rounded-xl",
        xl: "px-10 py-5 text-lg rounded-2xl font-black",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
