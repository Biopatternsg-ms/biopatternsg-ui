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
import { FlaskConical, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Sidebar } from "@/components/organisms/Sidebar";
import { DashboardTopBar } from "@/components/organisms/DashboardTopBar";
import { ExperimentsTable } from "@/components/organisms/ExperimentsTable";

const Dashboard = () => {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex overflow-x-hidden">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-surface-base">
        {/* Top Bar */}
        <DashboardTopBar />

        {/* Page Canvas */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
          {/* Page Header: Title & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="text-primary-container w-7 h-7" />
              <h2 className="font-headline text-2xl font-semibold text-on-surface tracking-tight">
                Experimentos
              </h2>
            </div>
            <Button
              variant="primary"
              size="md"
              className="rounded-[1rem] hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-[18px] h-[18px]" />
              Crear experimento
            </Button>
          </div>

          {/* Welcome / Stat Cards (re-estilizadas, contenido original) */}
          <section className="relative">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                Researcher Dashboard
              </span>
            </div>

            <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface text-center mb-6">
              Welcome, Researcher
            </h1>
            <p className="text-lg text-on-surface-variant text-center max-w-xl mx-auto mb-12">
              You have successfully accessed the Biopatternsg research platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-ambient-md">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Active Analyses
                </h3>
                <p className="text-3xl font-black text-primary">0</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-ambient-md">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Completed Sequences
                </h3>
                <p className="text-3xl font-black text-primary">0</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-ambient-md">
                <h3 className="font-bold font-headline text-on-surface mb-2">
                  Datasets Available
                </h3>
                <p className="text-3xl font-black text-primary">12</p>
              </div>
            </div>
          </section>

          {/* Experiments Data Table */}
          <ExperimentsTable />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
