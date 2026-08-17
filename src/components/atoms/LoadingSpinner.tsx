import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  sublabel?: string;
  backdrop?: boolean;
  card?: boolean;
  variant?: "primary" | "secondary" | "blue" | "purple" | "accent";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const variantClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  blue: "text-blue-500",
  purple: "text-purple-500",
  accent: "text-accent",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  sublabel,
  backdrop = true,
  card = true,
  variant = "primary",
  className,
}) => {
  const spinnerInner = (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Loader2
        className={cn(
          "animate-spin shrink-0 transition-all duration-300",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold text-on-surface tracking-tight">{label}</p>
          {sublabel && (
            <p className="text-xs text-on-surface-variant max-w-xs">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );

  const cardBox = (
    <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-xl flex flex-col items-center min-w-[280px] animate-in fade-in duration-200">
      {spinnerInner}
    </div>
  );

  if (backdrop) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
        {cardBox}
      </div>
    );
  }

  if (card) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        {cardBox}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      {spinnerInner}
    </div>
  );
};
