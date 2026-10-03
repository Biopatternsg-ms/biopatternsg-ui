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
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { experimentService } from "@/services/experimentService";
import type {
  ExperimentExecution,
  RestrictionLevel,
} from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";

export default function ConfigureInferences() {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<ExperimentExecution | null>(null);

  // Configuration Form State
  const [restrictionLevel, setRestrictionLevel] = useState<RestrictionLevel>("RESTRICTED");

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
          const level =
            savedInference?.restrictionLevel ||
            ((execData?.steps?.find((s) => s.id === "step-configure_inferences")?.metrics as Record<string, string> | undefined)?.restrictionLevel as RestrictionLevel | undefined);
          if (level && ["RESTRICTED", "VERY_RESTRICTED", "UNRESTRICTED"].includes(level)) {
            setRestrictionLevel(level);
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
      });

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Inferences Configured Successfully",
        message: `Inference restriction strategy set to ${restrictionLevel.replace("_", " ")}.`,
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
              Select the biological restriction strategy to configure rules for the upcoming inference launch.
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
