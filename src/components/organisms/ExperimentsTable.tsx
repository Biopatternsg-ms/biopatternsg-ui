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
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";

interface ExperimentRow {
  id: number;
  name: string;
  network: string;
  createdAt: string;
  summary: string;
  status: "new" | "in-progress" | "completed";
}

const mockExperiments: ExperimentRow[] = [
  { id: 1, name: "Experimento 1", network: "Red 1", createdAt: "10/07/2023", summary: "Resumen", status: "new" },
  { id: 2, name: "Experimento 2", network: "Red 2", createdAt: "10/07/2023", summary: "Resumen", status: "new" },
  { id: 3, name: "Experimento 3", network: "Red 3", createdAt: "10/07/2023", summary: "Resumen", status: "in-progress" },
  { id: 4, name: "...", network: "...", createdAt: "...", summary: "", status: "in-progress" },
  { id: 5, name: "...", network: "...", createdAt: "...", summary: "", status: "completed" },
  { id: 6, name: "...", network: "...", createdAt: "...", summary: "", status: "completed" },
];

const statusBadgeMap: Record<ExperimentRow["status"], { label: string; variant: "new" | "inProgress" | "completed" }> = {
  new: { label: "Nuevo", variant: "new" },
  "in-progress": { label: "En progreso", variant: "inProgress" },
  completed: { label: "Completado", variant: "completed" },
};

const ExperimentsTable = () => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const allSelected = selected.size === mockExperiments.length && mockExperiments.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(mockExperiments.map((e) => e.id)));
    }
  };

  const toggleRow = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient border border-outline-variant/15">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low font-label text-[12px] tracking-widest uppercase text-on-surface-variant border-b border-outline-variant/15">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 bg-surface w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="col-span-3">Experimento</div>
        <div className="col-span-2">Red</div>
        <div className="col-span-2">Creación experimento</div>
        <div className="col-span-2">Resumen</div>
        <div className="col-span-1 text-center">Estado</div>
        <div className="col-span-1 text-right">Ver más</div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {mockExperiments.map((exp) => (
          <div
            key={exp.id}
            className={cn(
              "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors border-b border-surface-container/50 font-body text-sm",
              "hover:bg-surface-container-high"
            )}
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selected.has(exp.id)}
                onChange={() => toggleRow(exp.id)}
                className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 bg-surface w-4 h-4 cursor-pointer"
              />
            </div>
            <div className={cn("col-span-3 font-semibold text-on-surface", exp.name === "..." && "text-outline")}>
              {exp.name}
            </div>
            <div className={cn("col-span-2 text-on-surface-variant", exp.network === "..." && "text-outline")}>
              {exp.network}
            </div>
            <div className={cn("col-span-2 text-on-surface-variant", exp.createdAt === "..." && "text-outline")}>
              {exp.createdAt}
            </div>
            <div className={cn("col-span-2", exp.summary ? "text-outline" : "text-outline")}>
              {exp.summary}
            </div>
            <div className="col-span-1 flex justify-center">
              <Badge variant={statusBadgeMap[exp.status].variant}>
                {statusBadgeMap[exp.status].label}
              </Badge>
            </div>
            <div className="col-span-1 flex justify-end">
              {exp.name !== "..." ? (
                <button className="text-outline hover:text-on-surface transition-colors p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              ) : (
                <span className="w-5 h-5" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ExperimentsTable };
export type { ExperimentRow };
