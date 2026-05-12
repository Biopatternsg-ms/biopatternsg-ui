import { cn } from "@/lib/utils";

export interface BenefitCardProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Benefit / feature card used in the 3-column grid.
 * "No-Line" rule: bg depth used for visual separation.
 */
const BenefitCard = ({ title, description, className }: BenefitCardProps) => (
  <div
    className={cn(
      "p-8 rounded-xl bg-surface-container-high/30 space-y-4",
      className
    )}
  >
    <h4 className="font-bold text-lg">{title}</h4>
    <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
  </div>
);

export { BenefitCard };
