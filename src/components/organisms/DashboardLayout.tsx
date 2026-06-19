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
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar } from "@/components/organisms/TopBar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex overflow-x-hidden">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", isCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64")}>
        {/* Top Bar */}
        <TopBar title="Dashboard" />

        {/* Dynamic Inner Page Content */}
        <Outlet />
      </main>
    </div>
  );
}
