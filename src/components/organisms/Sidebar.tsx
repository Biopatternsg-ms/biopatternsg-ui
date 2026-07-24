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
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getRoleConfig } from "@/config/roles";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { navItems } = getRoleConfig(userRole);
  const { isCollapsed, isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      <nav
        className={cn(
          "flex flex-col h-screen fixed left-0 top-0 bg-[#eef3ff] z-50 transition-all duration-300",
          isCollapsed ? "md:w-20 md:p-4 md:gap-6" : "md:w-64 md:p-6 md:gap-8",
          isMobileOpen ? "w-64 p-6 gap-8 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="w-full flex justify-center pb-4">
          <img
            src={logo}
            alt="Biopatternsg Logo"
            className="w-10 h-10 object-cover rounded-full drop-shadow-md"
          />
        </div>
      ) : (
        <div className="-mx-6 -mt-6 mb-2 overflow-hidden">
          <img
            src={logo}
            alt="Biopatternsg Logo"
            className="w-full h-auto object-contain"
          />
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex flex-col gap-1.5 flex-1 mt-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.href
            : (item.href !== "#" && location.pathname.startsWith(item.href)) ||
              (!!item.matchPath && location.pathname.startsWith(item.matchPath));
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.href !== "#") navigate(item.href);
              }}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg transition-all duration-300 group",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-primary text-on-primary font-bold shadow-md"
                  : "text-on-surface-variant hover:bg-black/5 hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors duration-300 flex-shrink-0",
                  isActive ? "text-on-primary" : "group-hover:text-primary"
                )}
              />
              <span
                className={cn(
                  "font-body text-[14px] transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isActive ? "font-bold" : "font-medium",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
};

export { Sidebar };
