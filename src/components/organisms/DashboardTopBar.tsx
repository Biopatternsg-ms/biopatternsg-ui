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
import { Search, Bell, HelpCircle } from "lucide-react";
import { UserMenu } from "@/components/molecules/UserMenu";

const DashboardTopBar = () => {
  return (
    <header className="h-16 w-full sticky top-0 z-40 glass-nav flex justify-between items-center px-8 shadow-nav border-b border-outline-variant/15">
      {/* Mobile Brand (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2">
        <span className="text-primary-container font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 2v7.31" />
            <path d="M14 9.3V1.99" />
            <path d="M8.5 2h7" />
            <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            <path d="M5.52 16h12.96" />
          </svg>
        </span>
        <span className="font-headline text-[18px] font-bold text-on-surface tracking-tight">
          Biopatternsg
        </span>
      </div>

      {/* Desktop Breadcrumb / Context */}
      <div className="hidden md:block">
        <span className="font-headline text-[20px] font-bold text-primary-container tracking-tight">
          -
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-[18px] h-[18px]" />
          <input
            className="pl-10 pr-4 py-2 w-64 bg-surface-container-low text-on-surface font-body text-sm rounded-full border-none focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-outline-variant outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-primary transition-all p-1">
            <Bell className="w-5 h-5" />
          </button>
          <button className="hover:text-primary transition-all p-1">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <UserMenu />
      </div>
    </header>
  );
};

export { DashboardTopBar };
