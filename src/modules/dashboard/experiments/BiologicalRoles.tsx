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
  Dna,
  ArrowLeft,
  Search,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { experimentService } from "@/services/experimentService";
import type { ExperimentExecution, InferenceResponse } from "@/services/models/Experiment";

import { CATEGORY_STYLES, CATEGORIES_LIST } from "@/config/biologicalCategories";

export default function BiologicalRoles() {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<ExperimentExecution | null>(null);
  const [inferenceData, setInferenceData] = useState<InferenceResponse | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!experimentId) return;
      try {
        setLoading(true);
        const [exec, inf] = await Promise.all([
          experimentService.getExperimentExecution(experimentId),
          experimentService.getInferenceByPipelineId(experimentId),
        ]);

        if (!ignore) {
          setExperimentData(exec);
          setInferenceData(inf);
        }
      } catch (err) {
        console.error("Error loading biological roles data", err);
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
  }, [experimentId]);

  const rolesMap = inferenceData?.roles || {};
  const entityList = useMemo(() => {
    return Object.entries(rolesMap).map(([symbol, rolesVal]) => {
      const activeRoles: string[] = Array.isArray(rolesVal)
        ? rolesVal
        : Object.entries((rolesVal as Record<string, boolean>) || {})
            .filter(([, active]) => active)
            .map(([role]) => role);
      return {
        symbol,
        activeRoles,
        hasActiveRoles: activeRoles.length > 0,
      };
    });
  }, [rolesMap]);

  // Statistics
  const totalEntities = entityList.length;
  const entitiesWithActive = entityList.filter((e) => e.hasActiveRoles).length;
  const coveragePercent = totalEntities > 0 ? Math.round((entitiesWithActive / totalEntities) * 100) : 0;

  // Filtered entities
  const filteredEntities = useMemo(() => {
    return entityList.filter((entity) => {
      const matchesSearch = entity.symbol.toLowerCase().includes(searchTerm.toLowerCase().trim());
      if (!matchesSearch) return false;
      if (selectedCategory === "ALL") return true;
      if (selectedCategory === "ACTIVE_ONLY") return entity.hasActiveRoles;
      return entity.activeRoles.includes(selectedCategory);
    });
  }, [entityList, searchTerm, selectedCategory]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: totalEntities, ACTIVE_ONLY: entitiesWithActive };
    CATEGORIES_LIST.forEach((cat) => {
      counts[cat.key] = entityList.filter((e) => e.activeRoles.includes(cat.key)).length;
    });
    return counts;
  }, [entityList, totalEntities, entitiesWithActive]);

  if (loading) {
    return (
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading biological roles..."
        sublabel="Querying MeSH ontology inferences and entity classifications"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumb
          items={
            networkId
              ? [
                  { label: "Networks", href: "/dashboard/network" },
                  { label: "Experiments", href: `/dashboard/experiments/${networkId}` },
                  {
                    label: experimentData?.experimentName || "Experiment",
                    href: `/dashboard/experiments/${networkId}/execution/${experimentId}`,
                  },
                  { label: "Biological Roles" },
                ]
              : [
                  { label: "Experiments" },
                  { label: experimentData?.experimentName || "Experiment" },
                  { label: "Biological Roles" },
                ]
          }
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(
              `/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`
            )
          }
          className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-lg border border-outline-variant/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Execution Monitor
        </Button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-card p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shrink-0 shadow-sm">
            <Dna className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                Biological Roles Discovery
              </h1>
              <Badge variant="inProgress" className="text-[9px] px-2 py-0.5 font-bold">
                MeSH Ontology Classification
              </Badge>
              {inferenceData?.restrictionLevel && (
                <Badge variant="pending" className="text-[9px] px-2 py-0.5 font-bold bg-primary/10 text-primary">
                  {inferenceData.restrictionLevel.replace("_", " ")}
                </Badge>
              )}
            </div>
            <p className="text-on-surface-variant font-body text-xs max-w-2xl mt-1 leading-relaxed">
              Exploration of biological roles identified through BFS ontology traversal over the MeSH hierarchy for aligned entities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (experimentId) {
                setLoading(true);
                Promise.all([
                  experimentService.getExperimentExecution(experimentId),
                  experimentService.getInferenceByPipelineId(experimentId),
                ]).then(([exec, inf]) => {
                  setExperimentData(exec);
                  setInferenceData(inf);
                  setLoading(false);
                });
              }
            }}
            className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-xl border border-outline-variant/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                `/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`
              )
            }
            className="gap-2 font-bold shadow-primary-glow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Pipeline
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              Total Evaluated
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-1 font-headline">{totalEntities}</h3>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Aligned entities checked</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              Entities with Roles
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-headline">
              {entitiesWithActive}
            </h3>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Matched ≥ 1 category</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              Roles Coverage
            </p>
            <h3 className="text-2xl font-black text-on-surface mt-1 font-headline">{coveragePercent}%</h3>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Classification rate</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              Strategy
            </p>
            <h3 className="text-lg font-black text-on-surface mt-1 font-headline truncate">
              {inferenceData?.restrictionLevel ? inferenceData.restrictionLevel.replace("_", " ") : "VERY RESTRICTED"}
            </h3>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">BFS MeSH Traversal</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="bg-surface-card p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search entity by symbol (e.g. CYP7A1, FXR, TP53)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Showing {filteredEntities.length} of {totalEntities} entities</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-outline-variant/10">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            All Entities
            <span className="text-[10px] opacity-80">({categoryCounts.ALL || 0})</span>
          </button>

          <button
            onClick={() => setSelectedCategory("ACTIVE_ONLY")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === "ACTIVE_ONLY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            With Active Roles
            <span className="text-[10px] opacity-80">({categoryCounts.ACTIVE_ONLY || 0})</span>
          </button>

          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const style = CATEGORY_STYLES[cat.key];
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${style.bg} ${style.text} border ${style.border} shadow-sm font-bold ring-2 ring-primary/20`
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {cat.label}
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Entity Cards */}
      {filteredEntities.length === 0 ? (
        <div className="bg-surface-card p-12 rounded-3xl border border-outline-variant/15 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/50">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="font-headline font-bold text-base text-on-surface">No entities found</h4>
          <p className="text-xs text-on-surface-variant max-w-sm">
            {searchTerm
              ? `No biological objects matched your search term "${searchTerm}".`
              : "No biological roles identified for the selected filter."}
          </p>
          {(searchTerm || selectedCategory !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
              }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <div
              key={entity.symbol}
              className="bg-surface-card p-4 rounded-2xl border border-outline-variant/15 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-center justify-between gap-2 border-b border-outline-variant/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Dna className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface font-headline leading-tight">
                      {entity.symbol}
                    </h4>
                  </div>
                </div>
                <Badge
                  variant={entity.hasActiveRoles ? "completed" : "pending"}
                  className="text-[9px] px-2 py-0.5 font-bold shrink-0"
                >
                  {entity.activeRoles.length} {entity.activeRoles.length === 1 ? "role" : "roles"}
                </Badge>
              </div>

              {/* Roles Badges */}
              <div className="flex flex-wrap gap-1.5 min-h-[44px] items-start">
                {CATEGORIES_LIST.map((cat) => {
                  const isActive = entity.activeRoles.includes(cat.key);
                  const style = CATEGORY_STYLES[cat.key];

                  if (isActive) {
                    return (
                      <span
                        key={cat.key}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${style.bg} ${style.text} ${style.border}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {style.label}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={cat.key}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-on-surface-variant/40 bg-surface-container-high/40 border border-transparent"
                    >
                      {cat.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
