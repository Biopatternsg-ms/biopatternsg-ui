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
  Search,
  X,
  Plus,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { SynonymChip } from "@/components/atoms/SynonymChip";
import { RolePillBadge } from "@/components/atoms/RolePillBadge";
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { StepStatsBar } from "@/components/molecules/StepStatsBar";
import { experimentService } from "@/services/experimentService";
import type { BiologicalObjectItem } from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { CATEGORIES_LIST } from "@/config/biologicalCategories";
import { cn } from "@/lib/utils";

export const SelectClosingObjects = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentName, setExperimentName] = useState<string>("Experiment Execution");

  // Candidates & Selection
  const [candidates, setCandidates] = useState<BiologicalObjectItem[]>([]);
  const [initialSelectedKeys, setInitialSelectedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Filtering, Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Inference parameters loaded from Configure Inferences
  const [summarizeKb, setSummarizeKb] = useState(true);
  const [maxDepth, setMaxDepth] = useState(5);

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
        const [execData, bioObjects, savedClosing, savedInference] = await Promise.all([
          experimentService.getExperimentExecution(id),
          experimentService.getBiologicalObjects(id),
          experimentService.getClosingObjects(id),
          experimentService.getInferenceByPipelineId(id),
        ]);

        if (ignore) return;

        if (execData?.experimentName) {
          setExperimentName(execData.experimentName);
        }

        if (typeof savedInference?.summarizeKb === "boolean") {
          setSummarizeKb(savedInference.summarizeKb);
        }
        if (typeof savedInference?.maxDepth === "number" && savedInference.maxDepth > 0) {
          setMaxDepth(savedInference.maxDepth);
        }

        const validCandidates = Array.isArray(bioObjects) ? [...bioObjects] : [];
        validCandidates.sort((a, b) =>
          (a.symbol || a.name || "").localeCompare(b.symbol || b.name || "")
        );
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
      const key = getCandidateKey(obj);

      // Filter selected only
      if (filterSelectedOnly && !selectedKeys.has(key)) {
        return false;
      }

      // Search match
      const query = searchTerm.trim().toLowerCase();
      if (query) {
        const keyLower = key.toLowerCase();
        const name = (obj.name || "").toLowerCase();
        const synonyms = (obj.synonyms || obj.alternativeIds || []).join(" ").toLowerCase();
        const roles = (obj.roles || []).join(" ").toLowerCase();
        const biotypes = (obj.biotypes || []).join(" ").toLowerCase();
        const desc = (obj.description || "").toLowerCase();

        const matchesSearch =
          keyLower.includes(query) ||
          name.includes(query) ||
          synonyms.includes(query) ||
          roles.includes(query) ||
          biotypes.includes(query) ||
          desc.includes(query);

        if (!matchesSearch) return false;
      }

      // Category filter match
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "SELECTED") {
          if (!selectedKeys.has(key)) return false;
        } else {
          const catUpper = selectedCategory.toUpperCase();
          const hasBiotype = (obj.biotypes || []).some((b) => b.toUpperCase() === catUpper);
          const hasRole = (obj.roles || []).some((r) => r.toUpperCase() === catUpper);
          if (!hasBiotype && !hasRole) return false;
        }
      }

      return true;
    });
  }, [candidates, searchTerm, selectedCategory, filterSelectedOnly, selectedKeys]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [filteredCandidates, safeCurrentPage, pageSize]);

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

  const isAllCurrentPageSelected =
    paginatedCandidates.length > 0 &&
    paginatedCandidates.every((obj) => selectedKeys.has(getCandidateKey(obj)));

  const handleToggleCurrentPage = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedCandidates.forEach((obj) => next.delete(getCandidateKey(obj)));
      } else {
        paginatedCandidates.forEach((obj) => next.add(getCandidateKey(obj)));
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
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading closing objects..."
        sublabel="Fetching candidate terminal entities and pipeline data"
      />
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

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block">Inference Request Failed</span>
              <span>{errorMessage}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:bg-rose-100 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Guidance Note Banner */}
      <div
        className={cn(
          "p-4 rounded-2xl border transition-all flex items-start gap-3 shadow-xs",
          selectedKeys.size > 0
            ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
            : "bg-blue-50/70 border-blue-200/80 text-blue-950"
        )}
      >
        <div
          className={cn(
            "p-2 rounded-xl shrink-0 mt-0.5",
            selectedKeys.size > 0
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-blue-500/10 text-blue-600"
          )}
        >
          {selectedKeys.size > 0 ? (
            <Target className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm">
              {selectedKeys.size > 0
                ? `${selectedKeys.size} Target Closing Object${selectedKeys.size > 1 ? "s" : ""} Selected`
                : "Unrestricted Terminal Entity Selection (0 Selected)"}
            </h3>
            <span className="text-[11px] opacity-75 font-medium">
              {selectedKeys.size} of {candidates.length} candidate entities selected
            </span>
          </div>
          <p className="leading-relaxed opacity-90">
            {selectedKeys.size > 0 ? (
              <>
                Inferred biological pathways will strictly terminate at:{" "}
                <strong className="font-mono">
                  {Array.from(selectedKeys).slice(0, 8).join(", ")}
                  {selectedKeys.size > 8 ? ` and ${selectedKeys.size - 8} more` : ""}
                </strong>
                . Entities not selected will not be evaluated as closing target nodes.
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

      {/* Main Glass Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6">
        {/* Search, Filter & Stats Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                placeholder="Search candidates by symbol, name, role, or biotype..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selected Only Button */}
            <Button
              variant={filterSelectedOnly ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                setFilterSelectedOnly(!filterSelectedOnly);
                setCurrentPage(1);
              }}
              className={cn(
                "gap-1.5 text-xs font-bold shrink-0 border border-outline-variant/20 rounded-xl",
                filterSelectedOnly
                  ? "shadow-primary-glow font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
              title={filterSelectedOnly ? "Showing selected only. Click to show all." : "Filter to view only selected entities"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Selected Only</span>
              {selectedKeys.size > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    filterSelectedOnly
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  )}
                >
                  {selectedKeys.size}
                </span>
              )}
            </Button>

            {/* Bulk Selection Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllFiltered}
                disabled={filteredCandidates.length === 0}
                className="text-xs font-bold border border-outline-variant/20 rounded-xl hover:bg-surface-container-high text-on-surface-variant gap-1 h-9 px-2.5"
                title="Select all filtered candidates"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>All ({filteredCandidates.length})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedKeys.size === 0}
                className="text-xs font-bold border border-outline-variant/20 rounded-xl hover:bg-surface-container-high text-on-surface-variant gap-1 h-9 px-2.5"
                title="Clear all selected candidates"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Stats summary bar */}
          <StepStatsBar
            stats={[
              { label: "Candidates", value: candidates.length },
              {
                label: "Selected",
                value: selectedKeys.size,
                valueColor: selectedKeys.size > 0 ? "text-emerald-600 font-bold" : "text-on-surface-variant",
              },
              {
                label: "Target Mode",
                value: selectedKeys.size > 0 ? "Restricted" : "Any Terminal",
                valueColor: selectedKeys.size > 0 ? "text-primary font-bold" : "text-amber-600 font-bold",
              },
              {
                label: "Summarize KB",
                value: summarizeKb ? "Yes" : "No",
                valueColor: "text-on-surface font-semibold",
              },
              {
                label: "Max Depth",
                value: maxDepth,
                valueColor: "text-on-surface font-semibold",
              },
            ]}
          />
        </div>

        {/* Filter by Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-on-surface-variant/70 font-semibold whitespace-nowrap mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter by Role:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-xs",
              selectedCategory === "ALL"
                ? "bg-primary text-on-primary font-bold shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/15"
            )}
          >
            All ({candidates.length})
          </button>

          {/* Selected Category Pill */}
          {selectedKeys.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(selectedCategory === "SELECTED" ? "ALL" : "SELECTED");
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-xs border flex items-center gap-1.5",
                selectedCategory === "SELECTED"
                  ? "bg-emerald-600 text-white border-emerald-600 font-bold ring-1 ring-emerald-600 shadow-xs"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/15 hover:bg-surface-container-high"
              )}
            >
              <span>Selected</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  selectedCategory === "SELECTED"
                    ? "bg-white/25 text-white"
                    : "bg-emerald-100 text-emerald-800"
                )}
              >
                {selectedKeys.size}
              </span>
            </button>
          )}

          {CATEGORIES_LIST.map((cat) => {
            const count = candidates.filter((c) => {
              const b = (c.biotypes || []).map((x) => x.toUpperCase());
              const r = (c.roles || []).map((x) => x.toUpperCase());
              return b.includes(cat.key.toUpperCase()) || r.includes(cat.key.toUpperCase());
            }).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? "ALL" : cat.key);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-xs border flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary/10 text-primary border-primary font-bold ring-1 ring-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/15 hover:bg-surface-container-high"
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Section: Table or Empty State */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-surface-card rounded-2xl p-12 text-center border border-outline-variant/15 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-bold text-on-surface">
              No biological objects found
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              No candidates match your current search and filter criteria. Try resetting your filters.
            </p>
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  setFilterSelectedOnly(false);
                }}
                className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-lg border border-outline-variant/20"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium px-1">
              <span>
                Showing <strong className="text-on-surface">
                  {filteredCandidates.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                  -
                  {Math.min(safeCurrentPage * pageSize, filteredCandidates.length)}
                </strong> of{" "}
                <strong className="text-on-surface">{filteredCandidates.length}</strong> candidate biological entities
                {filteredCandidates.length !== candidates.length && (
                  <span className="text-on-surface-variant/70"> (filtered from {candidates.length} total)</span>
                )}
              </span>

              {selectedKeys.size > 0 && (
                <span className="text-emerald-600 font-semibold">
                  {selectedKeys.size} selected for terminal closure
                </span>
              )}
            </div>

            {/* Table View */}
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-card shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/15 bg-surface-container-low text-[11px] font-label uppercase font-bold tracking-wider text-on-surface-variant">
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        onChange={handleToggleCurrentPage}
                        title={isAllCurrentPageSelected ? "Deselect current page" : "Select current page"}
                        className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </th>
                    <th className="py-3.5 px-4 min-w-[170px]">Entity / Symbol</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Synonyms / IDs</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Biotypes</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Roles</th>
                    <th className="py-3.5 px-4 text-right min-w-[120px]">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs">
                  {paginatedCandidates.map((item, idx) => {
                    const key = getCandidateKey(item);
                    const isSelected = selectedKeys.has(key);
                    const synonymsList = item.synonyms || item.alternativeIds || [];

                    return (
                      <tr
                        key={`${key}-${idx}`}
                        onClick={() => handleToggle(key)}
                        className={cn(
                          "transition-colors align-top cursor-pointer select-none",
                          isSelected
                            ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                            : "hover:bg-surface-container-low/60"
                        )}
                      >
                        {/* Checkbox column */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggle(key)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary cursor-pointer accent-primary mt-1"
                          />
                        </td>

                        {/* Entity / Symbol */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-headline font-bold text-on-surface text-[14px] tracking-tight">
                                {key}
                              </span>
                              {isSelected && (
                                <Badge
                                  variant="completed"
                                  className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider"
                                >
                                  Selected
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p
                                className="text-[11px] text-on-surface-variant/80 line-clamp-2 max-w-xs"
                                title={item.description}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Synonyms / Alternative IDs */}
                        <td className="py-4 px-4">
                          {synonymsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                              {synonymsList.slice(0, 3).map((syn, synIdx) => (
                                <SynonymChip key={synIdx} synonym={syn} />
                              ))}
                              {synonymsList.length > 3 && (
                                <div className="relative group/chip inline-flex">
                                  <span
                                    className="inline-flex items-center bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg text-[10px] font-mono font-semibold cursor-help transition-all shadow-2xs whitespace-nowrap"
                                    title={synonymsList.slice(3).join(", ")}
                                  >
                                    +{synonymsList.length - 3} more
                                  </span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-mono font-medium rounded-lg shadow-xl max-w-xs truncate z-50 invisible opacity-0 group-hover/chip:visible group-hover/chip:opacity-100 transition-all duration-150 pointer-events-none">
                                    {synonymsList.slice(3).join(", ")}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[13px] text-on-surface-variant/40">-</span>
                          )}
                        </td>

                        {/* Biotypes */}
                        <td className="py-4 px-4">
                          {item.biotypes && item.biotypes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {item.biotypes.map((b, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-fixed text-on-primary-fixed border border-primary/20"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[13px] text-on-surface-variant/40">-</span>
                          )}
                        </td>

                        {/* Roles */}
                        <td className="py-4 px-4">
                          {item.roles && item.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {item.roles.map((r, rIdx) => (
                                <RolePillBadge key={rIdx} role={r} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[13px] text-on-surface-variant/40 italic">No roles</span>
                          )}
                        </td>

                        {/* Action / Selection toggle button */}
                        <td className="py-4 px-4 text-right">
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(key);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(key);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-xs bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/15 text-xs text-on-surface-variant font-medium">
                <div className="flex items-center gap-2">
                  <span>
                    Page <strong className="text-on-surface">{safeCurrentPage}</strong> of{" "}
                    <strong className="text-on-surface">{totalPages}</strong>
                  </span>
                  <span className="text-outline-variant/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-surface-card border border-outline-variant/30 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                    className="h-8 px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (safeCurrentPage <= 3) {
                        pageNum = i + 1;
                      } else if (safeCurrentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = safeCurrentPage - 2 + i;
                      }

                      const isActive = pageNum === safeCurrentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-8 h-8 rounded-xl font-medium text-xs transition-colors",
                            isActive
                              ? "bg-primary text-on-primary font-bold shadow-xs"
                              : "hover:bg-surface-container-high text-on-surface-variant"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                    className="h-8 px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-panel bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Confirm Closing Objects & Run Inferences
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Review your selection before triggering the inference engine.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15 text-xs flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Pipeline:</span>
                <strong className="text-on-surface font-medium truncate max-w-[200px]">
                  {experimentName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Selected Closing Objects:</span>
                <strong className={selectedKeys.size > 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {selectedKeys.size > 0 ? `${selectedKeys.size} entity(ies)` : "None (All Terminal Entities)"}
                </strong>
              </div>
              {selectedKeys.size > 0 && (
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 font-mono text-[11px] text-primary break-words max-h-24 overflow-y-auto">
                  {Array.from(selectedKeys).join(", ")}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Summarize Knowledge Base:</span>
                <strong className="text-on-surface">
                  {summarizeKb ? "Yes" : "No"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Maximum Pathway Depth:</span>
                <strong className="text-on-surface">{maxDepth}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSaveAndRun}
                className="text-xs font-bold shadow-primary-glow"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
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
