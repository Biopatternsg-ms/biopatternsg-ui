import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // "No-Line" rule: no border, use background depth instead
          "w-full bg-surface-container-high border-none rounded-lg px-4 py-3",
          "text-on-surface placeholder:text-outline/50 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
