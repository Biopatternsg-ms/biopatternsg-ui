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
import { Network, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import biologo from "@/assets/biologo.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchPath?: string;
}

const navItems: NavItem[] = [
  { label: "Redes", href: "/dashboard/network", icon: Network },
  { label: "Experimentos", href: "/dashboard/experiments", matchPath: "/dashboard/experiments", icon: Microscope },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-section p-6 gap-8 shadow-nav z-50">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 w-full">
        <img
          src={biologo}
          alt="Biopatternsg Logo"
          className="w-10 h-10 object-contain drop-shadow-md"
        />
        <div className="flex flex-col">
          <h1 className="font-headline text-[18px] font-bold text-on-surface tracking-tighter leading-tight">
            Biopatterns
          </h1>
          <span className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase">
            Clinical Lens
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const isActive =
            (item.href !== "#" && location.pathname.startsWith(item.href)) ||
            (!!item.matchPath && location.pathname.startsWith(item.matchPath));
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.href !== "#") navigate(item.href);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant transition-all duration-300 group",
                isActive
                  ? "text-primary font-bold bg-primary-fixed/40"
                  : "hover:bg-surface-container/70 hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )}
              />
              <span className="font-body text-[14px] font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* System Status */}
      <div className="bg-surface-container-lowest rounded-xl p-4">
        <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant font-bold block mb-2">
          System Status
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
          <span className="font-body text-[13px] text-on-surface font-medium">
            Core API: Stable
          </span>
        </div>
      </div>
    </nav>
  );
};

export { Sidebar };
