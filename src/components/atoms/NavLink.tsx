import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, active = false, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "font-body tracking-tight font-medium text-sm transition-all duration-300",
        active
          ? "text-primary border-b-2 border-primary pb-1"
          : "text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
      ,
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
);
NavLink.displayName = "NavLink";

export { NavLink };
