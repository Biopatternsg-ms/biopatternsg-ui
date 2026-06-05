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
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "@/components/atoms/NavLink";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Research", href: "#" },
  { label: "Sequencing", href: "#" },
  { label: "Datasets", href: "#" },
];

/**
 * PublicHeader Organism.
 *
 * Shared top navigation bar for all public views (landing, login, register,
 * recovery). The right-side action area is provided by the caller through
 * the `actions` slot, so each view can plug in its own buttons (or wrap
 * them in an `invisible` placeholder when the current page already exposes
 * that action).
 *
 *   - "Glass & Gradient" rule: backdrop-blur-xl + semi-transparent bg.
 *   - "No-Line" rule: separator done via a surface-colored 1px div.
 *   - Active state indicator: Home is marked active only when on "/".
 *
 * Usage:
 *   <PublicHeader
 *     actions={
 *       <>
 *         <Button variant="ghost" onClick={() => navigate("/login")}>Sign In</Button>
 *         <Button variant="primary" onClick={() => navigate("/register")}>Register</Button>
 *       </>
 *     }
 *   />
 */
export interface PublicHeaderProps {
  /** Right-side actions (buttons, menus, user widget, etc.). */
  actions: React.ReactNode;
}

const PublicHeader = ({ actions }: PublicHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-nav">
      <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo — behaves as an interactive home trigger */}
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-black tracking-tighter text-primary hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-1.5"
          aria-label="Ir a la página de inicio"
        >
          Biopatternsg
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8 font-headline tracking-tight font-medium text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              active={item.href === "/" && location.pathname === "/"}
              onClick={(e) => {
                if (item.href === "/") {
                  e.preventDefault();
                  navigate("/");
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Actions (caller-provided slot) */}
        <div className="flex items-center space-x-4">{actions}</div>
      </div>

      {/* "No-Line" separator: bg change instead of border */}
      <div className="bg-surface-container-low h-[1px] w-full" />
    </nav>
  );
};

export { PublicHeader };
