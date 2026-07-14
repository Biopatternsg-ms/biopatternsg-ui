/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    navItems: [NAV_USERS, NAV_NETWORKS, NAV_EXPERIMENTS],
    allowedRoutes: ["/dashboard/admin", "/dashboard/network", "/dashboard/experiments"],
  },
  researcher: {
    homePath: "/dashboard/network",
    navItems: [NAV_NETWORKS, NAV_EXPERIMENTS],
    allowedRoutes: ["/dashboard/network", "/dashboard/experiments"],
  },
};

export const DEFAULT_ROLE: AppRole = "researcher";

const VALID_APP_ROLES = new Set<string>(Object.keys(ROLE_CONFIGS));

/**
 * Role precedence used when the JWT contains more than one recognized role.
 * Higher index means higher priority: admin > admin-user > researcher.
 */
const ROLE_PRECEDENCE: AppRole[] = ["researcher", "admin-user", "admin"];

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

/**
 * Extracts the platform role from the JWT realm_access.roles claim.
 *
 * If multiple recognized roles are present, the one with the highest
 * precedence is returned (admin > admin-user > researcher).
 * Returns null when no recognized role is found.
 */
export function extractAppRole(jwtRoles: string[] | undefined | null): string | null {
  if (!jwtRoles || jwtRoles.length === 0) return null;

  const recognized = jwtRoles.filter((r) => VALID_APP_ROLES.has(r));
  if (recognized.length === 0) return null;

  for (let i = ROLE_PRECEDENCE.length - 1; i >= 0; i--) {
    if (recognized.includes(ROLE_PRECEDENCE[i])) {
      return ROLE_PRECEDENCE[i];
    }
  }

  return null;
}
