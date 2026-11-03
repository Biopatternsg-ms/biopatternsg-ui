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

import { useState, useEffect, useMemo, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Route as RouteIcon,
  GitBranch,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Hash,
  Eye,
  Star,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { StepStatsBar } from "@/components/molecules/StepStatsBar";
import { PathwayDetailModal } from "@/components/molecules/PathwayDetailModal";
import { cn } from "@/lib/utils";
import { experimentService } from "@/services/experimentService";
import type { GroupedPathway, GroupedPathwaysResponse } from "@/services/models/Pathway";

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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25];

export const PathwayListView = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [experimentName, setExperimentName] = useState<string>("Experiment Execution");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [data, setData] = useState<GroupedPathwaysResponse | null>(null);
  const [unfilteredTotalGroups, setUnfilteredTotalGroups] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(15);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [lengthFilter, setLengthFilter] = useState<number | "ALL">("ALL");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Selected pathway for modal inspection
  const [selectedPathway, setSelectedPathway] = useState<GroupedPathway | null>(null);
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!experimentId) return;
    let isCancelled = false;

    experimentService
      .getPipelineById(experimentId)
      .then((pipelineRes) => {
        if (!isCancelled && pipelineRes?.name) {
          setExperimentName(pipelineRes.name);
        }
      })
      .catch(() => null);

    return () => {
      isCancelled = true;
    };
  }, [experimentId]);

  useEffect(() => {
    if (!experimentId) return;
    let isCancelled = false;

    experimentService
      .getGroupedPathways(experimentId, {
        page,
        size: pageSize,
        length: lengthFilter === "ALL" ? undefined : lengthFilter,
        search: debouncedSearch.trim() || undefined,
        favorite: onlyFavorites ? true : undefined,
      })
      .then((groupedRes) => {
        if (isCancelled) return;
        setData(groupedRes);
        if (lengthFilter === "ALL" && !debouncedSearch.trim() && !onlyFavorites) {
          setUnfilteredTotalGroups(groupedRes.totalGroups);
        }
        setErrorMsg(null);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load biological pathways";
        setErrorMsg(message);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
          setIsPageLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [experimentId, page, pageSize, lengthFilter, debouncedSearch, onlyFavorites]);

  const handleRefresh = async () => {
    if (!experimentId) return;
    setRefreshing(true);
    setIsPageLoading(true);
    setErrorMsg(null);
    try {
      const [pipelineRes, groupedRes] = await Promise.all([
        experimentService.getPipelineById(experimentId).catch(() => null),
        experimentService.getGroupedPathways(experimentId, {
          page,
          size: pageSize,
          length: lengthFilter === "ALL" ? undefined : lengthFilter,
          search: debouncedSearch.trim() || undefined,
          favorite: onlyFavorites ? true : undefined,
        }),
      ]);
      if (pipelineRes?.name) {
        setExperimentName(pipelineRes.name);
      }
      setData(groupedRes);
      if (lengthFilter === "ALL" && !debouncedSearch.trim() && !onlyFavorites) {
        setUnfilteredTotalGroups(groupedRes.totalGroups);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load biological pathways";
      setErrorMsg(message);
    } finally {
      setRefreshing(false);
      setIsPageLoading(false);
    }
  };

  const handlePageChange = (newPage: number | ((prev: number) => number)) => {
    setIsPageLoading(true);
    setPage(newPage);
  };

  const handleSearchChange = (value: string) => {
    setIsPageLoading(true);
    setSearchTerm(value);
    setPage(0);
  };

  const handleLengthFilterChange = (value: number | "ALL") => {
    setIsPageLoading(true);
    setLengthFilter(value);
    setPage(0);
  };

  const handleToggleOnlyFavorites = () => {
    setIsPageLoading(true);
    setOnlyFavorites((prev) => !prev);
    setPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setIsPageLoading(true);
    setPageSize(newSize);
    setPage(0);
  };

  const handleResetFilters = () => {
    setIsPageLoading(true);
    setSearchTerm("");
    setDebouncedSearch("");
    setLengthFilter("ALL");
    setOnlyFavorites(false);
    setPage(0);
  };

  const handleToggleFavorite = async (group: GroupedPathway, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!experimentId) return;

    const newFavorite = !group.favorite;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map((g) =>
          g.groupId === group.groupId ? { ...g, favorite: newFavorite } : g
        ),
      };
    });

    setSelectedPathway((prev) => {
      if (prev && prev.groupId === group.groupId) {
        return { ...prev, favorite: newFavorite };
      }
      return prev;
    });

    try {
      await experimentService.setGroupedPathwayFavorite(experimentId, group.groupId, newFavorite);
    } catch (err) {
      console.error("Failed to update favorite status:", err);
      // Revert optimistic update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          groups: prev.groups.map((g) =>
            g.groupId === group.groupId ? { ...g, favorite: !newFavorite } : g
          ),
        };
      });
      setSelectedPathway((prev) => {
        if (prev && prev.groupId === group.groupId) {
          return { ...prev, favorite: !newFavorite };
        }
        return prev;
      });
    }
  };

  const groups = data?.groups;
  const backendAvailableLengths = data?.availableLengths;

  // Available lengths for filtering
  const availableLengths = useMemo(() => {
    if (backendAvailableLengths && backendAvailableLengths.length > 0) {
      return [...backendAvailableLengths].sort((a, b) => a - b);
    }
    if (!groups) return [];
    const set = new Set<number>();
    groups.forEach((g) => set.add(g.length));
    return Array.from(set).sort((a, b) => a - b);
  }, [backendAvailableLengths, groups]);

  const pagedGroups = groups ?? [];
  const filteredGroupsCount = data?.totalGroups ?? 0;
  const totalGroupsCount = unfilteredTotalGroups ?? filteredGroupsCount;
  const totalRawPathwaysCount = data?.totalRawPathways ?? 0;
  const totalPages = Math.ceil(filteredGroupsCount / pageSize);

  const handleOpenModal = (pathway: GroupedPathway, index: number) => {
    setSelectedPathway(pathway);
    setSelectedPathwayIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPathway(null);
    setSelectedPathwayIndex(undefined);
  };

  if (loading) {
    return (
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading Inferred Biological Pathways..."
        sublabel="Consolidating signaling pathways and transition variants"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <ManualStepHeader
        networkId={networkId}
        experimentId={experimentId}
        experimentName={experimentName}
        stepTitle="Inferred Biological Pathways"
        stepDescription="Consolidated biological signaling pathways grouped by identical ordered entity transitions."
        badgeLabel="Pathways List"
        icon={RouteIcon}
        backHref={`/dashboard/experiments/${networkId}/execution/${experimentId}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5 font-bold text-xs shrink-0 rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/dashboard/experiments/${networkId}/pathway-graph/${experimentId}`)}
              className="gap-1.5 font-bold text-xs shrink-0 shadow-primary-glow"
            >
              <GitBranch className="w-3.5 h-3.5" />
              View Graph
            </Button>
          </div>
        }
      />

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error loading pathways: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-outline-variant/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <StepStatsBar
          stats={[
            {
              label: "Consolidated Groups",
              value: totalGroupsCount.toLocaleString(),
              valueColor: "text-primary font-bold",
            },
            {
              label: "Total Pathways",
              value: totalRawPathwaysCount.toLocaleString(),
              valueColor: "text-emerald-500 font-bold",
            },
            {
              label: "Filtered Groups",
              value: filteredGroupsCount.toLocaleString(),
            },
            {
              label: "Page",
              value: `${totalPages === 0 ? 0 : page + 1} of ${totalPages || 1}`,
            },
          ]}
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by entity name (e.g. RELA, CHOLESTEROL)..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-surface-container-high rounded-xl border border-outline-variant/20 focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls: Favorites + Length Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* Favorites Filter Button */}
          <button
            onClick={handleToggleOnlyFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              onlyFavorites
                ? "bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs"
                : "bg-surface-container-high border border-outline-variant/15 hover:bg-surface-container-highest text-on-surface-variant"
            }`}
            title="Filter only favorite pathways"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyFavorites ? "fill-amber-500 text-amber-500" : "text-on-surface-variant"
              }`}
            />
            Favorites only
          </button>

          {/* Length Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 shrink-0">
            <span className="text-[11px] font-bold text-on-surface-variant mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Length:
            </span>
            <button
              onClick={() => handleLengthFilterChange("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lengthFilter === "ALL"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              All
            </button>
            {availableLengths.map((len) => (
              <button
                key={len}
                onClick={() => handleLengthFilterChange(len)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lengthFilter === len
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {len} {len === 1 ? "step" : "steps"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pathways List Container with loading state */}
      <div className="relative min-h-[300px]">
        {isPageLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-container-lowest/70 backdrop-blur-xs rounded-2xl transition-all animate-in fade-in duration-200">
            <LoadingSpinner
              backdrop={false}
              card={true}
              size="md"
              variant="primary"
              label="Loading page..."
              sublabel="Fetching biological pathways"
            />
          </div>
        )}

        <div className={cn("transition-opacity duration-200", isPageLoading && "opacity-40 pointer-events-none")}>
          {pagedGroups.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-outline-variant/15 flex flex-col items-center justify-center text-center gap-3">
          <RouteIcon className="w-10 h-10 text-on-surface-variant/40" />
          <h3 className="font-headline text-base font-bold text-on-surface">No biological pathways match your criteria</h3>
          <p className="text-xs text-on-surface-variant max-w-md">
            Try adjusting your search term or length filter to inspect the inferred signaling sequences.
          </p>
          {(searchTerm || lengthFilter !== "ALL" || onlyFavorites) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pagedGroups.map((group, gIdx) => {
            const groupGlobalIndex = page * pageSize + gIdx + 1;
            return (
              <div
                key={group.groupId || gIdx}
                onClick={() => handleOpenModal(group, groupGlobalIndex)}
                className="glass-panel p-4 sm:p-4.5 rounded-2xl border border-outline-variant/15 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group"
              >
                {/* Card Top: Index, Pathway Chain & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(group, e)}
                      title={group.favorite ? "Remove from favorites" : "Add to favorites"}
                      className="p-1 rounded-lg hover:bg-surface-container-high transition-colors shrink-0 text-on-surface-variant focus:outline-hidden"
                    >
                      <Star
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          group.favorite
                            ? "fill-amber-400 text-amber-500"
                            : "text-on-surface-variant/40 hover:text-amber-500"
                        }`}
                      />
                    </button>
                    <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                      <Hash className="w-3 h-3" />
                      {groupGlobalIndex}
                    </span>
                    <h3 className="font-headline text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {group.startObject} <span className="text-on-surface-variant font-normal">→</span> {group.endObject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Badge variant="primary" className="text-[10px] font-bold px-2 py-0.5">
                      {group.pathwaysCount.toLocaleString()} {group.pathwaysCount === 1 ? "pathway" : "pathways"}
                    </Badge>
                    <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md border border-outline-variant/15">
                      {group.length} {group.length === 1 ? "step" : "steps"} • {group.objects.length} entities
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(group, groupGlobalIndex);
                      }}
                      className="gap-1 text-xs font-bold px-2.5 py-1 h-auto shrink-0 border border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Button>
                  </div>
                </div>

                {/* Summarized Sequence Chain (Only indicates there is a relation between nodes) */}
                <div className="flex items-center gap-1.5 flex-wrap p-2.5 px-3 bg-surface-container-low/70 rounded-xl border border-outline-variant/10 overflow-x-auto custom-scrollbar">
                  {group.objects.map((obj, oIdx) => {
                    const roleColor = getRoleColor(obj.role);

                    return (
                      <Fragment key={oIdx}>
                        {oIdx > 0 && (
                          <div
                            title="Relation transition"
                            className="flex items-center gap-1 px-1 text-primary/70 shrink-0 font-bold"
                          >
                            <span className="text-[11px]">──</span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 bg-surface-container-highest px-2.5 py-1 rounded-lg border border-outline-variant/20 shadow-xs shrink-0">
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
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredGroupsCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/15 text-xs text-on-surface-variant">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Showing <strong className="text-on-surface">{page * pageSize + 1}</strong> to{" "}
              <strong className="text-on-surface">
                {Math.min((page + 1) * pageSize, filteredGroupsCount)}
              </strong>{" "}
              of <strong className="text-on-surface">{filteredGroupsCount.toLocaleString()}</strong> grouped pathways
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-outline-variant/20">
              <span className="text-[11px] font-medium text-on-surface-variant">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={isPageLoading}
                aria-label="Select rows per page"
                className="bg-surface-container-high text-on-surface text-xs font-bold rounded-lg px-2 py-1 border border-outline-variant/20 focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0 || isPageLoading}
                onClick={() => handlePageChange(0)}
                title="First page"
                className="h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">First</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0 || isPageLoading}
                onClick={() => handlePageChange((p) => Math.max(0, p - 1))}
                title="Previous page"
                className="h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page <= 2) {
                    pageNum = i;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  const isActive = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      disabled={isPageLoading}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "min-w-8 h-8 px-2.5 rounded-xl font-medium text-xs transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                        isActive
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "hover:bg-surface-container-high text-on-surface-variant"
                      )}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1 || isPageLoading}
                onClick={() => handlePageChange((p) => Math.min(totalPages - 1, p + 1))}
                title="Next page"
                className="h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1 || isPageLoading}
                onClick={() => handlePageChange(totalPages - 1)}
                title="Last page"
                className="h-8 px-2 sm:px-2.5 gap-1 text-xs rounded-xl border border-outline-variant/20 hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden md:inline">Last</span>
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <PathwayDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        pathway={selectedPathway}
        pathwayIndex={selectedPathwayIndex}
        experimentName={experimentName}
        onToggleFavorite={(p) => handleToggleFavorite(p)}
      />
    </div>
  );
};

export default PathwayListView;
