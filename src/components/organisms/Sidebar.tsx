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
import { LayoutDashboard, Network, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import biologo from "@/assets/biologo.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Redes", href: "/network", icon: Network },
  { label: "Experimentos", href: "#", icon: Microscope },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface p-6 gap-8 shadow-nav z-50 border-r border-outline-variant/15">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline-variant/15 w-full">
        <img 
          src={biologo} 
          alt="Biopatternsg Logo" 
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <h1 className="font-headline text-[20px] font-bold text-primary tracking-tight">
          Biopatternsg
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href !== "#" && location.pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.href !== "#") navigate(item.href);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant transition-all group",
                isActive
                  ? "text-primary-container font-bold bg-surface-container-highest scale-[0.98]"
                  : "hover:bg-surface-container hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary-container" : "group-hover:text-primary"
                )}
              />
              <span className="font-label text-[12px] tracking-widest uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { Sidebar };
