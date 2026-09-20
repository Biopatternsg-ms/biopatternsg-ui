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
  Hash,
  Network as NetworkIcon,
  Clock,
  Edit3,
  Lock,
  type LucideIcon
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { experimentService } from "@/services/experimentService";
import { networkService } from "@/services/networkService";
import type { ExperimentExecution, MetricCard, PipelineStepExecution } from "@/services/models/Experiment";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";

const stepIcons: Record<string, LucideIcon> = {
  Sliders: Sliders,
  GitBranch: GitBranch,
  Cpu: Cpu,
  Activity: Activity,
  FileText: FileText,
};

function StepIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = stepIcons[name] || Info;
  return <IconComponent className={className} />;
}

interface ManualStepDefinition {
  routeSegment: string;
  buttonLabel: string;
  buttonIcon: LucideIcon;
}

const MANUAL_STEP_CONFIG: Record<string, ManualStepDefinition> = {
  // Update Aligned Objects
  "step-update_aligned_objects": {
    routeSegment: "aligned-objects",
    buttonLabel: "Edit Aligned Objects",
    buttonIcon: Edit3,
  },
  "UPDATE_ALIGNED_OBJECTS": {
    routeSegment: "aligned-objects",
    buttonLabel: "Edit Aligned Objects",
    buttonIcon: Edit3,
  },
  "Update Aligned Objects": {
    routeSegment: "aligned-objects",
    buttonLabel: "Edit Aligned Objects",
    buttonIcon: Edit3,
  },

  // Configure Inferences
  "step-configure_inferences": {
    routeSegment: "inferences-config",
    buttonLabel: "Configure Inferences",
    buttonIcon: Activity,
  },
  "CONFIGURE_INFERENCES": {
    routeSegment: "inferences-config",
    buttonLabel: "Configure Inferences",
    buttonIcon: Activity,
  },
  "Configure Inferences": {
    routeSegment: "inferences-config",
    buttonLabel: "Configure Inferences",
    buttonIcon: Activity,
  },
};

function getManualStepConfig(step: PipelineStepExecution): ManualStepDefinition | null {
  return MANUAL_STEP_CONFIG[step.id] || MANUAL_STEP_CONFIG[step.name] || null;
}

function getManualStepRoute(step: PipelineStepExecution, networkId?: string, experimentId?: string): string | null {
  const config = getManualStepConfig(step);
  if (!config) return null;
  const netId = networkId || "";
  const expId = experimentId || "";
  return `/dashboard/experiments/${netId}/${config.routeSegment}/${expId}`;
}

export function isUpdateAlignedCompleted(execution?: ExperimentExecution | null): boolean {
  if (!execution || !execution.steps) return false;
  const updateStep = execution.steps.find((s) => {
    const sId = String(s.id || "").toLowerCase();
    const sName = String(s.name || "").toLowerCase();
    const sStep = String((s as { step?: string }).step || "").toLowerCase();
    return (
      sId === "step-update_aligned_objects" ||
      sId === "update_aligned_objects" ||
      sName === "update aligned objects" ||
      sStep === "update_aligned_objects"
    );
  });
  return updateStep?.status === "COMPLETED";
}

