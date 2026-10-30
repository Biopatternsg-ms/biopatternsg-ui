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

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitBranch,
  RotateCcw,
  SlidersHorizontal,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { StepStatsBar } from "@/components/molecules/StepStatsBar";
import { NodeSearchSelect } from "@/components/molecules/NodeSearchSelect";
import { ForceGraphViewer } from "@/components/organisms/forceGraph/ForceGraphViewer";
import {
  buildTypeColorMap,
  type GraphNodeInput,
  type GraphLinkInput,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import type { GraphBackground } from "@/components/organisms/forceGraph/forceGraphProfiles";
import { filterLinksByValidNodes } from "@/utils/graphDataParser";
import { experimentService } from "@/services/experimentService";
import { cn } from "@/lib/utils";

const BACKGROUND_OPTIONS: { value: GraphBackground; label: string; swatch: string }[] = [
  { value: "black", label: "Dark Canvas", swatch: "rgba(10,10,20,1)" },
  { value: "white", label: "Light Canvas", swatch: "#ffffff" },
  { value: "skyblue", label: "Sky Blue", swatch: "#87ceeb" },
];

function formatRoleLabel(rawRole?: string): string {
  if (!rawRole || !rawRole.trim()) return "Protein";
  const normalized = rawRole.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  switch (normalized) {
    case "protein":
      return "Protein";
    case "gene":
      return "Gene";
    case "enzyme":
      return "Enzyme";
    case "receptor":
      return "Receptor";
    case "ligand":
      return "Ligand";
    case "transcription_factor":
    case "tf":
      return "Transcription Factor";
    case "adaptor_protein":
      return "Adaptor Protein";
    case "disease":
      return "Disease";
    case "variant":
      return "Variant";
    default:
      return normalized
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

export const PathwayGraphView = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [experimentName, setExperimentName] = useState<string>("Experiment Execution");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nodes, setNodes] = useState<GraphNodeInput[]>([]);
  const [links, setLinks] = useState<GraphLinkInput[]>([]);
  const [totalPathways, setTotalPathways] = useState<number>(0);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  const [background, setBackground] = useState<GraphBackground>("black");
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  const loadGraphData = useCallback(
    async (isRefresh = false) => {
      if (!experimentId) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMsg(null);

      try {
        const [pipelineRes, graphRes] = await Promise.all([
          experimentService.getPipelineById(experimentId).catch(() => null),
          experimentService.getPathwayGraph(experimentId),
        ]);

        if (pipelineRes?.name) {
          setExperimentName(pipelineRes.name);
        }

        if (!graphRes || !Array.isArray(graphRes.nodes) || graphRes.nodes.length === 0) {
          setNodes([]);
          setLinks([]);
          setTotalPathways(graphRes?.totalPathways ?? 0);
          setExecutionTimeMs(graphRes?.executionTimeMs ?? 0);
          setErrorMsg(
            "No consolidated pathway graph found in pathway_graphs for this experiment."
          );
          return;
        }

        const mappedNodes: GraphNodeInput[] = graphRes.nodes
          .filter((n) => n && n.name)
          .map((n) => ({
            name: n.name.trim(),
            type: formatRoleLabel(n.type || n.role),
          }));

        const rawLinks: GraphLinkInput[] = (graphRes.edges || [])
          .filter((e) => e && (e.object1 || e.first) && (e.object2 || e.second))
          .map((e) => ({
            object1: (e.object1 || e.first).trim(),
            interaction: (e.interaction || e.relation || "association").trim(),
            object2: (e.object2 || e.second).trim(),
            pathwayCount: e.pathwayCount,
          }));

        const validLinks = filterLinksByValidNodes(mappedNodes, rawLinks);

        setNodes(mappedNodes);
        setLinks(validLinks);
        setTotalPathways(graphRes.totalPathways ?? 0);
        setExecutionTimeMs(graphRes.executionTimeMs ?? 0);
      } catch (err) {
        console.error("Error loading pathway graph:", err);
        setErrorMsg("Failed to load the pathway graph from the inferences service.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [experimentId]
  );

  useEffect(() => {
    void loadGraphData(false);
  }, [loadGraphData]);

  // Global color map built across all nodes so colors remain consistent when filtering
  const typeColorMap = useMemo(() => buildTypeColorMap(nodes), [nodes]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const node of nodes) {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
    return counts;
  }, [nodes]);

  const legendEntries = useMemo(() => Object.entries(typeColorMap), [typeColorMap]);

  // Filtered nodes & links when a role pill is selected
  const { displayedNodes, displayedLinks } = useMemo(() => {
    if (selectedRoleFilter === "ALL") {
      return { displayedNodes: nodes, displayedLinks: links };
    }
    const matchingNodeNames = new Set(
      nodes.filter((n) => n.type === selectedRoleFilter).map((n) => n.name)
    );
    // Include nodes of the selected role + direct neighbors so connections remain visible
    const connectedNames = new Set<string>(matchingNodeNames);
    const filteredEdges = links.filter((l) => {
      if (matchingNodeNames.has(l.object1) || matchingNodeNames.has(l.object2)) {
        connectedNames.add(l.object1);
        connectedNames.add(l.object2);
        return true;
      }
      return false;
    });
    const filteredNodes = nodes.filter((n) => connectedNames.has(n.name));
    return {
      displayedNodes: filteredNodes,
      displayedLinks: filteredEdges,
    };
  }, [nodes, links, selectedRoleFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner className="w-10 h-10 text-primary" />
        <p className="text-sm text-on-surface-variant font-medium animate-pulse">
          Loading inferred biological pathway graph...
        </p>
      </div>
    );
  }

  const executionUrl = `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Header & Breadcrumb */}
      <ManualStepHeader
        networkId={networkId}
        experimentId={experimentId}
        experimentName={experimentName}
        stepTitle="Biological Pathway Graph"
        stepDescription="Interactive force-directed causal network consolidated from SWI-Prolog inferred biological pathways."
        badgeLabel="Pathway Network Graph"
        badgeVariant="completed"
        icon={GitBranch}
        extraBadges={
          <>
            <Badge
              variant="primary"
              className="text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider"
            >
              {totalPathways.toLocaleString()} Inferred Pathways
            </Badge>
            <Badge
              variant="neutral"
              className="text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider"
            >
              {nodes.length} Nodes • {links.length} Edges
            </Badge>
          </>
        }
        actions={
          <Button
            variant="outline"
            size="md"
            disabled={refreshing}
            onClick={() => loadGraphData(true)}
            className="gap-2 font-bold text-xs rounded-xl border-outline-variant/25 hover:bg-surface-container-high"
          >
            <RotateCcw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh Graph
          </Button>
        }
      />

      {/* Empty / Error State */}
      {errorMsg || nodes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="font-headline text-base font-bold text-on-surface">
              Pathway Graph Not Available
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {errorMsg ||
                "There are no inferred pathway graph nodes stored for this pipeline yet. Ensure the 'Infer Biological Pathways' step has completed."}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(executionUrl)}
              className="rounded-xl text-xs font-bold"
            >
              Return to Execution Monitor
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => loadGraphData(true)}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-5">
          {/* Top Stats & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-outline-variant/10">
            <div className="flex flex-wrap items-center gap-3">
              {/* Background Canvas Selector */}
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/15">
                {BACKGROUND_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBackground(opt.value)}
                    aria-pressed={background === opt.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      background === opt.value
                        ? "bg-primary text-on-primary shadow-2xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: opt.swatch }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Search & Focus Node Select */}
              <div className="flex items-center gap-2 w-full sm:w-72">
                <NodeSearchSelect
                  nodes={displayedNodes}
                  typeColorMap={typeColorMap}
                  value={selectedNodeName}
                  onChange={setSelectedNodeName}
                  className="flex-1"
                />
                {selectedNodeName && (
                  <button
                    type="button"
                    onClick={() => setSelectedNodeName(null)}
                    title="Clear selected node"
                    className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <StepStatsBar
              stats={[
                {
                  label: "Pathways Inferred",
                  value: totalPathways.toLocaleString(),
                  valueColor: "text-primary",
                },
                {
                  label: "Nodes",
                  value: `${displayedNodes.length} / ${nodes.length}`,
                },
                {
                  label: "Causal Edges",
                  value: `${displayedLinks.length} / ${links.length}`,
                },
                {
                  label: "Biological Roles",
                  value: legendEntries.length,
                },
                ...(executionTimeMs > 0
                  ? [
                      {
                        label: "Inference Time",
                        value: `${executionTimeMs} ms`,
                      },
                    ]
                  : []),
              ]}
            />
          </div>

          {/* Multiline Biological Role Filter & Color Legend Bar */}
          <div className="flex items-start gap-2 flex-wrap pb-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mr-1 flex items-center gap-1 py-1 shrink-0">
              <SlidersHorizontal className="w-3 h-3" /> Filter by Role:
            </span>

            <button
              type="button"
              onClick={() => setSelectedRoleFilter("ALL")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border",
                selectedRoleFilter === "ALL"
                  ? "bg-primary text-on-primary border-primary shadow-xs"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border-outline-variant/15"
              )}
            >
              All ({nodes.length})
            </button>

            {legendEntries.map(([roleType, color]) => {
              const count = roleCounts[roleType] || 0;
              const isSelected = selectedRoleFilter === roleType;
              return (
                <button
                  key={roleType}
                  type="button"
                  onClick={() =>
                    setSelectedRoleFilter(isSelected ? "ALL" : roleType)
                  }
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border",
                    isSelected
                      ? "bg-primary/15 text-primary border-primary ring-1 ring-primary/30 shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border-outline-variant/15"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{roleType}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Force Graph Canvas */}
          <div className="rounded-2xl border border-outline-variant/20 shadow-ambient overflow-hidden relative">
            <ForceGraphViewer
              nodes={displayedNodes}
              links={displayedLinks}
              typeColorMap={typeColorMap}
              height={680}
              background={background}
              selectedNodeName={selectedNodeName}
              onSelectedNodeChange={setSelectedNodeName}
            />
          </div>

          {/* Helper Footer */}
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80 px-1 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Click on any biological entity node to inspect its incoming and outgoing causal transitions and pathway frequencies.
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant/60">
              Source: pathway_graphs ({experimentId})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathwayGraphView;
