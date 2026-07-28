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

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Check,
  Circle,
  Sliders,
  GitBranch,
  Cpu,
  Activity,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Microscope,
  Info,
  Clock,
  Hash,
  Network as NetworkIcon,
  type LucideIcon
} from "lucide-react";
import { experimentService } from "@/services/experimentService";
import { networkService } from "@/services/networkService";
import type { ExperimentExecution } from "@/services/models/Experiment";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";

const stepIcons: Record<string, LucideIcon> = {
  Sliders: Sliders,
  GitBranch: GitBranch,
  Cpu: Cpu,
  Activity: Activity,
  FileText: FileText
};

function StepIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = stepIcons[name] || Info;
  return <IconComponent className={className} />;
}

const METRIC_LABELS: Record<string, string> = {
  // Initialization Stage
  expertObjectsConfigured: "CONFIGURED EXPERT OBJECTS",
  expertObjectSymbols: "EXPERT OBJECTS",
  searchLevels: "SEARCH LEVELS",
  retMax: "PUBMED LIMIT (RETMAX)",
  maxComplexes: "MAX COMPLEXES",
  useOnlyPrincipalName: "USE ONLY PRINCIPAL NAME",
  tfSources: "TF SOURCES",
  promoterRegion: "PROMOTER REGION",
  genome: "REGISTERED GENOME",
  chromosome: "CHROMOSOME",

  // Biological Objects Stage
  transcriptionFactorsFound: "TRANSCRIPTION FACTORS FOUND",
  expertObjectsValidated: "EXPERT OBJECTS VALIDATED",
  totalMinedObjects: "TOTAL MINED OBJECTS",

  // PubMed Integration Stage
  combinationsGenerated: "PUBMED COMBINATIONS GENERATED",
  pubmedIdsFound: "PUBMED IDS FOUND",
  pairsSearched: "PAIRS SEARCHED",
  pmidsAnnotated: "ANNOTATED PMIDS (PUBTATOR)",
  pmidsNotFound: "PMIDS WITHOUT EVENTS",
  kbEventsGenerated: "KNOWLEDGE BASE EVENTS",
  pmidsProcessed: "PMIDS PROCESSED (KB)",
  pmidsWithErrors: "PMIDS WITH ERRORS (KB)",
  alignedObjects: "ALIGNED OBJECTS",
  notAlignedObjects: "UNALIGNED OBJECTS",
};

