import * as React from "react";
import { cn } from "@/lib/utils";

export interface BentoFeatureCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  badgesTop?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Large bento feature card (e.g. the Sequence Mapping card).
 * "No-Line" rule: separation done via bg-surface-container-lowest
 * and ambient shadow, no 1px border.
 */
const BentoFeatureCard = ({
  icon,
  iconBg = "bg-primary-fixed",
  title,
  subtitle,
  badgesTop,
  children,
  className,
}: BentoFeatureCardProps) => (
  <div
    className={cn(
      "bg-surface-container-lowest rounded-2xl p-8 flex flex-col group overflow-hidden relative",
      "shadow-ambient hover:shadow-ambient-md transition-shadow duration-300",
      className
    )}
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          {subtitle && (
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {badgesTop && <div className="flex gap-2">{badgesTop}</div>}
    </div>
    {children}
  </div>
);

export { BentoFeatureCard };
