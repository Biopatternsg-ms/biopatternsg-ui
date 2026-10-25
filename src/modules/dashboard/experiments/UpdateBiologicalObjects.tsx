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

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Dna,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit2,
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
import type {
  BiologicalObjectItem,
  RestrictionLevel,
} from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import {
  CATEGORIES_LIST,
} from "@/config/biologicalCategories";
import { cn } from "@/lib/utils";

interface EditableBiologicalObject extends BiologicalObjectItem {
  id: string;
  isModified: boolean;
}

export const UpdateBiologicalObjects = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentName, setExperimentName] = useState<string>("Experiment Execution");
  const [initialObjects, setInitialObjects] = useState<BiologicalObjectItem[]>([]);
  const [objects, setObjects] = useState<EditableBiologicalObject[]>([]);
  const [restrictionLevel, setRestrictionLevel] = useState<RestrictionLevel>("VERY_RESTRICTED");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterModifiedOnly, setFilterModifiedOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Quick-add state for an entity
  const [activeAddRoleEntityId, setActiveAddRoleEntityId] = useState<string | null>(null);
  const [customRoleInput, setCustomRoleInput] = useState("");

  // Submission & Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    navigateOnClose?: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasFetchedRef = useRef<string | null>(null);

  const loadData = useCallback(async (id: string) => {
    try {
      setLoading(true);

      const [pipeData, inferenceConfigData, bioObjectsData] = await Promise.allSettled([
        experimentService.getPipelineById(id),
        experimentService.getInferenceByPipelineId(id),
        experimentService.getBiologicalObjects(id),
      ]);

      if (pipeData.status === "fulfilled" && pipeData.value?.name) {
        setExperimentName(pipeData.value.name);
      }

      if (inferenceConfigData.status === "fulfilled" && inferenceConfigData.value) {
        setRestrictionLevel(inferenceConfigData.value.restrictionLevel || "VERY_RESTRICTED");
      }

      if (bioObjectsData.status === "fulfilled" && bioObjectsData.value) {
        const items = bioObjectsData.value;
        // Prioritize entities with no roles at the start
        const sortedItems = [...items].sort((a, b) => {
          const aNoRoles = (!a.roles || a.roles.length === 0) ? 1 : 0;
          const bNoRoles = (!b.roles || b.roles.length === 0) ? 1 : 0;
          if (aNoRoles !== bNoRoles) {
            return bNoRoles - aNoRoles;
          }
          return (a.symbol || a.name || "").localeCompare(b.symbol || b.name || "");
        });

        setInitialObjects(sortedItems);
        setObjects(
          sortedItems.map((item, idx) => ({
            ...item,
            id: `${item.symbol || item.name}-${idx}`,
            isModified: false,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading biological objects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const expId = experimentId;
    if (!expId) return;

    if (hasFetchedRef.current === expId) return;
    hasFetchedRef.current = expId;

    loadData(expId);
  }, [experimentId, loadData]);

  // Handler to reset all roles back to initial state (backend + reload)
  const handleConfirmReset = async () => {
    setIsResetConfirmModalOpen(false);
    setIsResetting(true);
    setErrorMessage(null);
    try {
      const pipeId = experimentId || "pipeline-demo-123";
      const response = await experimentService.resetBiologicalObjectsRoles(pipeId);
      if (!response.ok) {
        throw new Error(`Failed to reset biological objects roles: ${response.statusText}`);
      }

      await loadData(pipeId);
      setSuccessModalData({
        title: "Biological Roles Reset",
        message:
          "All biological roles have been reset to their initial state derived purely from Biotypes and MeSH criteria.",
        navigateOnClose: false,
      });
    } catch (err) {
      console.error("Error resetting biological roles:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Error resetting biological roles. Please check backend connection."
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Handler to add a role to an entity
  const handleAddRole = (entityId: string, roleToAdd: string) => {
    const normalizedRole = roleToAdd.trim().toUpperCase();
    if (!normalizedRole) return;

    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== entityId) return obj;
        if (obj.roles.some((r) => r.toUpperCase() === normalizedRole)) return obj;

        const updatedRoles = [...obj.roles, normalizedRole];
        const initial = initialObjects.find((io) => (io.symbol || io.name) === (obj.symbol || obj.name));
        const initialRoles = initial ? initial.roles || [] : [];
        const isModified =
          updatedRoles.length !== initialRoles.length ||
          updatedRoles.some((r) => !initialRoles.some((ir) => ir.toUpperCase() === r.toUpperCase()));

        return {
          ...obj,
          roles: updatedRoles,
          isModified,
        };
      })
    );

    setCustomRoleInput("");
    setActiveAddRoleEntityId(null);
  };

  // Handler to remove a role from an entity
  const handleRemoveRole = (entityId: string, roleToRemove: string) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== entityId) return obj;

        const updatedRoles = obj.roles.filter(
          (r) => r.toUpperCase() !== roleToRemove.trim().toUpperCase()
        );
        const initial = initialObjects.find((io) => (io.symbol || io.name) === (obj.symbol || obj.name));
        const initialRoles = initial ? initial.roles || [] : [];
        const isModified =
          updatedRoles.length !== initialRoles.length ||
          updatedRoles.some((r) => !initialRoles.some((ir) => ir.toUpperCase() === r.toUpperCase()));

        return {
          ...obj,
          roles: updatedRoles,
          isModified,
        };
      })
    );
  };

  // Handler to reset single entity back to initial
  const handleResetEntity = (entityId: string) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== entityId) return obj;
        const initial = initialObjects.find((io) => (io.symbol || io.name) === (obj.symbol || obj.name));
        if (!initial) return obj;

        return {
          ...obj,
          roles: [...initial.roles],
          isModified: false,
        };
      })
    );
  };

  // Handler to reset all entities back to initial
  const handleResetAll = () => {
    setObjects(
      initialObjects.map((item, idx) => ({
        ...item,
        id: `${item.symbol || item.name}-${idx}`,
        isModified: false,
      }))
    );
  };

  // Confirm and save roles to backend
  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      const pipeId = experimentId || "pipeline-demo-123";

      // Build the roles dictionary: { [symbol]: string[] }
      const rolesMap: Record<string, string[]> = {};
      objects.forEach((obj) => {
        const key = obj.symbol || obj.name;
        rolesMap[key] = obj.roles;
      });

      const response = await experimentService.saveBiologicalObjectsRoles(pipeId, rolesMap);

      if (!response.ok) {
        throw new Error(`Failed to save biological objects roles: ${response.statusText}`);
      }

      try {
        await experimentService.updatePipelineStep(pipeId, "UPDATE_BIOLOGICAL_OBJECTS", "COMPLETED", {
          totalEntitiesEvaluated: String(objects.length),
          statusMessage: "Biological roles confirmed by researcher",
        });
      } catch (stepErr) {
        console.warn("Update step endpoint warning:", stepErr);
      }

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Biological Objects Roles Saved",
        message:
          "The confirmed biological roles have been successfully synchronized. The next step is to select target closing objects for pathway inference.",
        navigateOnClose: true,
      });
    } catch (err) {
      console.error("Error saving biological objects roles:", err);
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Error saving biological objects roles. Please check backend connection."
      );
    }
  };

  // Filtered list (prioritizing entities with no roles at the beginning)
  const filteredObjects = useMemo(() => {
    const filtered = objects.filter((item) => {
      // Modified only filter
      if (filterModifiedOnly && !item.isModified) {
        return false;
      }

      // Category filter (support NO_ROLES or specific role key)
      if (selectedCategory === "NO_ROLES") {
        if (item.roles.length > 0) return false;
      } else if (selectedCategory !== "ALL") {
        const matchesCategory = item.roles.some(
          (r) => r.toUpperCase() === selectedCategory.toUpperCase()
        );
        if (!matchesCategory) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const symbolMatch = (item.symbol || item.name).toLowerCase().includes(term);
        const descMatch = (item.description || "").toLowerCase().includes(term);
        const synonymMatch = (item.synonyms || item.alternativeIds || []).some((s) =>
          s.toLowerCase().includes(term)
        );
        const rolesMatch = item.roles.some((r) => r.toLowerCase().includes(term));
        return symbolMatch || descMatch || synonymMatch || rolesMatch;
      }

      return true;
    });

    // Always sort entities with no roles first, followed by alphabetical order
    return [...filtered].sort((a, b) => {
      const aNoRoles = a.roles.length === 0 ? 1 : 0;
      const bNoRoles = b.roles.length === 0 ? 1 : 0;
      if (aNoRoles !== bNoRoles) {
        return bNoRoles - aNoRoles;
      }
      return (a.symbol || a.name || "").localeCompare(b.symbol || b.name || "");
    });
  }, [objects, filterModifiedOnly, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredObjects.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedObjects = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredObjects.slice(startIndex, startIndex + pageSize);
  }, [filteredObjects, safeCurrentPage, pageSize]);

  const modifiedCount = useMemo(() => objects.filter((o) => o.isModified).length, [objects]);
  const noRolesCount = useMemo(() => objects.filter((o) => o.roles.length === 0).length, [objects]);

  const totalAssignedRoles = useMemo(
    () => objects.reduce((sum, o) => sum + o.roles.length, 0),
    [objects]
  );

  const formatRestrictionLabel = (level: RestrictionLevel) => {
    switch (level) {
      case "VERY_RESTRICTED":
        return "Very Restricted";
      case "RESTRICTED":
        return "Restricted";
      case "UNRESTRICTED":
        return "Unrestricted";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading object roles..."
        sublabel="Fetching pipeline inferences and biological entities"
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
        stepTitle="Update Object Roles"
        stepDescription="Review and curate biological roles and biotypes resulting from the restriction criteria before completing this step."
        icon={Dna}
        extraBadges={
          modifiedCount > 0 ? (
            <Badge variant="pending" className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
              {modifiedCount} Modified
            </Badge>
          ) : undefined
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

            {modifiedCount > 0 && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleResetAll}
                className="gap-2 font-bold text-xs border border-outline-variant/30 hover:bg-surface-container-high text-on-surface rounded-xl"
                title="Discard unsaved local changes"
              >
                <RotateCcw className="w-4 h-4" />
                Discard Changes
              </Button>
            )}

            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsResetConfirmModalOpen(true)}
              disabled={isSubmitting || isResetting || objects.length === 0}
              className="gap-2 font-bold text-xs border border-outline-variant/30 hover:bg-surface-container-high text-on-surface rounded-xl"
              title="Reset all biological roles to original state derived from Biotypes and MeSH"
            >
              {isResetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Reset Roles
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting || isResetting || objects.length === 0}
              className="gap-2 shadow-primary-glow font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm & Save Roles
            </Button>
          </>
        }
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-xs font-medium">{errorMessage}</p>
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

      {/* Main Table Glass Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                placeholder="Search by symbol, synonyms, or role..."
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

            <Button
              variant={filterModifiedOnly ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                setFilterModifiedOnly(!filterModifiedOnly);
                setCurrentPage(1);
              }}
              className={cn(
                "gap-1.5 text-xs font-bold shrink-0 border border-outline-variant/20 rounded-xl",
                filterModifiedOnly
                  ? "shadow-primary-glow font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
              title={filterModifiedOnly ? "Showing modified only. Click to show all." : "Filter to view only modified entities"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Modified Only</span>
              {modifiedCount > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    filterModifiedOnly
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {modifiedCount}
                </span>
              )}
            </Button>
          </div>

          {/* Stats summary bar */}
          <StepStatsBar
            stats={[
              { label: "Entities", value: objects.length },
              {
                label: "Restriction",
                value: formatRestrictionLabel(restrictionLevel),
                valueColor: "text-primary font-bold",
              },
              {
                label: "Active Roles",
                value: totalAssignedRoles,
                valueColor: "text-emerald-600",
              },
              {
                label: "No Roles",
                value: noRolesCount,
                valueColor: noRolesCount > 0 ? "text-amber-600 font-bold" : "text-on-surface-variant",
              },
              {
                label: "Modified",
                value: modifiedCount,
                valueColor: modifiedCount > 0 ? "text-amber-600" : "text-on-surface-variant",
              },
            ]}
          />
        </div>

        {/* Filter by Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-on-surface-variant/70 font-semibold whitespace-nowrap mr-1">
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
            All ({objects.length})
          </button>

          {/* No Roles Pill */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(selectedCategory === "NO_ROLES" ? "ALL" : "NO_ROLES");
              setCurrentPage(1);
            }}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-xs border flex items-center gap-1.5",
              selectedCategory === "NO_ROLES"
                ? "bg-amber-600 text-white border-amber-600 font-bold ring-1 ring-amber-600 shadow-xs"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/15 hover:bg-surface-container-high"
            )}
          >
            <span>No Roles</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                selectedCategory === "NO_ROLES"
                  ? "bg-white/25 text-white"
                  : noRolesCount > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              {noRolesCount}
            </span>
          </button>
          {CATEGORIES_LIST.map((cat) => {
            const count = objects.filter((o) =>
              o.roles.some((r) => r.toUpperCase() === cat.key.toUpperCase())
            ).length;
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

        {/* Content Section */}
        {filteredObjects.length === 0 ? (
          <div className="bg-surface-card rounded-2xl p-12 text-center border border-outline-variant/15 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-on-surface">
              No biological objects found
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              No entities match the current search query or role filter. Try resetting your filters.
            </p>
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  setFilterModifiedOnly(false);
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
                  {filteredObjects.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                  -
                  {Math.min(safeCurrentPage * pageSize, filteredObjects.length)}
                </strong> of{" "}
                <strong className="text-on-surface">{filteredObjects.length}</strong> biological entities
                {filteredObjects.length !== objects.length && (
                  <span className="text-on-surface-variant/70"> (filtered from {objects.length} total)</span>
                )}
              </span>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-card shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/15 bg-surface-container-low text-[11px] font-label uppercase font-bold tracking-wider text-on-surface-variant">
                    <th className="py-3.5 px-4 min-w-[170px]">Entity / Symbol</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Synonyms / IDs</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Biotypes</th>
                    <th className="py-3.5 px-4 min-w-[140px]">MeSH Roles</th>
                    <th className="py-3.5 px-4 min-w-[320px]">Confirmed Roles</th>
                    <th className="py-3.5 px-4 text-right min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs">
                  {paginatedObjects.map((item) => {
                    const entitySymbol = item.symbol || item.name;
                    const synonymsList = item.synonyms || item.alternativeIds || [];
                    const isAddActive = activeAddRoleEntityId === item.id;

                    // Categories not yet added to this entity
                    const availableCategoriesToAdd = CATEGORIES_LIST.filter(
                      (c) => !item.roles.some((r) => r.toUpperCase() === c.key.toUpperCase())
                    );

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "transition-colors align-top hover:bg-surface-container-low/60",
                          item.isModified && "bg-amber-500/5 hover:bg-amber-500/10"
                        )}
                      >
                        {/* Entity / Symbol */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-headline font-bold text-on-surface text-[14px] tracking-tight">
                                {entitySymbol}
                              </span>
                              {item.isModified && (
                                <Badge
                                  variant="inProgress"
                                  className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider"
                                >
                                  Modified
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

                        {/* MeSH Roles */}
                        <td className="py-4 px-4">
                          {item.meshRoles && item.meshRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {item.meshRoles.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[13px] text-on-surface-variant/40">-</span>
                          )}
                        </td>

                        {/* Confirmed Roles */}
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {item.roles.length === 0 ? (
                                <span className="text-xs text-amber-600 italic">
                                  No roles assigned
                                </span>
                              ) : (
                                item.roles.map((role) => (
                                  <RolePillBadge
                                    key={role}
                                    role={role}
                                    onRemove={() => handleRemoveRole(item.id, role)}
                                  />
                                ))
                              )}

                              {!isAddActive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveAddRoleEntityId(item.id);
                                    setCustomRoleInput("");
                                  }}
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors font-semibold"
                                  title="Add role"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>

                            {/* Inline Role Picker when active */}
                            {isAddActive && (
                              <div className="bg-surface-card p-3 rounded-2xl border border-outline-variant/25 shadow-md space-y-2 animate-fade-in max-w-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-on-surface">
                                    Select role to add:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAddRoleEntityId(null);
                                      setCustomRoleInput("");
                                    }}
                                    className="text-on-surface-variant/60 hover:text-on-surface"
                                    title="Close"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Standard quick buttons */}
                                <div className="flex flex-wrap gap-1">
                                  {availableCategoriesToAdd.map((cat) => {
                                    return (
                                      <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => handleAddRole(item.id, cat.key)}
                                        className="text-xs px-2.5 py-1 rounded-full font-semibold border transition-all hover:scale-105 bg-surface-container-high text-on-surface hover:border-primary/40 border-outline-variant/20"
                                      >
                                        + {cat.label}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Custom input */}
                                <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/15">
                                  <Input
                                    placeholder="Or type custom role..."
                                    value={customRoleInput}
                                    onChange={(e) => setCustomRoleInput(e.target.value)}
                                    className="h-7 text-xs flex-1 rounded-lg"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddRole(item.id, customRoleInput);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs shadow-xs font-bold rounded-lg"
                                    disabled={!customRoleInput.trim()}
                                    onClick={() => handleAddRole(item.id, customRoleInput)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (isAddActive) {
                                  setActiveAddRoleEntityId(null);
                                } else {
                                  setActiveAddRoleEntityId(item.id);
                                  setCustomRoleInput("");
                                }
                              }}
                              className="h-7 px-2.5 gap-1 text-[11px] font-semibold text-primary hover:bg-primary/10 border border-primary/20 rounded-xl"
                              title="Edit Roles"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </Button>

                            {item.isModified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetEntity(item.id)}
                                title="Revert to original roles"
                                className="h-7 px-2.5 gap-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 border border-amber-300 rounded-xl"
                              >
                                <RotateCcw className="w-3 h-3" /> Revert
                              </Button>
                            )}
                          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-card rounded-3xl shadow-xl max-w-lg w-full p-6 border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  Confirm Biological Roles
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Save curated roles to knowledge base and complete pipeline step
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-4 text-xs text-on-surface-variant border border-outline-variant/15 space-y-2">
              <div className="flex justify-between py-1 border-b border-outline-variant/15">
                <span>Total Entities to Update:</span>
                <strong className="text-on-surface">{objects.length}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/15">
                <span>Entities with Modified Roles:</span>
                <strong className={modifiedCount > 0 ? "text-amber-600" : "text-on-surface"}>
                  {modifiedCount}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Active Roles Assigned:</span>
                <strong className="text-emerald-600">{totalAssignedRoles}</strong>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Saving will persist the curated roles list into the <code className="text-primary font-mono bg-primary/5 px-1 py-0.5 rounded">roles</code> attribute
              of MongoDB collection <code className="text-primary font-mono bg-primary/5 px-1 py-0.5 rounded">kb_objects</code>, update inference configuration,
              and mark step <strong>Update Object Roles</strong> as <strong>COMPLETED</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-xl border border-outline-variant/20"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmSave}
                disabled={isSubmitting}
                className="gap-2 shadow-primary-glow font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-card rounded-3xl max-w-md w-full p-6 shadow-xl border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-sm">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-on-surface">
                  Reset Biological Roles?
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Revert to original Biotypes & MeSH evaluation
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              This action will clear all previously saved roles in the Knowledge Base (<code className="text-amber-600 font-mono bg-amber-500/10 px-1 py-0.5 rounded">kb_objects</code>) and Inference configuration, returning all biological objects to their original roles evaluated purely from <strong>Biotypes</strong> and <strong>MeSH terms</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsResetConfirmModalOpen(false)}
                disabled={isResetting}
                className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-xl border border-outline-variant/20"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Confirm Reset
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalData && (
        <SuccessModal
          open={true}
          title={successModalData.title}
          message={successModalData.message}
          onClose={() => {
            const shouldNavigate = successModalData.navigateOnClose ?? true;
            setSuccessModalData(null);
            if (shouldNavigate) {
              navigate(
                `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default UpdateBiologicalObjects;