function formatMetricValue(key: string, value: string): string {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

interface ParsedMetricItem {
  label: string;
  value: string;
  isLongText?: boolean;
  hasWarnings?: boolean;
  subLabel?: string;
  subLabelColor?: string;
  progress?: number;
}

function parseRawMetrics(rawMetrics?: any): ParsedMetricItem[] {
  if (!rawMetrics) return [];
  if (Array.isArray(rawMetrics)) {
    return rawMetrics.map((m: any) => {
      const label = String(m.label || "");
      const value = String(m.value || "");
      return {
        ...m,
        isLongText: label.length > 20 || value.length > 25,
      };
    });
  }
  if (typeof rawMetrics !== "object") return [];

  return Object.entries(rawMetrics)
    .filter(([_, val]) => val !== null && val !== undefined && val !== "")
    .map(([key, val]) => {
      const label = METRIC_LABELS[key] || key.replace(/([A-Z])/g, " $1").toUpperCase();
      const stringVal = formatMetricValue(key, String(val));
      const isLongText =
        label.length > 20 ||
        stringVal.length > 25 ||
        key === "promoterRegion" ||
        key === "expertObjectSymbols" ||
        key === "tfSources";

      return {
        label,
        value: stringVal,
        isLongText,
      };
    });
}

// Helper to parse "hh:mm:ss" to total seconds
function parseTimeToSeconds(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

// Helper to format seconds to "hh:mm:ss"
function formatSecondsToHms(totalSecs: number): string {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0")
  ].join(":");
}

// Helper to format seconds to "mm:ss"
function formatSecondsToMs(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Helper to format ISO timestamp or date-string to local user date and time
function formatLocalDateTime(isoTimeStr?: string): string {
  if (!isoTimeStr) return "";
  const date = new Date(isoTimeStr);
  if (isNaN(date.getTime())) return isoTimeStr; // Fallback if simple string
  return date.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

const STAGE_DEFINITIONS = [
  {
    id: "INIT",
    name: "Initialization",
    description: "Configures initial pipeline parameters, validates input payload, and sets up network metadata.",
    iconName: "Sliders",
    stepIds: ["step-configuration", "step-launched", "step-1", "step-2"],
  },
  {
    id: "BIOLOGICAL_OBJECT",
    name: "Biological Objects",
    description: "Extracts transcription factors, processes expert biological objects, and configures hierarchy levels.",
    iconName: "Cpu",
    stepIds: ["step-transcription_factor", "step-expert_objects", "step-search_levels", "step-3"],
  },
  {
    id: "PUBMED_INTEGRATION",
    name: "PubMed Integration",
    description: "Generates combinations, queries PubMed identifiers, extracts PubTator annotations, and builds the knowledge base graph.",
    iconName: "GitBranch",
    stepIds: [
      "step-combinations",
      "step-search_pubmed_ids",
      "step-search_pubtator",
      "step-build_knowledge_base",
      "step-generate_aligned_objects",
      "step-4",
      "step-5",
    ],
  },
];

const ExperimentExecutionView = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExperimentExecution | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);

  // Fetch Network details
  useEffect(() => {
    const targetNetworkId = networkId || data?.networkId;
    if (targetNetworkId) {
      networkService
        .getNetworks()
        .then((networks) => {
          const found = networks.find((n) => n.id === targetNetworkId);
          if (found) {
            setNetworkName(found.name);
          }
        })
        .catch((err) => console.warn("Failed to fetch network details", err));
    }
  }, [networkId, data?.networkId]);

  // Live timer & polling states
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchExecutionData = async (isInitial = false) => {
    if (!experimentId) return;
    try {
      if (isInitial) setLoading(true);
      const executionData = await experimentService.getExperimentExecution(experimentId);
      setData(executionData);

      if (isInitial) {
        const computedStages = STAGE_DEFINITIONS.map((def) => {
          const sSteps = executionData.steps.filter((s) => def.stepIds.includes(s.id));
          const hasActive = sSteps.some((s) => s.status === "ACTIVE");
          return { id: def.id, hasActive, count: sSteps.length };
        }).filter((s) => s.count > 0);

        const activeStg = computedStages.find((s) => s.hasActive);
        const defaultStg = activeStg || computedStages[0];
        setSelectedStageId(defaultStg?.id || "INIT");
      }

      setTotalSeconds(parseTimeToSeconds(executionData.totalExecutionTime));
      setPhaseSeconds(parseTimeToSeconds(executionData.currentPhaseDuration));
    } catch (err) {
      if (isInitial) setError("Error loading execution details");
      console.error("Error polling execution status", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExecutionData(true);
  }, [experimentId]);

  // Polling loop for active execution (fetches every 3 seconds when pipeline or any step is ACTIVE)
  useEffect(() => {
    if (!data) return;

    const isPipelineActive =
      data.status === "ACTIVE" ||
      data.steps.some((step) => step.status === "ACTIVE");

    if (!isPipelineActive) return;

    const pollInterval = setInterval(() => {
      fetchExecutionData(false);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [data?.status, experimentId]);

  // Ticker for live UI counter
  useEffect(() => {
    if (!data || data.status !== "ACTIVE") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setPhaseSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant text-sm font-medium">Loading execution details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-on-surface font-semibold text-lg">{error || "Failed to load execution details"}</p>
        <Button variant="ghost" onClick={() => navigate(`/dashboard/experiments/${networkId}`)}>
          Back to Experiments
        </Button>
      </div>
    );
  }

  // Format dynamic ticking values
  const displayTotalTime = formatSecondsToHms(totalSeconds);
  const displayPhaseTime = formatSecondsToMs(phaseSeconds);

  // Group steps by stages
  const matchedStepIds = new Set(STAGE_DEFINITIONS.flatMap((def) => def.stepIds));
  const unmatchedSteps = data ? data.steps.filter((step) => !matchedStepIds.has(step.id)) : [];

  const stages = STAGE_DEFINITIONS.map((def) => {
    const stageSteps = data ? data.steps.filter((step) => def.stepIds.includes(step.id)) : [];
    let status: "COMPLETED" | "ACTIVE" | "PENDING" | "FAILED" = "PENDING";
    if (stageSteps.length > 0) {
      const hasFailed = stageSteps.some((s) => s.status === "FAILED");
      const hasActive = stageSteps.some((s) => s.status === "ACTIVE");
      const allCompleted = stageSteps.every((s) => s.status === "COMPLETED");
      const allPending = stageSteps.every((s) => s.status === "PENDING");

      if (hasFailed) status = "FAILED";
      else if (hasActive) status = "ACTIVE";
      else if (allCompleted) status = "COMPLETED";
      else if (allPending) status = "PENDING";
      else status = "ACTIVE";
    }
    return {
      ...def,
      steps: stageSteps,
      status,
    };
  });

  if (unmatchedSteps.length > 0 && stages.length > 0) {
    const lastStage = stages[stages.length - 1];
    lastStage.steps = [...lastStage.steps, ...unmatchedSteps];
    const hasFailed = lastStage.steps.some((s) => s.status === "FAILED");
    const hasActive = lastStage.steps.some((s) => s.status === "ACTIVE");
    const allCompleted = lastStage.steps.every((s) => s.status === "COMPLETED");
    const allPending = lastStage.steps.every((s) => s.status === "PENDING");
    if (hasFailed) lastStage.status = "FAILED";
    else if (hasActive) lastStage.status = "ACTIVE";
    else if (allCompleted) lastStage.status = "COMPLETED";
    else if (allPending) lastStage.status = "PENDING";
    else lastStage.status = "ACTIVE";
  }

  const activeStages = stages.filter((stage) => stage.steps.length > 0);
  const selectedStage = activeStages.find((s) => s.id === selectedStageId) || activeStages[0];

  const selectedStageStartTime = selectedStage
    ? selectedStage.steps.find((step) => step.startTime)?.startTime
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation & Back Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumb
          items={
            networkId
              ? [
                  { label: "Networks", href: "/dashboard/network" },
                  { label: "Experiments", href: `/dashboard/experiments/${networkId}` },
                  { label: data.experimentName },
                  { label: "Execution" },
                ]
              : [{ label: "Experiments" }, { label: data.experimentName }, { label: "Execution" }]
          }
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(networkId ? `/dashboard/experiments/${networkId}` : "/dashboard/network")}
          className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-lg border border-outline-variant/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Experiments
        </Button>
      </div>

      {/* Page Header: Icon + Title + Status */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed shadow-sm">
          <Microscope className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
              {data.experimentName}
            </h1>
            <Badge
              variant={
                data.status === "ACTIVE"
                  ? "inProgress"
                  : data.status === "COMPLETED"
                  ? "completed"
                  : data.status === "FAILED"
                  ? "failed"
                  : "pending"
              }
              className="text-[9px] px-2 py-0.5"
            >
              {data.status === "ACTIVE" && <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
              {data.status}
            </Badge>
          </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant/15 text-xs">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span className="text-on-surface-variant font-medium">ID:</span>
                <code className="font-mono font-bold text-primary text-xs select-all">
                  {data.experimentId}
                </code>
              </div>

              {(networkId || data.networkId) && (
                <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant/15 text-xs">
                  <NetworkIcon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-on-surface-variant font-medium">Network:</span>
                  <Link
                    to={`/dashboard/experiments/${networkId || data.networkId}`}
                    className="font-bold hover:underline text-primary"
                  >
                    {networkName || networkId || data.networkId}
                  </Link>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline Sidebar & Right Stage View */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-2">
        {/* Left: Pipeline Sequence Timeline */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6 h-full min-h-[500px]">
            <h3 className="font-label font-bold text-xs tracking-widest text-on-surface-variant uppercase border-b border-outline-variant/10 pb-3">
              Pipeline Sequence
            </h3>

            {/* Stepper Steps Container */}
            <div className="relative flex flex-col gap-6 pl-4 flex-1">
              {/* Vertical line through timeline steps */}
              <div className="absolute left-[33px] top-6 bottom-6 w-[2px] bg-outline-variant/20 z-0" />

              {activeStages.map((stage) => {
                const isSelectedStage = stage.id === selectedStage?.id;
                const isStageCompleted = stage.status === "COMPLETED";
                const isStageActive = stage.status === "ACTIVE";
                const isStagePending = stage.status === "PENDING";
                const isStageFailed = stage.status === "FAILED";

                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`relative z-10 flex gap-4 cursor-pointer group transition-all rounded-2xl p-3.5 select-none -mx-2 border ${
                      isSelectedStage
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {/* Bullet Indicator */}
                    <div className="flex items-start justify-center pt-0.5">
                      {isStageCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      ) : isStageActive ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 ring-4 ring-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        </div>
                      ) : isStageFailed ? (
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 font-bold" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-surface border border-outline-variant text-on-surface-variant flex items-center justify-center shrink-0">
                          <Circle className="w-3.5 h-3.5 text-outline-variant" />
                        </div>
                      )}
                    </div>

                    {/* Stage Information */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <h4
                        className={`font-headline text-sm font-bold tracking-tight transition-colors ${
                          isSelectedStage
                            ? "text-primary"
                            : isStagePending
                            ? "text-on-surface-variant/50"
                            : "text-on-surface group-hover:text-primary"
                        }`}
                      >
                        {stage.name}
                      </h4>

                      {/* List of steps belonging to this stage */}
                      <div className="flex flex-col gap-1.5 pl-1 mt-1">
                        {stage.steps.map((step) => {
                          const isStepCompleted = step.status === "COMPLETED";
                          const isStepActive = step.status === "ACTIVE";
                          const isStepPending = step.status === "PENDING";
                          const isStepFailed = step.status === "FAILED";

                          return (
                            <div
                              key={step.id}
                              className="flex items-center justify-between gap-3 px-2 py-1 rounded-lg transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isStepCompleted ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : isStepActive ? (
                                  <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                                ) : isStepFailed ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-outline-variant/60 shrink-0" />
                                )}
                                <span
                                  className={`text-[12px] truncate ${
                                    isStepPending
                                      ? "text-on-surface-variant/40"
                                      : "text-on-surface/90 font-medium"
                                  }`}
                                >
                                  {step.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-on-surface-variant/60 font-medium whitespace-nowrap">
                                {isStepActive ? (
                                  <span className="text-amber-500 font-semibold animate-pulse">
                                    {displayPhaseTime}
                                  </span>
                                ) : step.duration ? (
                                  step.duration
                                ) : isStepPending ? (
                                  "Awaiting"
                                ) : (
                                  ""
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Stage Status View */}
        <div className="w-full lg:w-2/3">
          <div className="bg-surface-card p-8 rounded-3xl border border-outline-variant/15 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background glowing orb design */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            {selectedStage ? (
              <div className="flex-1 flex flex-col gap-6">
                {/* Detail Section Title, Description, and Timers */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-outline-variant/10">
                  {/* Left: Stage Info */}
                  <div className="flex gap-4">
                    <div className="p-3 bg-secondary-container text-primary-container rounded-2xl shrink-0 self-start shadow-sm">
                      <StepIcon name={selectedStage.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                          {selectedStage.name}
                        </h2>
                        <Badge
                          variant={
                            selectedStage.status === "ACTIVE"
                              ? "inProgress"
                              : selectedStage.status === "COMPLETED"
                              ? "completed"
                              : selectedStage.status === "FAILED"
                              ? "failed"
                              : "pending"
                          }
                          className="text-[9px] px-2 py-0.5"
                        >
                          {selectedStage.status}
                        </Badge>
                      </div>
                      <p className="text-on-surface-variant font-body text-sm max-w-xl mt-1.5 leading-relaxed">
                        {selectedStage.description}
                      </p>
                      {selectedStageStartTime && (
                        <p className="text-xs font-semibold text-primary-container mt-2 font-label">
                          Start Time: {formatLocalDateTime(selectedStageStartTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Global & Stage Timers */}
                  <div className="text-right flex flex-col min-w-[140px] border-l md:border-l border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0 pl-0 md:pl-6 self-stretch md:self-auto justify-center">
                    <span className="font-label font-bold text-[10px] tracking-widest text-on-surface-variant uppercase">
                      Total Execution Time
                    </span>
                    <span className="font-headline text-3xl font-black text-on-surface tracking-tight mt-1 font-label">
                      {selectedStage.status === "ACTIVE" ? displayTotalTime : data.totalExecutionTime}
                    </span>
                    {selectedStage.status === "ACTIVE" && (
                      <span className="text-[11px] font-semibold text-primary mt-1 font-label">
                        Current Stage: {displayPhaseTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-steps Checklist details for Stage */}
                {selectedStage.steps && selectedStage.steps.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Stage Pipeline Steps
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      {selectedStage.steps.map((step, sIdx) => {
                        const stepMetrics = parseRawMetrics(step.metrics);

                        return (
                          <div
                            key={sIdx}
                            className="flex flex-col bg-surface-card p-4 rounded-xl border border-outline-variant/15 shadow-sm gap-3"
                          >
                            <div className="flex items-start gap-3">
                              {step.status === "COMPLETED" ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 font-black" />
                                </div>
                              ) : step.status === "ACTIVE" ? (
                                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse mt-0.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                </div>
                              ) : step.status === "FAILED" ? (
                                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <AlertTriangle className="w-3 h-3 font-black" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-outline-variant shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-xs font-bold truncate ${
                                      step.status === "PENDING" ? "text-on-surface-variant/40" : "text-on-surface"
                                    }`}
                                  >
                                    {step.name}
                                  </span>
                                  {step.duration && (
                                    <span className="text-[10px] text-on-surface-variant/60 font-medium whitespace-nowrap">
                                      {step.duration}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-on-surface-variant/70 mt-1 leading-snug">
                                  {step.description}
                                </p>
                              </div>
                            </div>

                            {/* Render step metrics directly inside the step card */}
                            {stepMetrics.length > 0 && (
                              <div className="pt-3 border-t border-outline-variant/10 flex flex-col gap-2.5 mt-1">
                                {stepMetrics.map((metric, mIdx) => (
                                  <div
                                    key={mIdx}
                                    className="bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/10 flex flex-col w-full gap-1.5"
                                  >
                                    <span className="font-label font-bold text-[9px] tracking-wider text-on-surface-variant/75 uppercase break-words">
                                      {metric.label}
                                    </span>
                                    <div className="max-h-24 overflow-y-auto font-mono text-[11px] font-semibold text-on-surface bg-surface-container-lowest/90 p-2 rounded-md border border-outline-variant/15 break-all select-all leading-relaxed custom-scrollbar">
                                      {metric.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-on-surface-variant italic">
                Select a stage to view its details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentExecutionView;
