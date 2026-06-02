import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  initials?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const Avatar = ({ initials, size = "md" }: AvatarProps) => (
  <div
    className={cn(
      "rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center",
      sizeClasses[size]
    )}
    aria-label={initials ? `Avatar: ${initials}` : "User avatar"}
  >
    {initials ? (
      initials.slice(0, 2).toUpperCase()
    ) : (
      <User className="w-4 h-4" />
    )}
  </div>
);

export { Avatar };
