import * as React from "react";
import { cn } from "@/lib/utils";

export interface BentoSideCardProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Smaller bento grid card (right column items).
 * "No-Line" rule: uses bg-surface-container-lowest + ambient shadow.
 */
const BentoSideCard = ({
  icon,
  iconColor = "text-tertiary",
  title,
  description,
  footer,
  className,
}: BentoSideCardProps) => (
  <div
    className={cn(
      "bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between",
      "shadow-ambient hover:shadow-ambient-md transition-shadow duration-300",
      className
    )}
  >
    <div>
      <div className={cn("mb-4", iconColor)}>{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
    </div>
    {footer && (
      <div className="mt-4 pt-4 border-t border-outline-variant/15">
        {footer}
      </div>
    )}
  </div>
);

export { BentoSideCard };
