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
  ArrowLeft,
  Search,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Dna,
  Save,
  Layers,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { experimentService } from "@/services/experimentService";
import type {
  BiologicalObjectItem,
  RestrictionLevel,
} from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import {
  CATEGORY_STYLES,
  CATEGORIES_LIST,
} from "@/config/biologicalCategories";

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
        setInitialObjects(items);
        setObjects(
          items.map((item, idx) => ({
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
        if (obj.roles.includes(normalizedRole)) return obj;

        const updatedRoles = [...obj.roles, normalizedRole];
        const initial = initialObjects.find((io) => (io.symbol || io.name) === (obj.symbol || obj.name));
        const initialRoles = initial ? initial.roles || [] : [];
        const isModified =
          updatedRoles.length !== initialRoles.length ||
          updatedRoles.some((r) => !initialRoles.includes(r));

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

        const updatedRoles = obj.roles.filter((r) => r !== roleToRemove);
        const initial = initialObjects.find((io) => (io.symbol || io.name) === (obj.symbol || obj.name));
        const initialRoles = initial ? initial.roles || [] : [];
        const isModified =
          updatedRoles.length !== initialRoles.length ||
          updatedRoles.some((r) => !initialRoles.includes(r));

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

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Biological Objects Roles Saved",
        message:
          "The confirmed biological roles have been successfully synchronized to the Knowledge Base (kb_objects) and Inference configuration. The Update Biological Objects step is now complete.",
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

  // Filtered list
  const filteredObjects = useMemo(() => {
    return objects.filter((item) => {
      // Modified only filter
      if (filterModifiedOnly && !item.isModified) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        const matchesCategory = item.roles.includes(selectedCategory);
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
  }, [objects, filterModifiedOnly, selectedCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredObjects.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedObjects = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredObjects.slice(startIndex, startIndex + pageSize);
  }, [filteredObjects, safeCurrentPage, pageSize]);

  const modifiedCount = useMemo(() => objects.filter((o) => o.isModified).length, [objects]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Breadcrumb
                items={[
                  { label: "Experiments", href: `/dashboard/experiments/${networkId || ""}` },
                  {
                    label: experimentName,
                    href: `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`,
                  },
                  { label: "Update Biological Objects" },
                ]}
              />
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`
                    )
                  }
                  className="mr-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-semibold shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 text-slate-600 dark:text-slate-300" />
                  Back to Execution
                </Button>
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Dna className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Update Biological Objects
                    {modifiedCount > 0 && (
                      <Badge variant="pending" className="text-xs">
                        {modifiedCount} Modified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and curate biological roles and biotypes resulting from the restriction criteria.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats & Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                <span>Restriction:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatRestrictionLabel(restrictionLevel)}
                </span>
                <span className="text-slate-400">•</span>
                <span>Entities:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {objects.length}
                </span>
                <span className="text-slate-400">•</span>
                <span>Active Roles:</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {totalAssignedRoles}
                </span>
              </div>

              {modifiedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold shadow-xs"
                  title="Discard unsaved local changes"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                  Discard Changes
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmModalOpen(true)}
                disabled={isSubmitting || isResetting || objects.length === 0}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold shadow-xs"
                title="Reset all biological roles to original state derived from Biotypes and MeSH"
              >
                {isResetting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                )}
                Reset Roles
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={isSubmitting || isResetting || objects.length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Confirm & Save Roles
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block">Failed to save biological roles</span>
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

        {/* Toolbar: Search and Filter Pills */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by symbol, synonyms, or role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Modified Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFilterModifiedOnly(!filterModifiedOnly);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-xs cursor-pointer ${
                  filterModifiedOnly
                    ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={filterModifiedOnly ? "Showing modified only. Click to show all." : "Filter to view only modified entities"}
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 ${filterModifiedOnly ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>Modified Only</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterModifiedOnly
                      ? "bg-amber-700 text-white"
                      : modifiedCount > 0
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {modifiedCount}
                </span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Filter by Role:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              All ({objects.length})
            </button>
            {CATEGORIES_LIST.map((cat) => {
              const count = objects.filter((o) => o.roles.includes(cat.key)).length;
              const isSelected = selectedCategory === cat.key;
              const style = CATEGORY_STYLES[cat.key];

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(isSelected ? "ALL" : cat.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
                    isSelected
                      ? `${style?.bg || "bg-teal-500/10"} ${style?.text || "text-teal-600"} border-teal-500 font-semibold ring-1 ring-teal-500`
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading biological objects from pipeline inferences...
            </p>
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No biological objects found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold shadow-xs"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>
                Showing <strong className="text-slate-700 dark:text-slate-200">
                  {filteredObjects.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                  -
                  {Math.min(safeCurrentPage * pageSize, filteredObjects.length)}
                </strong> of{" "}
                <strong className="text-slate-700 dark:text-slate-200">{filteredObjects.length}</strong> biological entities
                {filteredObjects.length !== objects.length && (
                  <span className="text-slate-400"> (filtered from {objects.length} total)</span>
                )}
              </span>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 min-w-[170px]">Entity / Symbol</th>
                    <th className="py-3 px-4 min-w-[180px]">Synonyms / IDs</th>
                    <th className="py-3 px-4 min-w-[130px]">Biotypes</th>
                    <th className="py-3 px-4 min-w-[140px]">MeSH Roles</th>
                    <th className="py-3 px-4 min-w-[320px]">Confirmed Roles</th>
                    <th className="py-3 px-4 text-right min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                  {paginatedObjects.map((item) => {
                    const entitySymbol = item.symbol || item.name;
                    const synonymsList = item.synonyms || item.alternativeIds || [];
                    const isAddActive = activeAddRoleEntityId === item.id;

                    // Categories not yet added to this entity
                    const availableCategoriesToAdd = CATEGORIES_LIST.filter(
                      (c) => !item.roles.includes(c.key)
                    );

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors align-top ${
                          item.isModified
                            ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-700/30"
                        }`}
                      >
                        {/* Entity / Symbol */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {entitySymbol}
                              </span>
                              {item.isModified && (
                                <Badge
                                  variant="pending"
                                  className="text-[9px] px-1.5 py-0 uppercase tracking-wider font-semibold"
                                >
                                  Modified
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p
                                className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xs"
                                title={item.description}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Synonyms / Alternative IDs */}
                        <td className="py-3.5 px-4">
                          {synonymsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {synonymsList.slice(0, 3).map((syn, synIdx) => (
                                <span
                                  key={synIdx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60 truncate max-w-[170px]"
                                  title={syn}
                                >
                                  {syn}
                                </span>
                              ))}
                              {synonymsList.length > 3 && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 cursor-help"
                                  title={synonymsList.slice(3).join(", ")}
                                >
                                  +{synonymsList.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Biotypes */}
                        <td className="py-3.5 px-4">
                          {item.biotypes && item.biotypes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.biotypes.map((b, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[10px]">None</span>
                          )}
                        </td>

                        {/* MeSH Roles */}
                        <td className="py-3.5 px-4">
                          {item.meshRoles && item.meshRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.meshRoles.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[10px]">None</span>
                          )}
                        </td>

                        {/* Confirmed Roles */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {item.roles.length === 0 ? (
                                <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                                  No roles assigned
                                </span>
                              ) : (
                                item.roles.map((role) => {
                                  const style = CATEGORY_STYLES[role] || {
                                    label: role,
                                    bg: "bg-slate-100 dark:bg-slate-700",
                                    text: "text-slate-700 dark:text-slate-200",
                                    border: "border-slate-300 dark:border-slate-600",
                                  };

                                  return (
                                    <span
                                      key={role}
                                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium border transition-colors ${style.bg} ${style.text} ${style.border}`}
                                    >
                                      <span>{style.label || role}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRole(item.id, role)}
                                        title={`Remove ${role}`}
                                        className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  );
                                })
                              )}

                              {!isAddActive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveAddRoleEntityId(item.id);
                                    setCustomRoleInput("");
                                  }}
                                  className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-teal-600 hover:border-teal-400 dark:hover:text-teal-400 dark:hover:border-teal-500 transition-colors"
                                  title="Add role"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>

                            {/* Inline Role Picker when active */}
                            {isAddActive && (
                              <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                    Select role to add:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAddRoleEntityId(null);
                                      setCustomRoleInput("");
                                    }}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Close"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Standard quick buttons */}
                                <div className="flex flex-wrap gap-1">
                                  {availableCategoriesToAdd.length > 0 ? (
                                    availableCategoriesToAdd.map((cat) => (
                                      <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => handleAddRole(item.id, cat.key)}
                                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                                      >
                                        + {cat.label}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      All standard roles assigned.
                                    </span>
                                  )}
                                </div>

                                {/* Custom role input */}
                                <div className="flex items-center gap-1.5 pt-1">
                                  <Input
                                    placeholder="Or custom role..."
                                    value={customRoleInput}
                                    onChange={(e) => setCustomRoleInput(e.target.value)}
                                    className="text-xs h-7 bg-white dark:bg-slate-800"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && customRoleInput.trim()) {
                                        e.preventDefault();
                                        handleAddRole(item.id, customRoleInput);
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-teal-600 hover:bg-teal-700 text-white"
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end">
                            {item.isModified ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetEntity(item.id)}
                                title="Revert to original roles"
                                className="h-7 px-2 text-xs gap-1 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-medium"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Revert</span>
                              </Button>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs select-none">-</span>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span>
                    Page <strong className="text-slate-700 dark:text-slate-200">{safeCurrentPage}</strong> of{" "}
                    <strong className="text-slate-700 dark:text-slate-200">{totalPages}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                    className="h-8 px-2.5 gap-1 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
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

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg font-medium text-xs transition-colors ${
                            safeCurrentPage === pageNum
                              ? "bg-teal-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                          }`}
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
                    className="h-8 px-2.5 gap-1 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Biological Roles
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save curated roles to knowledge base and complete pipeline step
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span>Total Entities to Update:</span>
                <strong className="text-slate-900 dark:text-white">{objects.length}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span>Entities with Modified Roles:</span>
                <strong className={modifiedCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}>
                  {modifiedCount}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Active Roles Assigned:</span>
                <strong className="text-teal-600 dark:text-teal-400">{totalAssignedRoles}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saving will persist the curated roles list into the <code className="text-teal-600 dark:text-teal-400">roles</code> attribute
              of MongoDB collection <code className="text-teal-600 dark:text-teal-400">kb_objects</code>, update inference configuration,
              and mark step <strong>Update Biological Objects</strong> as <strong>COMPLETED</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSave}
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Biological Roles?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revert to original Biotypes & MeSH evaluation
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action will clear all previously saved roles in the Knowledge Base (<code className="text-amber-600 dark:text-amber-400 font-mono">kb_objects</code>) and Inference configuration, returning all biological objects to their original roles evaluated purely from <strong>Biotypes</strong> and <strong>MeSH terms</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmModalOpen(false)}
                disabled={isResetting}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-1.5" />
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
