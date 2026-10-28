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
  Activity,
  ArrowLeft,
  CheckCircle2,
  X,
  Loader2,
  Shield,
  ShieldAlert,
  Globe,
  SlidersHorizontal,
  Check,
  Sparkles,
  Lock,
  Edit3,
  Layers,
  GitBranch,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { experimentService } from "@/services/experimentService";
import type {
  ExperimentExecution,
  RestrictionLevel,
} from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { CATEGORIES_LIST, CATEGORY_STYLES } from "@/config/biologicalCategories";

export default function ConfigureInferences() {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<ExperimentExecution | null>(null);

  // Configuration Form State
  const [restrictionLevel, setRestrictionLevel] = useState<RestrictionLevel>("RESTRICTED");
  const [summarizeKb, setSummarizeKb] = useState<boolean>(true);
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [startFirstRoles, setStartFirstRoles] = useState<string[]>(["LIGAND"]);
  const [startSecondRoles, setStartSecondRoles] = useState<string[]>(["PROTEIN"]);

  const toggleRole = (
    roleKey: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      if (prev.includes(roleKey)) {
        if (prev.length <= 1) return prev; // Keep at least 1 role selected
        return prev.filter((r) => r !== roleKey);
      }
      return [...prev, roleKey];
    });
  };

  const formatPrologPreview = (roles: string[], varName: string) => {
    const preds = roles.map((r) => r.toLowerCase());
    if (preds.length === 1) return `${preds[0]}(${varName})`;
    return `(${preds.map((p) => `${p}(${varName})`).join(" ; ")})`;
  };

  // Modals and Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmCompleteModalOpen, setIsConfirmCompleteModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Load: Experiment Execution Details
  useEffect(() => {
    const expId = experimentId;
    if (!expId) return;

    let ignore = false;
    async function loadInitialData(id: string) {
      try {
        setLoading(true);
        const [execData, savedInference] = await Promise.all([
          experimentService.getExperimentExecution(id),
          experimentService.getInferenceByPipelineId(id),
        ]);
        if (!ignore) {
          if (execData) {
            setExperimentData(execData);
          }
          const stepMetrics = execData?.steps?.find((s) => s.id === "step-configure_inferences")?.metrics as
            | Record<string, string>
            | undefined;

          const level =
            savedInference?.restrictionLevel ||
            (stepMetrics?.restrictionLevel as RestrictionLevel | undefined) ||
            (stepMetrics?.["Restriction Level"] as RestrictionLevel | undefined);
          if (level && ["RESTRICTED", "VERY_RESTRICTED", "UNRESTRICTED"].includes(level)) {
            setRestrictionLevel(level);
          }

          if (typeof savedInference?.summarizeKb === "boolean") {
            setSummarizeKb(savedInference.summarizeKb);
          } else if (stepMetrics?.["Summarize KB"] !== undefined) {
            setSummarizeKb(stepMetrics["Summarize KB"] === "true");
          }

          if (typeof savedInference?.maxDepth === "number" && savedInference.maxDepth > 0) {
            setMaxDepth(savedInference.maxDepth);
          } else if (stepMetrics?.["Max Depth"]) {
            const parsedDepth = Number(stepMetrics["Max Depth"]);
            if (!Number.isNaN(parsedDepth) && parsedDepth > 0) {
              setMaxDepth(parsedDepth);
            }
          }

          if (Array.isArray(savedInference?.startFirstRoles) && savedInference.startFirstRoles.length > 0) {
            setStartFirstRoles(savedInference.startFirstRoles.map((r) => r.toUpperCase()));
          } else if (stepMetrics?.["Start First Roles"]) {
            const parsedFirst = stepMetrics["Start First Roles"]
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean);
            if (parsedFirst.length > 0) setStartFirstRoles(parsedFirst);
          }

          if (Array.isArray(savedInference?.startSecondRoles) && savedInference.startSecondRoles.length > 0) {
            setStartSecondRoles(savedInference.startSecondRoles.map((r) => r.toUpperCase()));
          } else if (stepMetrics?.["Start Second Roles"]) {
            const parsedSecond = stepMetrics["Start Second Roles"]
              .split(",")
              .map((s) => s.trim().toUpperCase())
              .filter(Boolean);
            if (parsedSecond.length > 0) setStartSecondRoles(parsedSecond);
          }
        }
      } catch (err) {
        console.warn("Failed loading experiment execution for inferences config", err);
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

  // Check if prerequisite step "Update Aligned Objects" is completed
  const isUpdateAlignedCompleted = useMemo(() => {
    if (!experimentData || !experimentData.steps || experimentData.steps.length === 0) return true;
    const updateStep = experimentData.steps.find((s) => {
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
    if (updateStep) {
      return updateStep.status === "COMPLETED";
    }
    return true;
  }, [experimentData]);

  // Handle Save and Complete Action
  const handleConfirmSaveAndComplete = async () => {
    setIsConfirmCompleteModalOpen(false);
    setIsSubmitting(true);
    try {
      const pipeId = experimentId || "pipeline-demo-123";

      // Save Inference Configuration (inferences service updates the pipeline step)
      await experimentService.saveInferenceConfig(pipeId, {
        restrictionLevel,
        summarizeKb,
        maxDepth,
        startFirstRoles,
        startSecondRoles,
      });

      // Delete prior pathways to prevent stale results
      try {
        await experimentService.deletePathways(pipeId);
      } catch (pathwayErr) {
        console.warn("Could not delete prior pathways (might not exist yet):", pathwayErr);
      }

      // Reset subsequent pipeline steps after Find Biological Roles to PENDING in config-and-control
      try {
        await experimentService.updatePipelineStep(pipeId, "UPDATE_BIOLOGICAL_OBJECTS", "PENDING", {
          statusMessage: "Awaiting role confirmation",
        });
        await experimentService.updatePipelineStep(pipeId, "SELECT_CLOSING_OBJECTS", "PENDING", {
          statusMessage: "Awaiting closing objects selection",
        });
        await experimentService.updatePipelineStep(pipeId, "INFER_PATHWAYS", "PENDING", {
          statusMessage: "Awaiting pathway inference",
        });
      } catch (stepResetErr) {
        console.warn("Downstream steps reset warning:", stepResetErr);
      }

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Inferences Configured Successfully",
        message: `Restriction level set to ${restrictionLevel.replace("_", " ")} (Summarize KB: ${summarizeKb ? "Yes" : "No"}, Max Depth: ${maxDepth}). Subsequent steps have been reset to run with the new criteria.`,
      });
    } catch (err) {
      console.error("Error saving inference configuration:", err);
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Error saving inference configuration. Please check backend connection."
      );
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalData(null);
    navigate(`/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`);
  };

  if (loading) {
    return (
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading inference configuration..."
        sublabel="Fetching pipeline and stage details"
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
                  { label: "Configure Inferences" },
                ]
              : [
                  { label: "Experiments" },
                  { label: experimentData?.experimentName || "Experiment" },
                  { label: "Configure Inferences" },
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
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                Configure Inferences
              </h1>
              <Badge variant="inProgress" className="text-[9px] px-2 py-0.5 font-bold">
                Manual Execution Step
              </Badge>
            </div>
            <p className="text-on-surface-variant font-body text-xs max-w-2xl mt-1 leading-relaxed">
              Select the biological restriction strategy and pathway search parameters for the upcoming inference launch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
              navigate(
                `/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`
              )
            }
            className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-xl border border-outline-variant/20"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsConfirmCompleteModalOpen(true)}
            disabled={isSubmitting || !isUpdateAlignedCompleted}
            title={!isUpdateAlignedCompleted ? "The 'Update Aligned Objects' step must be completed first" : undefined}
            className={`gap-2 font-bold ${!isUpdateAlignedCompleted ? "cursor-not-allowed opacity-60" : "shadow-primary-glow"}`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !isUpdateAlignedCompleted ? (
              <Lock className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Save and Complete
          </Button>
        </div>
      </div>

      {/* Prerequisite Alert Banner if Update Aligned Objects not completed */}
      {!isUpdateAlignedCompleted && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-headline text-sm font-bold text-amber-700 dark:text-amber-300">
                Prerequisite Step Required
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                The <strong>Update Aligned Objects</strong> step must be completed before you can save this inference configuration.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/dashboard/experiments/${networkId || experimentData?.networkId}/aligned-objects/${experimentId}`
              )
            }
            className="gap-2 font-bold text-xs shrink-0 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Go to Update Aligned Objects
          </Button>
        </div>
      )}

      {/* Step 1: Restriction Strategy Selector */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              Restriction Level
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Active Mode: <strong className="text-primary">{restrictionLevel.replace("_", " ")}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Restricted (Default) */}
          <div
            onClick={() => setRestrictionLevel("RESTRICTED")}
            className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
              restrictionLevel === "RESTRICTED"
                ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20"
                : "bg-surface-card border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="completed" className="text-[9px] font-bold">
                  DEFAULT
                </Badge>
                {restrictionLevel === "RESTRICTED" && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-3 h-3 font-bold" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">
                Restricted
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Adds the <strong>aligned objects</strong> and the <strong>objects paired with them</strong> in biological events.
              </p>
            </div>
          </div>

          {/* 2. Very Restricted */}
          <div
            onClick={() => setRestrictionLevel("VERY_RESTRICTED")}
            className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
              restrictionLevel === "VERY_RESTRICTED"
                ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20"
                : "bg-surface-card border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              {restrictionLevel === "VERY_RESTRICTED" && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3 h-3 font-bold" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">
                Very Restricted
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Adds <strong>only the aligned objects</strong>.
              </p>
            </div>
          </div>

          {/* 3. Unrestricted */}
          <div
            onClick={() => setRestrictionLevel("UNRESTRICTED")}
            className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
              restrictionLevel === "UNRESTRICTED"
                ? "bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20"
                : "bg-surface-card border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              {restrictionLevel === "UNRESTRICTED" && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3 h-3 font-bold" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">
                Unrestricted
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Adds <strong>all objects</strong> that appear in biological events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Pathway Inference Engine Parameters (summarizeKb & effectiveMaxDepth) */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              Pathway Search & Knowledge Base Parameters
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Summarize KB: <strong className="text-primary">{summarizeKb ? "Enabled" : "Disabled"}</strong> | Max Depth: <strong className="text-primary">{maxDepth}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Parameter 1: Summarize Knowledge Base */}
          <div
            onClick={() => setSummarizeKb((prev) => !prev)}
            className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              summarizeKb
                ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20"
                : "bg-surface-card border-outline-variant/20 hover:border-primary/40"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    Summarize Knowledge Base
                  </h3>
                  <Badge variant="completed" className="text-[9px] font-bold">
                    DEFAULT: ON
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Normalize and deduplicate equivalent biological relations (e.g. <em>stimulate</em>, <em>activate</em> &rarr; <em>positive_correlation</em>) before SWI-Prolog evaluation to reduce redundant pathways.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={summarizeKb}
              onChange={(e) => {
                e.stopPropagation();
                setSummarizeKb(e.target.checked);
              }}
              className="w-5 h-5 mt-1 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer shrink-0"
            />
          </div>

          {/* Parameter 2: Effective Maximum Depth */}
          <div className="p-5 rounded-2xl border bg-surface-card border-outline-variant/20 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    Effective Maximum Depth
                  </h3>
                  <Badge variant="completed" className="text-[9px] font-bold">
                    DEFAULT: 5
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Maximum number of intermediate causal transitions allowed during recursive DFS pathway chaining (1 to 20). Lower values prevent combinatorial explosion on large networks.
                </p>
              </div>
            </div>
            <div className="w-24 shrink-0">
              <Input
                type="number"
                min={1}
                max={20}
                value={maxDepth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxDepth(Number.isNaN(val) ? 5 : Math.max(1, Math.min(20, val)));
                }}
                className="text-right font-mono font-bold text-sm"
              />
            </div>
          </div>

          {/* Parameter 3: Start Event - First Element (A) Allowed Roles */}
          <div className="p-5 rounded-2xl border bg-surface-card border-outline-variant/20 flex flex-col justify-between gap-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    Start Rule — First Element (A) Roles
                  </h3>
                  <Badge variant="completed" className="text-[9px] font-bold">
                    DEFAULT: LIGAND
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Select biological roles allowed as the initial molecule <code>A</code> in <code>inicio_rule(A, E, B)</code>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = startFirstRoles.includes(cat.key);
                const style = CATEGORY_STYLES[cat.key];
                return (
                  <button
                    key={`first-${cat.key}`}
                    type="button"
                    onClick={() => toggleRole(cat.key, setStartFirstRoles)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} ring-1 ring-current/25 shadow-2xs`
                        : "bg-surface-container-low text-on-surface-variant/60 border-outline-variant/15 hover:border-outline-variant/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/15 font-mono text-[11px] text-primary truncate">
              {formatPrologPreview(startFirstRoles, "A")}
            </div>
          </div>

          {/* Parameter 4: Start Event - Second Element (B) Allowed Roles */}
          <div className="p-5 rounded-2xl border bg-surface-card border-outline-variant/20 flex flex-col justify-between gap-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    Start Rule — Second Element (B) Roles
                  </h3>
                  <Badge variant="completed" className="text-[9px] font-bold">
                    DEFAULT: PROTEIN
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Select biological roles allowed as the receiving molecule <code>B</code> in <code>inicio_rule(A, E, B)</code>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = startSecondRoles.includes(cat.key);
                const style = CATEGORY_STYLES[cat.key];
                return (
                  <button
                    key={`second-${cat.key}`}
                    type="button"
                    onClick={() => toggleRole(cat.key, setStartSecondRoles)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} ring-1 ring-current/25 shadow-2xs`
                        : "bg-surface-container-low text-on-surface-variant/60 border-outline-variant/15 hover:border-outline-variant/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/15 font-mono text-[11px] text-primary truncate">
              {formatPrologPreview(startSecondRoles, "B")}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Confirm Inferences Configuration
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Review your settings before completing this manual step.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-xs flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Selected Restriction Level:</span>
                <strong className="text-primary font-mono">{restrictionLevel.replace("_", " ")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Summarize Knowledge Base:</span>
                <strong className="text-primary font-mono">{summarizeKb ? "Enabled (Yes)" : "Disabled (No)"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Effective Maximum Depth:</span>
                <strong className="text-primary font-mono">{maxDepth}</strong>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant shrink-0">Start Element A Roles:</span>
                <strong className="text-primary font-mono text-right">{startFirstRoles.join(", ")}</strong>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-on-surface-variant shrink-0">Start Element B Roles:</span>
                <strong className="text-primary font-mono text-right">{startSecondRoles.join(", ")}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmCompleteModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSaveAndComplete}
                className="text-xs font-bold shadow-primary-glow"
              >
                Confirm & Complete Step
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        open={!!successModalData}
        title={successModalData?.title || "Step Completed"}
        message={successModalData?.message || "Inferences configuration completed successfully."}
        onClose={handleSuccessClose}
      />

      {/* Error Modal */}
      <ErrorModal
        open={!!errorMessage}
        title="Configuration Error"
        message={errorMessage || "Error saving inference configuration. Please check backend connection."}
        onClose={() => setErrorMessage(null)}
      />
    </div>
  );
}
