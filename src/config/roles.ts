import { type LucideIcon, Network, Microscope, Users } from "lucide-react";

export type AppRole = "admin" | "admin-user" | "researcher";

export interface RoleNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPath?: string;
  exact?: boolean;
}

export interface RoleConfig {
  homePath: string;
  navItems: RoleNavItem[];
  allowedRoutes: readonly string[];
}

const NAV_USERS: RoleNavItem = {
  label: "Usuarios", href: "/dashboard/admin/users", icon: Users,
};
/*const NAV_CREATE_USER: RoleNavItem = {
  label: "Crear Usuario", href: "/dashboard/admin/create-user", icon: UserPlus,
};*/
const NAV_NETWORKS: RoleNavItem = {
  label: "Redes", href: "/dashboard/network", icon: Network,
};
const NAV_EXPERIMENTS: RoleNavItem = {
  label: "Experimentos", href: "/dashboard/experiments",
  matchPath: "/dashboard/experiments", icon: Microscope,
};

export const ROLE_CONFIGS: Record<AppRole, RoleConfig> = {
  admin: {
    homePath: "/dashboard/admin/users",
    navItems: [NAV_USERS, NAV_NETWORKS, NAV_EXPERIMENTS],
    allowedRoutes: ["/dashboard/admin", "/dashboard/network", "/dashboard/experiments"],
  },
  "admin-user": {
    homePath: "/dashboard/admin/users",
    navItems: [NAV_USERS],
    allowedRoutes: ["/dashboard/admin"],
  },
  researcher: {
    homePath: "/dashboard/network",
    navItems: [NAV_NETWORKS, NAV_EXPERIMENTS],
    allowedRoutes: ["/dashboard/network", "/dashboard/experiments"],
  },
};

export const DEFAULT_ROLE: AppRole = "researcher";

const VALID_APP_ROLES = new Set<string>(Object.keys(ROLE_CONFIGS));

export function getRoleConfig(role: string | undefined | null): RoleConfig {
  if (role && role in ROLE_CONFIGS) return ROLE_CONFIGS[role as AppRole];
  return ROLE_CONFIGS[DEFAULT_ROLE];
}

export function isRouteAllowedForRole(path: string, role: string | undefined | null): boolean {
  const config = getRoleConfig(role);
  return config.allowedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

export function extractAppRole(jwtRoles: string[] | undefined | null): string | null {
  if (!jwtRoles || jwtRoles.length === 0) return null;
  return jwtRoles.find((r) => VALID_APP_ROLES.has(r)) ?? null;
}
