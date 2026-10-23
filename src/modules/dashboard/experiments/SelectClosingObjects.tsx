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

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  X,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Layers,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { StepStatsBar } from "@/components/molecules/StepStatsBar";
import { experimentService } from "@/services/experimentService";
import type { BiologicalObjectItem } from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { CATEGORY_STYLES, CATEGORIES_LIST } from "@/config/biologicalCategories";

export const SelectClosingObjects = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentName, setExperimentName] = useState<string>("Experiment Execution");

  // Candidates & Selection
  const [candidates, setCandidates] = useState<BiologicalObjectItem[]>([]);
  const [initialSelectedKeys, setInitialSelectedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Advanced inference parameters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [summarizeKb, setSummarizeKb] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);

  // Submission & Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const expId = experimentId;
    if (!expId) return;

    let ignore = false;
    async function loadInitialData(id: string) {
      try {
        const [execData, bioObjects, savedClosing] = await Promise.all([
          experimentService.getExperimentExecution(id),
          experimentService.getBiologicalObjects(id),
          experimentService.getClosingObjects(id),
        ]);

        if (ignore) return;

        if (execData?.experimentName) {
          setExperimentName(execData.experimentName);
        }

        const validCandidates = Array.isArray(bioObjects) ? bioObjects : [];
        setCandidates(validCandidates);

        const validClosing = Array.isArray(savedClosing) ? savedClosing : [];
        setInitialSelectedKeys(validClosing);
        setSelectedKeys(new Set(validClosing));
      } catch (err) {
        if (!ignore) {
          console.error("Error loading closing objects data:", err);
          setErrorMessage("Failed to load biological candidate objects. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData(expId);

    return () => {
      ignore = true;
    };
  }, [experimentId]);

  // Compute key for each candidate
  const getCandidateKey = (obj: BiologicalObjectItem): string => {
    return obj.symbol || obj.name;
  };

  // Filtered candidate objects
  const filteredCandidates = useMemo(() => {
    return candidates.filter((obj) => {
      const key = getCandidateKey(obj).toLowerCase();
      const name = (obj.name || "").toLowerCase();
      const synonyms = (obj.synonyms || []).join(" ").toLowerCase();
      const roles = (obj.roles || []).join(" ").toLowerCase();
      const biotypes = (obj.biotypes || []).join(" ").toLowerCase();

      // Search match
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        key.includes(query) ||
        name.includes(query) ||
        synonyms.includes(query) ||
        roles.includes(query) ||
        biotypes.includes(query);

      if (!matchesSearch) return false;

      // Category filter match
      if (selectedCategory !== "ALL") {
        const catUpper = selectedCategory.toUpperCase();
        const hasBiotype = (obj.biotypes || []).some((b) => b.toUpperCase() === catUpper);
        const hasRole = (obj.roles || []).some((r) => r.toUpperCase() === catUpper);
        if (!hasBiotype && !hasRole) return false;
      }

      return true;
    });
  }, [candidates, searchTerm, selectedCategory]);

  // Check if selection changed from initial
  const hasChanges = useMemo(() => {
    if (selectedKeys.size !== initialSelectedKeys.length) return true;
    for (const key of initialSelectedKeys) {
      if (!selectedKeys.has(key)) return true;
    }
    return false;
  }, [selectedKeys, initialSelectedKeys]);

  // Selection handlers
  const handleToggle = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      filteredCandidates.forEach((obj) => {
        next.add(getCandidateKey(obj));
      });
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedKeys(new Set());
  };

  const handleResetToInitial = () => {
    setSelectedKeys(new Set(initialSelectedKeys));
  };

  // Submit closing objects & trigger inference
  const handleConfirmSaveAndRun = async () => {
    if (!experimentId) return;
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const closingList = Array.from(selectedKeys);
      const response = await experimentService.saveClosingObjects(
        experimentId,
        closingList,
        summarizeKb,
        maxDepth
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed with status ${response.status}`);
      }

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Pathway Inferences Triggered",
        message:
          closingList.length > 0
            ? `Successfully saved ${closingList.length} closing object(s). The SWI-Prolog pathway inference engine has been initiated.`
            : "Successfully saved empty closing objects selection. Pathway inference has been initiated allowing any valid terminal entity.",
      });
    } catch (err) {
      console.error("Error triggering inferences:", err);
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while starting pathway inferences."
      );
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalData(null);
    navigate(`/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Header & Breadcrumb with Reusable Molecule */}
      <ManualStepHeader
        networkId={networkId}
        experimentId={experimentId}
        experimentName={experimentName}
        stepTitle="Select Closing Objects"
        stepDescription="Select candidate biological objects where inferred pathways must terminate."
        icon={Target}
        extraBadges={
          selectedKeys.size > 0 ? (
            <Badge variant="completed" className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
              {selectedKeys.size} Selected
            </Badge>
          ) : (
            <Badge variant="pending" className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
              Any Terminal Entity (0 Selected)
            </Badge>
          )
        }
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() =>
                navigate(
                  `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`
                )
              }
              className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-xl border border-outline-variant/20"
              title="Cancel and return to Pipeline Sequence Execution view"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>

            {hasChanges && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleResetToInitial}
                className="gap-2 font-bold text-xs border border-outline-variant/30 hover:bg-surface-container-high text-on-surface rounded-xl"
                title="Discard unsaved selection changes"
              >
                <RotateCcw className="w-4 h-4" />
                Discard Changes
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting || candidates.length === 0}
              className="gap-2 shadow-primary-glow font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Save & Run Inferences
            </Button>
          </>
        }
      />

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block">Inference Request Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Guidance Information Banner */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            selectedKeys.size > 0
              ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
              : "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                selectedKeys.size > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {selectedKeys.size > 0 ? (
                <Target className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold ${
                    selectedKeys.size > 0
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-blue-900 dark:text-blue-200"
                  }`}
                >
                  {selectedKeys.size > 0
                    ? `${selectedKeys.size} Target Closing Object${selectedKeys.size > 1 ? "s" : ""} Selected`
                    : "Unrestricted Terminal Entity Selection (0 Selected)"}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedKeys.size} of {candidates.length} candidate entities selected
                </span>
              </div>
              <p
                className={
                  selectedKeys.size > 0
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-blue-800 dark:text-blue-300"
                }
              >
                {selectedKeys.size > 0 ? (
                  <>
                    Inferred biological pathways will strictly terminate at:{" "}
                    <strong className="font-mono">
                      {Array.from(selectedKeys).slice(0, 6).join(", ")}
                      {selectedKeys.size > 6 ? ` and ${selectedKeys.size - 6} more` : ""}
                    </strong>
                    . Entities not selected will not be used as closing nodes.
                  </>
                ) : (
                  <>
                    You have not selected any specific closing objects. The inference engine will evaluate
                    pathways allowing <strong>any biologically valid terminal entity</strong> from the
                    evaluated restriction set to close pathways.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Bulk Select */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search candidates by symbol, name, role, or biotype..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick selection buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllFiltered}
                disabled={filteredCandidates.length === 0}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium"
              >
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Select All {searchTerm || selectedCategory !== "ALL" ? "Filtered" : ""} ({filteredCandidates.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedKeys.size === 0}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium"
              >
                <X className="w-3.5 h-3.5 mr-1 text-rose-500" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              All ({candidates.length})
            </button>
            {CATEGORIES_LIST.map((cat) => {
              const count = candidates.filter((c) => {
                const b = (c.biotypes || []).map((x) => x.toUpperCase());
                const r = (c.roles || []).map((x) => x.toUpperCase());
                return b.includes(cat.key) || r.includes(cat.key);
              }).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Candidate Objects Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Target className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-50" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No biological objects found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No candidates match your current search and filter criteria. Clear filters to see all objects.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCandidates.map((obj) => {
              const key = getCandidateKey(obj);
              const isSelected = selectedKeys.has(key);

              return (
                <div
                  key={key}
                  onClick={() => handleToggle(key)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500 shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                          {key}
                        </span>
                      </div>
                      {obj.name && obj.name !== key && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={obj.name}>
                          {obj.name}
                        </span>
                      )}
                    </div>

                    {/* Biotypes badges */}
                    {obj.biotypes && obj.biotypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {obj.biotypes.map((bt) => {
                          const style = CATEGORY_STYLES[bt.toUpperCase()];
                          return (
                            <span
                              key={bt}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                style
                                  ? `${style.bg} ${style.text} border ${style.border}`
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {style?.label || bt}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Confirmed Roles */}
                    {obj.roles && obj.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Roles:</span>
                        {obj.roles.map((role) => (
                          <span
                            key={role}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Synonyms preview if available */}
                  {obj.synonyms && obj.synonyms.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 truncate">
                      Synonyms: {obj.synonyms.slice(0, 3).join(", ")}
                      {obj.synonyms.length > 3 && ` +${obj.synonyms.length - 3}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsible Advanced Parameters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Advanced Inference Parameters
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Summarize Knowledge Base
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Aggregate duplicate and reciprocal biological relations before Prolog evaluation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={summarizeKb}
                  onChange={(e) => setSummarizeKb(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                />
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Maximum Pathway Depth
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Maximum number of causal transitions allowed per inferred pathway (default: 10).
                  </span>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Math.max(1, Math.min(50, Number(e.target.value) || 10)))}
                    className="text-right text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {selectedKeys.size > 0 ? (
              <span>
                Ready to infer pathways closing strictly at{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {selectedKeys.size}
                </strong>{" "}
                selected biological object(s).
              </span>
            ) : (
              <span>
                No closing objects selected. Inferences will be executed with{" "}
                <strong className="text-blue-600 dark:text-blue-400">unrestricted terminal entities</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToInitial}
                className="text-xs"
              >
                Discard
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting || candidates.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving & Launching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Save Closing Objects & Run Inferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Closing Objects & Run Inferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review your selection before triggering the inference engine.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pipeline:</span>
                <strong className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
                  {experimentName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Selected Closing Objects:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedKeys.size > 0 ? `${selectedKeys.size} entity(ies)` : "None (All Terminal Entities)"}
                </strong>
              </div>
              {selectedKeys.size > 0 && (
                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 break-words max-h-24 overflow-y-auto">
                  {Array.from(selectedKeys).join(", ")}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Summarize Knowledge Base:</span>
                <strong className="text-slate-700 dark:text-slate-300">
                  {summarizeKb ? "Yes" : "No"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Maximum Pathway Depth:</span>
                <strong className="text-slate-700 dark:text-slate-300">{maxDepth}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSaveAndRun}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Confirm & Run Inferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        open={!!successModalData}
        title={successModalData?.title || "Inferences Started"}
        message={successModalData?.message || "Pathway inferences have been triggered successfully."}
        onClose={handleSuccessClose}
      />

      {/* Error Modal */}
      <ErrorModal
        open={!!errorMessage}
        title="Inference Error"
        message={errorMessage || "An error occurred while saving closing objects."}
        onClose={() => setErrorMessage(null)}
      />
    </div>
  );
};

export default SelectClosingObjects;
