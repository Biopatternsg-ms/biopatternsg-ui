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
import { Menu, Bell, HelpCircle } from "lucide-react";
import { UserMenu } from "@/components/molecules/UserMenu";
import { useSidebar } from "@/context/SidebarContext";

interface TopBarProps {
  /** The breadcrumb title shown on desktop, e.g. "Dashboard" */
  title?: string;
}

const TopBar = ({ title = "Dashboard" }: TopBarProps) => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-surface flex justify-between items-center px-8">
      {/* Mobile hamburger + Brand (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="text-on-surface-variant hover:text-primary transition-colors p-1"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-headline text-[18px] font-black text-primary tracking-tighter">
          {title}
        </span>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-on-surface-variant hover:text-primary transition-colors p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-headline text-[22px] font-black text-primary tracking-tighter">
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {/* Icons */}
        <div className="hidden flex items-center gap-3 text-on-surface-variant">
          <button className="hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-surface-container-low">
            <Bell className="w-5 h-5" />
          </button>
          <button className="hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-surface-container-low">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <UserMenu />
      </div>
    </header>
  );
};

export { TopBar };