export function isStepActionDisabled(step: PipelineStepExecution, execution?: ExperimentExecution | null): boolean {
  const sId = String(step.id || "").toLowerCase();
  const sName = String(step.name || "").toLowerCase();
  const sStep = String((step as { step?: string }).step || "").toLowerCase();

  const isConfigureInferences =
    sId === "step-configure_inferences" ||
    sId === "configure_inferences" ||
    sName === "configure inferences" ||
    sStep === "configure_inferences";

  if (isConfigureInferences) {
    return !isUpdateAlignedCompleted(execution);
  }
  return false;
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

function formatMetricValue(value: string): string {
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

type RawMetricInput = MetricCard[] | Record<string, string | number | boolean | null | undefined>;

function parseRawMetrics(rawMetrics?: RawMetricInput): ParsedMetricItem[] {
  if (!rawMetrics) return [];
  if (Array.isArray(rawMetrics)) {
    return rawMetrics.map((m) => {
      const label = String(m.label || "");
      const value = String(m.value || "");
      return {
        ...m,
        label,
        value,
        isLongText: label.length > 20 || value.length > 25,
      };
    });
  }

  return Object.entries(rawMetrics)
    .filter(([, val]) => val !== null && val !== undefined && val !== "")
    .map(([key, val]) => {
      const label = METRIC_LABELS[key] || key.replace(/([A-Z])/g, " $1").toUpperCase();
      const stringVal = formatMetricValue(String(val));
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
    stepIds: [
      "step-configuration",
      "step-launched",
      "step-1",
      "step-2",
      "CONFIG",
      "LAUNCH",
      "Configuration Setup",
      "Launch Pipeline",
    ],
  },
  {
    id: "BIOLOGICAL_OBJECT",
    name: "Discovery Biological Objects",
    description: "Extracts transcription factors, processes expert biological objects, and configures hierarchy levels.",
    iconName: "Cpu",
    stepIds: [
      "step-transcription_factor",
      "step-expert_objects",
      "step-search_levels",
      "step-3",
      "TRANSCRIPTION_FACTOR",
      "EXPERT_OBJECTS",
      "SEARCH_LEVELS",
      "Transcription Factor Config",
      "Expert Objects Processing",
      "Search Levels Processing",
    ],
  },
  {
    id: "PUBMED_INTEGRATION",
    name: "Build Knowledge Bases",
    description: "Generates combinations, queries PubMed identifiers, extracts PubTator annotations, builds the knowledge base graph, and updates aligned objects.",
    iconName: "GitBranch",
    stepIds: [
      "step-combinations",
      "COMBINATIONS",
      "Pubmed Combinations Generation",
      "step-search_pubmed_ids",
      "SEARCH_PUBMED_IDS",
      "Search PubMed IDs",
      "step-search_pubtator",
      "SEARCH_PUBTATOR",
      "Search PubTator Annotations",
      "step-build_knowledge_base",
      "BUILD_KNOWLEDGE_BASE",
      "Build Knowledge Base Graph",
      "step-generate_aligned_objects",
      "GENERATE_ALIGNED_OBJECTS",
      "Generate Aligned Objects",
      "step-update_aligned_objects",
      "UPDATE_ALIGNED_OBJECTS",
      "Update Aligned Objects",
      "step-configure_inferences",
      "CONFIGURE_INFERENCES",
      "Configure Inferences",
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
        .then((res) => {
          const found = res?.list?.find((n) => n.id === targetNetworkId);
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

  // Initial load
  useEffect(() => {
    let ignore = false;
    async function loadInitialData() {
      if (!experimentId) return;
      try {
        const executionData = await experimentService.getExperimentExecution(experimentId);
        if (!ignore) {
          setData(executionData);

          const computedStages = STAGE_DEFINITIONS.map((def) => {
            const sSteps = executionData.steps.filter((s: PipelineStepExecution) => {
              const sId = String(s.id || "").toLowerCase();
              const sName = String(s.name || "").toLowerCase();
              const sStep = String((s as { step?: string }).step || "").toLowerCase();
              return def.stepIds.some((id) => {
                const target = id.toLowerCase();
                return target === sId || target === sName || target === sStep;
              });
            });
            const hasActive = sSteps.some((s) => s.status === "ACTIVE");
            return { id: def.id, hasActive, count: sSteps.length };
          }).filter((s) => s.count > 0);

          const activeStg = computedStages.find((s) => s.hasActive);
          const defaultStg = activeStg || computedStages[0];
          setSelectedStageId(defaultStg?.id || "INIT");

          setTotalSeconds(parseTimeToSeconds(executionData.totalExecutionTime));
          setPhaseSeconds(parseTimeToSeconds(executionData.currentPhaseDuration));
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError("Error loading execution details");
          console.error("Error loading execution details", err);
          setLoading(false);
        }
      }
    }

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, [experimentId]);

  // Polling loop for active execution (fetches every 3 seconds when pipeline or any step is ACTIVE)
  useEffect(() => {
    if (!data || !experimentId) return;

    const isPipelineActive =
      data.status === "ACTIVE" ||
      data.steps.some((step) => step.status === "ACTIVE");

    if (!isPipelineActive) return;

    let ignore = false;
    const pollInterval = setInterval(async () => {
      try {
        const executionData = await experimentService.getExperimentExecution(experimentId);
        if (!ignore) {
          setData(executionData);
          setTotalSeconds(parseTimeToSeconds(executionData.totalExecutionTime));
          setPhaseSeconds(parseTimeToSeconds(executionData.currentPhaseDuration));
        }
      } catch (err) {
        console.error("Error polling execution status", err);
      }
    }, 3000);

    return () => {
      ignore = true;
      clearInterval(pollInterval);
    };
  }, [data, experimentId]);

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
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading execution details..."
        sublabel="Fetching pipeline sequence and execution status"
      />
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
  const isStepInStage = (step: PipelineStepExecution, stepIds: string[]) => {
    const sId = String(step.id || "").toLowerCase();
    const sName = String(step.name || "").toLowerCase();
    const sStep = String((step as { step?: string }).step || "").toLowerCase();
    return stepIds.some((id) => {
      const target = id.toLowerCase();
      return target === sId || target === sName || target === sStep;
    });
  };

  const allStageStepIds = STAGE_DEFINITIONS.flatMap((def) => def.stepIds);
  const unmatchedSteps = data.steps.filter((step) => !isStepInStage(step, allStageStepIds));

  const stages = STAGE_DEFINITIONS.map((def) => {
    const stageSteps = data.steps.filter((step) => isStepInStage(step, def.stepIds));
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

  const selectedStageDuration = selectedStage
    ? (() => {
        const totalSecs = selectedStage.steps.reduce((acc, step) => {
          return acc + parseTimeToSeconds(step.duration);
        }, 0);
        return totalSecs > 0 ? formatSecondsToMs(totalSecs) : undefined;
      })()
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
                          const manualRoute = getManualStepRoute(step, networkId || data.networkId, experimentId);
                          const isManualStep = step.isManual || !!manualRoute;
                          const stepDisabled = isStepActionDisabled(step, data);
                          const canNavigate = manualRoute && !isStepCompleted && !stepDisabled;

                          return (
                            <div
                              key={step.id}
                              className="flex items-center justify-between gap-3 px-2 py-1 rounded-lg transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isStepCompleted ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : stepDisabled ? (
                                  <Lock className="w-3.5 h-3.5 text-outline-variant/60 shrink-0" />
                                ) : isManualStep ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                ) : isStepActive ? (
                                  <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                                ) : isStepFailed ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-outline-variant/60 shrink-0" />
                                )}
                                <span
                                  onClick={(e) => {
                                    if (canNavigate) {
                                      e.stopPropagation();
                                      navigate(manualRoute);
                                    }
                                  }}
                                  title={stepDisabled ? "Requires 'Update Aligned Objects' to be completed first" : undefined}
                                  className={`text-[12px] truncate ${
                                    canNavigate
                                      ? "text-primary font-bold hover:underline cursor-pointer"
                                      : stepDisabled || isStepPending
                                      ? "text-on-surface-variant/40 cursor-not-allowed"
                                      : "text-on-surface/90 font-medium"
                                  }`}
                                >
                                  {step.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {manualRoute && !isStepCompleted ? (
                                  <button
                                    onClick={(e) => {
                                      if (canNavigate) {
                                        e.stopPropagation();
                                        navigate(manualRoute);
                                      }
                                    }}
                                    disabled={stepDisabled}
                                    title={
                                      stepDisabled
                                        ? "Requires 'Update Aligned Objects' to be completed first"
                                        : `Open and edit ${step.name}`
                                    }
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] transition-all shrink-0 ${
                                      stepDisabled
                                        ? "bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
                                        : "bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
                                    }`}
                                  >
                                    {stepDisabled ? <Lock className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                                    <span>{stepDisabled ? "Locked" : "Edit"}</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-on-surface-variant/60 font-medium whitespace-nowrap">
                                    {isStepActive ? (
                                      <span className="text-amber-500 font-bold">Running</span>
                                    ) : (
                                      step.duration || "--:--"
                                    )}
                                  </span>
                                )}
                              </div>
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

        {/* Right: Stage Step Details View */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {selectedStage ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6">
              {/* Stage Top Banner */}
              <div className="flex flex-col gap-3 pb-6 border-b border-outline-variant/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0">
                      <StepIcon name={selectedStage.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline text-xl font-black text-on-surface tracking-tight">
                          {selectedStage.name}
                        </h2>
                        <Badge
                          variant={
                            selectedStage.status === "COMPLETED"
                              ? "completed"
                              : selectedStage.status === "ACTIVE"
                              ? "inProgress"
                              : selectedStage.status === "FAILED"
                              ? "failed"
                              : "pending"
                          }
                          className="text-[9px] px-2 py-0.5"
                        >
                          {selectedStage.status}
                        </Badge>
                      </div>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        {selectedStage.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {selectedStage.status === "COMPLETED" ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5 font-bold" />
                        Stage Completed
                      </span>
                    ) : selectedStage.status === "ACTIVE" ? (
                      <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Stage In Progress
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Stage Timing Info */}
                <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 pt-2 flex-wrap">
                  {selectedStageStartTime && (
                    <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Started: {formatLocalDateTime(selectedStageStartTime)}
                    </span>
                  )}
                  {selectedStageDuration && (
                    <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Duration: {selectedStageDuration}
                    </span>
                  )}
                  {selectedStage.status === "ACTIVE" && (
                    <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Current Stage: {displayPhaseTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-steps Checklist details for Stage */}
              {selectedStage.steps && selectedStage.steps.length > 0 && (() => {
                const visibleSteps = selectedStage.steps.filter((step) => {
                  const stepMetrics = parseRawMetrics(step.metrics);
                  const isManualStep = step.isManual || !!getManualStepRoute(step, networkId || data.networkId, experimentId);
                  return stepMetrics.length > 0 || isManualStep;
                });

                if (visibleSteps.length === 0) return null;

                return (
                  <div className="flex flex-col gap-3 mt-2 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Stage Pipeline Steps
                    </h4>
                    <div className={`grid gap-4 mt-1 ${visibleSteps.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                      {visibleSteps.map((step, sIdx) => {
                        const stepMetrics = parseRawMetrics(step.metrics);
                        const manualRoute = getManualStepRoute(step, networkId || data.networkId, experimentId);
                        const manualConfig = getManualStepConfig(step);
                        const isManualStep = step.isManual || !!manualRoute;
                        const stepDisabled = isStepActionDisabled(step, data);
                        const isStepCompleted = step.status === "COMPLETED";
                        const ActionIcon = manualConfig?.buttonIcon || Edit3;

                        return (
                          <div
                            key={sIdx}
                            className={`flex flex-col bg-surface-card p-4 rounded-xl border shadow-sm gap-3 ${
                              isManualStep ? "border-primary/30 ring-1 ring-primary/10" : "border-outline-variant/15"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {isStepCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 font-black" />
                                </div>
                              ) : stepDisabled ? (
                                <div className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant/60 flex items-center justify-center shrink-0 mt-0.5">
                                  <Lock className="w-3 h-3" />
                                </div>
                              ) : isManualStep ? (
                                <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-300/60 flex items-center justify-center shrink-0 mt-0.5">
                                  <Clock className="w-3 h-3 font-bold" />
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
                                      step.status === "PENDING" || stepDisabled ? "text-on-surface-variant/40" : "text-on-surface"
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

                            {/* Manual Step Action Banner */}
                            {manualRoute && (
                              <div className={`mt-1 flex items-center justify-between p-2.5 rounded-xl border gap-2 ${
                                stepDisabled
                                  ? "bg-surface-container-low border-outline-variant/20 opacity-75"
                                  : "bg-primary/5 border-primary/20"
                              }`}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {stepDisabled && <Lock className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />}
                                  <span className={`text-[11px] font-semibold truncate ${
                                    stepDisabled ? "text-on-surface-variant/70" : "text-primary"
                                  }`}>
                                    {stepDisabled
                                      ? "Requires completion of 'Update Aligned Objects'"
                                      : isStepCompleted
                                      ? "Step Configured"
                                      : "Manual Action Required"}
                                  </span>
                                </div>
                                <Button
                                  variant={stepDisabled ? "outline" : "primary"}
                                  size="sm"
                                  disabled={stepDisabled}
                                  onClick={() => !stepDisabled && navigate(manualRoute)}
                                  className={`gap-1.5 font-bold text-xs shrink-0 ${
                                    stepDisabled ? "cursor-not-allowed opacity-60" : "shadow-primary-glow"
                                  }`}
                                >
                                  {stepDisabled ? <Lock className="w-3.5 h-3.5" /> : <ActionIcon className="w-3.5 h-3.5" />}
                                  {manualConfig?.buttonLabel || "Configure Step"}
                                </Button>
                              </div>
                            )}

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
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-on-surface-variant italic">
                Select a stage to view its details.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentExecutionView;
