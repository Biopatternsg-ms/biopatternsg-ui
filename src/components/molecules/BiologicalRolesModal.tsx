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
import {
  X,
  Search,
  Dna,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { experimentService } from "@/services/experimentService";
import type { InferenceResponse } from "@/services/models/Experiment";
import { CATEGORY_STYLES, CATEGORY_KEYS } from "@/config/biologicalCategories";

export interface BiologicalRolesModalProps {
  open: boolean;
  onClose: () => void;
  pipelineId: string;
  experimentName?: string;
  restrictionLevel?: string;
}

export const BiologicalRolesModal: React.FC<BiologicalRolesModalProps> = ({
  open,
  onClose,
  pipelineId,
  experimentName,
  restrictionLevel = "VERY_RESTRICTED",
}) => {
  const [loading, setLoading] = React.useState(true);
  const [inferenceData, setInferenceData] = React.useState<InferenceResponse | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = React.useState<string>("ALL");

  // Prevent background scrolling
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape keypress
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Load inference data from backend
  React.useEffect(() => {
    if (!open || !pipelineId) return;

    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const data = await experimentService.getInferenceByPipelineId(pipelineId);
        if (!ignore) {
          setInferenceData(data);
        }
      } catch (err) {
        console.error("Failed loading inference roles", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [open, pipelineId]);

  if (!open) return null;

  const rolesMap = inferenceData?.roles || {};
  const allSymbols = Object.keys(rolesMap);

  const getEntityActiveRoles = (symbol: string): string[] => {
    const val = rolesMap[symbol];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return Object.keys(val).filter((k) => !!(val as unknown as Record<string, boolean>)[k]);
  };

  // Filtered symbols based on search & category pill
  const filteredSymbols = allSymbols.filter((symbol) => {
    const symbolMatches = symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const activeRoles = getEntityActiveRoles(symbol);

    const categoryMatchesSearch = activeRoles.some(
      (cat) =>
        (CATEGORY_STYLES[cat]?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesSearch = symbolMatches || categoryMatchesSearch;

    if (!matchesSearch) return false;

    if (selectedFilterCategory === "ALL") return true;

    return activeRoles.includes(selectedFilterCategory);
  });

  // Calculate stats
  const totalEntities = allSymbols.length;
  const entitiesWithActiveRoles = allSymbols.filter((sym) => getEntityActiveRoles(sym).length > 0).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      {/* Semi-transparent backdrop with blur */}
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity duration-300" />

      {/* Modal card content */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col",
          "glass-panel bg-surface rounded-3xl",
          "border border-outline-variant/20 shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        )}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-outline-variant/15 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline text-lg sm:text-xl font-black text-on-surface tracking-tight">
                  Biological Roles Classification
                </h2>
                <Badge variant="primary" className="text-[9px] px-2 py-0.5">
                  {restrictionLevel}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                MeSH Ontology classification for entities in {experimentName ? `"${experimentName}"` : `Pipeline ${pipelineId}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface transition-colors rounded-xl p-2 hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <LoadingSpinner
                backdrop={false}
                card={false}
                size="lg"
                variant="primary"
                label="Loading biological roles..."
              />
            </div>
          ) : totalEntities === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-on-surface-variant/60 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">No Roles Discovered Yet</h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                No biological roles have been recorded for this pipeline yet. The step may still be running, or role discovery was deferred for this restriction level.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
                  <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                    Total Evaluated Entities
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-2xl font-black text-on-surface">{totalEntities}</span>
                    <span className="text-[11px] text-on-surface-variant">aligned objects</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
                  <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                    Entities with MeSH Roles
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {entitiesWithActiveRoles}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">classified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
                  <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                    Classification Coverage
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-2xl font-black text-primary">
                      {totalEntities > 0 ? Math.round((entitiesWithActiveRoles / totalEntities) * 100) : 0}%
                    </span>
                    <span className="text-[11px] text-on-surface-variant">of aligned objects</span>
                  </div>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low/70 p-3 rounded-2xl border border-outline-variant/15">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by gene symbol or role..."
                    className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/20 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                  <button
                    onClick={() => setSelectedFilterCategory("ALL")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border",
                      selectedFilterCategory === "ALL"
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface text-on-surface-variant hover:bg-surface-container-high border-outline-variant/20"
                    )}
                  >
                    All ({allSymbols.length})
                  </button>
                  {CATEGORY_KEYS.map((catKey) => {
                    const count = allSymbols.filter((sym) => getEntityActiveRoles(sym).includes(catKey)).length;
                    const style = CATEGORY_STYLES[catKey];
                    const isSelected = selectedFilterCategory === catKey;

                    return (
                      <button
                        key={catKey}
                        onClick={() => setSelectedFilterCategory(catKey)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border flex items-center gap-1",
                          isSelected
                            ? "bg-primary text-on-primary border-primary shadow-sm"
                            : `${style.bg} ${style.text} ${style.border} hover:opacity-80`
                        )}
                      >
                        <span>{style.label}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Entities Roles Table / Cards */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium px-2">
                  <span>Showing {filteredSymbols.length} of {totalEntities} entities</span>
                  {selectedFilterCategory !== "ALL" && (
                    <span>Filtered by: {CATEGORY_STYLES[selectedFilterCategory]?.label}</span>
                  )}
                </div>

                {filteredSymbols.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-2 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10">
                    <p className="text-xs text-on-surface-variant">No entities matched your search or category filter.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/10 border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface">
                    {filteredSymbols.map((symbol) => {
                      const activeCategories = getEntityActiveRoles(symbol);

                      return (
                        <div
                          key={symbol}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-4 gap-2.5 hover:bg-surface-container-low/40 transition-colors"
                        >
                          {/* Symbol Column */}
                          <div className="flex items-center gap-2.5 min-w-[140px]">
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            <code className="font-mono font-bold text-sm text-on-surface tracking-tight select-all">
                              {symbol}
                            </code>
                          </div>

                          {/* Categories Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap flex-1 sm:justify-end">
                            {activeCategories.length > 0 ? (
                              activeCategories.map((catKey) => {
                                const style = CATEGORY_STYLES[catKey];
                                return (
                                  <span
                                    key={catKey}
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                                      style.bg,
                                      style.text,
                                      style.border
                                    )}
                                  >
                                    {style.label}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[11px] text-on-surface-variant/50 italic px-2 py-0.5">
                                No active MeSH category detected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-outline-variant/15 flex justify-end bg-surface-container-low/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors border border-outline-variant/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
