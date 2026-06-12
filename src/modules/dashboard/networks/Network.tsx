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
import { Network as NetworkIcon, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Sidebar } from "@/components/organisms/Sidebar";
import { DashboardTopBar } from "@/components/organisms/DashboardTopBar";
import { NetworksTable } from "@/components/organisms/NetworksTable";

/**
 * Network management view.
 *
 * Displays a list of biological neural networks with options to
 * integrate or create new ones. Follows the "Clinical Lens" design
 * system with sidebar + top bar layout.
 */
const Network = () => {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex overflow-x-hidden">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-surface-base">
        {/* Top Bar */}
        <DashboardTopBar title="Dashboard" />

        {/* Page Canvas */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
          {/* Page Header: Title, Description & Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left: Icon + Title + Description */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <NetworkIcon className="text-primary-container w-7 h-7" />
                <h2 className="font-headline text-2xl font-semibold text-on-surface tracking-tighter">
                  Redes
                </h2>
              </div>
              <p className="text-on-surface-variant font-body text-sm max-w-lg leading-relaxed">
                Manage and integrate biological neural networks for clinical
                simulation and pattern analysis.
              </p>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                className="rounded-[1rem] gap-2 text-primary font-semibold hover:bg-primary-fixed/30 transition-all"
              >
                <NetworkIcon className="w-[18px] h-[18px]" />
                Integrar red
              </Button>
              <Button
                variant="primary"
                size="md"
                className="rounded-[1rem] hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-[18px] h-[18px]" />
                Crear red
              </Button>
            </div>
          </div>

          {/* Networks Data Table */}
          <NetworksTable />
        </div>
      </main>
    </div>
  );
};

export default Network;
