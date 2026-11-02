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
  Route as RouteIcon,
  ArrowRight,
  GitBranch,
  Activity,
  Hash,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import type { GroupedPathway } from "@/services/models/Pathway";

const ROLE_COLORS: Record<string, string> = {
  ligand: "#0066ff",
  protein: "#ff6b35",
  enzyme: "#10b981",
  receptor: "#f59e0b",
  transcription_factor: "#ec4899",
  tf: "#ec4899",
  adaptor_protein: "#8b5cf6",
  disease: "#06b6d4",
  variant: "#ef4444",
  gene: "#14b8a6",
};

function getRoleColor(role?: string): string {
  if (!role) return "#94a3b8";
  const clean = role.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  return ROLE_COLORS[clean] || "#94a3b8";
}

function formatRoleName(role?: string): string {
  if (!role) return "Protein";
  const clean = role.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  switch (clean) {
    case "transcription_factor":
    case "tf":
      return "Transcription Factor";
    case "adaptor_protein":
      return "Adaptor Protein";
    default:
      return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}

export interface PathwayDetailModalProps {
  open: boolean;
  onClose: () => void;
  pathway: GroupedPathway | null;
  pathwayIndex?: number;
  experimentName?: string;
}

export const PathwayDetailModal: React.FC<PathwayDetailModalProps> = ({
  open,
  onClose,
  pathway,
  pathwayIndex,
  experimentName,
}) => {
  // Prevent background scrolling while modal is open
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

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !pathway) return null;

  // Fallback combinations if empty
  const combinations: string[][] =
    pathway.relationCombinations && pathway.relationCombinations.length > 0
      ? pathway.relationCombinations
      : [pathway.steps.map((s) => s.relations[0] || "association")];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] max-h-[92vh] flex flex-col",
          "glass-panel bg-surface rounded-3xl",
          "border border-outline-variant/20 shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        )}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-outline-variant/15 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
              <RouteIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {pathwayIndex !== undefined && (
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <Hash className="w-3 h-3" />
                    {pathwayIndex}
                  </span>
                )}
                <h2 className="font-headline text-lg sm:text-xl font-black text-on-surface tracking-tight">
                  {pathway.startObject} <span className="text-on-surface-variant font-normal">→</span> {pathway.endObject}
                </h2>
                <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                  {pathway.pathwaysCount.toLocaleString()} {pathway.pathwaysCount === 1 ? "Pathway" : "Pathways"}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Detailed causal transitions and signaling cascade {experimentName ? `for "${experimentName}"` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface transition-colors rounded-xl p-2 hover:bg-surface-container-high focus:outline-hidden focus:ring-2 focus:ring-primary/30 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                Variants / Occurrences
              </span>
              <span className="font-headline text-xl font-black text-primary">
                {pathway.pathwaysCount.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                Step Count
              </span>
              <span className="font-headline text-xl font-black text-on-surface">
                {pathway.length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                Total Entities
              </span>
              <span className="font-headline text-xl font-black text-on-surface">
                {pathway.objects.length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label font-bold text-[10px] tracking-wider text-on-surface-variant uppercase">
                Unique Relations
              </span>
              <span className="font-headline text-xl font-black text-emerald-500">
                {pathway.relations.length}
              </span>
            </div>
          </div>

          {/* Sequential Chain Overview */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Signaling Entity Chain Overview
            </h3>
            <div className="flex items-center gap-2 flex-wrap p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant/15 overflow-x-auto custom-scrollbar">
              {pathway.objects.map((obj, idx) => {
                const roleColor = getRoleColor(obj.role);
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />}
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant/25 shadow-xs shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: roleColor }} />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-on-surface select-all">{obj.name}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: roleColor }}>
                          {formatRoleName(obj.role)}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Fused Section: All Inferred Pathway Combinations with Entity Steps and Exact Relations */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                Inferred Variant Combinations ({combinations.length})
              </h3>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {pathway.length} {pathway.length === 1 ? "step" : "steps"} per combination
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
              {combinations.map((combo, cIdx) => (
                <div
                  key={cIdx}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-3 hover:border-primary/30 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                      Combination #{cIdx + 1}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/70 font-medium">
                      Variant {cIdx + 1} of {combinations.length}
                    </span>
                  </div>

                  {/* Complete step-by-step causal chain with clean relations (no pubmedids, no event ids) */}
                  <div className="flex items-center gap-2 flex-wrap p-3 px-3.5 bg-surface-container-high/60 rounded-xl border border-outline-variant/10 overflow-x-auto custom-scrollbar">
                    {pathway.objects.map((obj, oIdx) => {
                      const stepIdx = oIdx - 1;
                      const relation = oIdx > 0 ? combo[stepIdx] : null;
                      const roleColor = getRoleColor(obj.role);

                      return (
                        <React.Fragment key={oIdx}>
                          {oIdx > 0 && (
                            <div className="flex items-center gap-1.5 px-1.5 text-on-surface-variant/70 shrink-0">
                              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                                {relation}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-outline-variant" />
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 bg-surface-container-highest px-2.5 py-1.5 rounded-lg border border-outline-variant/20 shadow-xs shrink-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: roleColor }}
                            />
                            <span className="font-bold text-xs text-on-surface select-all">
                              {obj.name}
                            </span>
                            <span
                              className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded"
                              style={{
                                backgroundColor: `${roleColor}18`,
                                color: roleColor,
                              }}
                            >
                              {formatRoleName(obj.role)}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Footnote: PubMed citations grouped by event (without event IDs) */}
                  {(() => {
                    type EventGroup = {
                      stepIndex: number;
                      from: string;
                      to: string;
                      relation: string;
                      pmids: string[];
                    };

                    const eventGroups: EventGroup[] = [];
                    let totalPmids = 0;

                    combo.forEach((rel, sIdx) => {
                      const step = pathway.steps?.[sIdx];
                      const ev = step?.events?.find((e) => e.relation === rel);
                      const pmids = ev?.pubmedIds || [];
                      const fromName = pathway.objects[sIdx]?.name || "Source";
                      const toName = pathway.objects[sIdx + 1]?.name || "Target";

                      if (pmids.length > 0) {
                        eventGroups.push({
                          stepIndex: sIdx + 1,
                          from: fromName,
                          to: toName,
                          relation: rel,
                          pmids,
                        });
                        totalPmids += pmids.length;
                      }
                    });

                    if (eventGroups.length === 0) return null;

                    return (
                      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                        <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-on-surface-variant/80 shrink-0">
                          <BookOpen className="w-3 h-3 text-primary" />
                          PubMed Literature Evidence ({totalPmids}):
                        </span>

                        <div className="flex flex-col gap-2">
                          {eventGroups.map((group) => (
                            <div
                              key={group.stepIndex}
                              className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/10"
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface flex-wrap">
                                <span className="font-mono text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.2 rounded">
                                  Step {group.stepIndex}
                                </span>
                                <span className="font-bold text-on-surface">{group.from}</span>
                                <span className="text-primary font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/5 border border-primary/15">
                                  {group.relation}
                                </span>
                                <span className="font-bold text-on-surface">{group.to}</span>
                                <span className="text-[10px] text-on-surface-variant font-normal">
                                  ({group.pmids.length} {group.pmids.length === 1 ? "citation" : "citations"})
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {group.pmids.map((pmid) => (
                                  <a
                                    key={pmid}
                                    href={`https://www.ncbi.nlm.nih.gov/research/pubtator3/publication/${pmid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Step ${group.stepIndex}: ${group.from} -(${group.relation})-> ${group.to} | PMID ${pmid} - Open PubTator 3`}
                                    className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <BookOpen className="w-2.5 h-2.5" />
                                    <span className="font-bold">PMID {pmid}</span>
                                    <ExternalLink className="w-2 h-2 opacity-70" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 px-6 border-t border-outline-variant/15 bg-surface-container-lowest/60">
          <Button variant="primary" size="sm" onClick={onClose} className="px-5">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
