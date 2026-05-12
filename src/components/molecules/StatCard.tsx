import { cn } from "@/lib/utils";

export interface StatCardProps {
  value: string;
  valueAccent?: string;
  accentColor?: string;
  label: string;
  className?: string;
}

const StatCard = ({
  value,
  valueAccent,
  accentColor = "text-primary",
  label,
  className,
}: StatCardProps) => (
  <div className={cn("space-y-2", className)}>
    <p className="font-label text-4xl font-bold tracking-tighter">
      {value}
      {valueAccent && (
        <span className={accentColor}>{valueAccent}</span>
      )}
    </p>
    <p className="text-xs uppercase font-bold tracking-[0.2em] text-on-surface-variant">
      {label}
    </p>
  </div>
);

export { StatCard };
