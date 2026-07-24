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
import { useParams, useNavigate } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { experimentService } from "@/services/experimentService";
import type { ExperimentExecution } from "@/services/models/Experiment";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";

const stepIcons: Record<string, any> = {
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

// Helper to format ISO timestamp or HH:mm:ss to local user time
function formatLocalTime(isoTimeStr?: string): string {
  if (!isoTimeStr) return "";
  const date = new Date(isoTimeStr);
  if (isNaN(date.getTime())) return isoTimeStr; // Fallback if already HH:mm:ss
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

const ExperimentExecutionView = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExperimentExecution | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Live timer states
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!experimentId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const executionData = await experimentService.getExperimentExecution(experimentId);
        setData(executionData);

        // Find the active step or default to the first one
        const activeStep = executionData.steps.find((s) => s.status === "ACTIVE");
        const defaultStep = activeStep || executionData.steps[executionData.steps.length - 1] || executionData.steps[0];
        setSelectedStepId(defaultStep?.id || null);

        // Initialize ticking timers
        setTotalSeconds(parseTimeToSeconds(executionData.totalExecutionTime));
        setPhaseSeconds(parseTimeToSeconds(executionData.currentPhaseDuration));
      } catch (err) {
        setError("Error loading execution details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [experimentId]);

  // Set up ticker for active execution
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
        <p className="text-on-surface-variant text-sm font-medium">Cargando detalles de ejecución...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-on-surface font-semibold text-lg">{error || "No se pudieron cargar los datos"}</p>
        <Button variant="ghost" onClick={() => navigate(`/dashboard/experiments/${networkId}`)}>
          Volver a Experimentos
        </Button>
      </div>
    );
  }

  const selectedStep = data.steps.find((s) => s.id === selectedStepId);

  // Format dynamic ticking values
  const displayTotalTime = formatSecondsToHms(totalSeconds);
  const displayPhaseTime = formatSecondsToMs(phaseSeconds);

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
          Volver a Experimentos
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
          <p className="text-xs text-on-surface-variant mt-0.5">ID: {data.experimentId}</p>
        </div>
      </div>

      {/* Main Grid: Left Timeline Sidebar & Right Phase View */}
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
              <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-outline-variant/20 z-0" />

              {data.steps.map((step) => {
                const isSelected = step.id === selectedStepId;
                const isCompleted = step.status === "COMPLETED";
                const isActive = step.status === "ACTIVE";
                const isPending = step.status === "PENDING";

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`relative z-10 flex gap-4 cursor-pointer group transition-all rounded-xl p-3 select-none -mx-2 ${
                      isSelected
                        ? "bg-primary/5 border border-primary/10 shadow-sm"
                        : "hover:bg-surface-container-low border border-transparent"
                    }`}
                  >
                    {/* Bullet Indicator */}
                    <div className="flex items-start justify-center pt-0.5">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-primary-container ring-4 ring-primary-container/20 flex items-center justify-center shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-surface border border-outline-variant text-on-surface-variant flex items-center justify-center shrink-0">
                          <Circle className="w-3.5 h-3.5 text-outline-variant" />
                        </div>
                      )}
                    </div>

                    {/* Step Information */}
                    <div className="flex-1 flex flex-col gap-1">
                      <h4
                        className={`font-headline text-sm font-semibold tracking-tight transition-colors ${
                          isSelected
                            ? "text-primary font-black"
                            : isPending
                            ? "text-on-surface-variant/50"
                            : "text-on-surface group-hover:text-primary-container"
                        }`}
                      >
                        {step.name}
                      </h4>

                      {/* Completed / Active Metrics labels */}
                      {isCompleted && step.outputText && (
                        <p className="text-[11px] font-body text-on-surface-variant/80 font-medium leading-relaxed">
                          {step.outputText}
                        </p>
                      )}

                      {isActive && (
                        <div className="flex flex-col gap-1.5 mt-1 text-[11px] font-body text-on-surface-variant/80 font-medium">
                          {step.startTime && <p>Start: {formatLocalTime(step.startTime)}</p>}
                          <p>Duration: {displayPhaseTime} (Active)</p>
                          {step.subSteps && step.subSteps.length > 0 && (
                            <ul className="flex flex-col gap-1 mt-2 pl-1 border-l border-primary/20 bg-primary/5 rounded-lg p-2">
                              {step.subSteps.map((sub, sIdx) => (
                                <li key={sIdx} className="flex items-center gap-1.5">
                                  {sub.status === "COMPLETED" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  ) : sub.status === "ACTIVE" ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant shrink-0" />
                                  )}
                                  <span
                                    className={`${
                                      sub.status === "PENDING" ? "text-on-surface-variant/40" : "text-on-surface-variant"
                                    }`}
                                  >
                                    {sub.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {isPending && (
                        <p className="text-[11px] font-body text-on-surface-variant/40 italic">
                          Awaiting processing
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Phase Status View */}
        <div className="w-full lg:w-2/3">
          <div className="bg-surface-card p-8 rounded-3xl border border-outline-variant/15 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background glowing orb design */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            {selectedStep ? (
              <div className="flex-1 flex flex-col gap-6">
                {/* Detail Section Title, Description, and Timers */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-outline-variant/10">
                  {/* Left: Step Info */}
                  <div className="flex gap-4">
                    <div className="p-3 bg-secondary-container text-primary-container rounded-2xl shrink-0 self-start shadow-sm">
                      <StepIcon name={selectedStep.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                        {selectedStep.name}
                      </h2>
                      <p className="text-on-surface-variant font-body text-sm max-w-xl mt-1.5 leading-relaxed">
                        {selectedStep.description}
                      </p>
                      {selectedStep.startTime && (
                        <p className="text-xs font-semibold text-primary-container mt-2 font-label">
                          Start Time: {formatLocalTime(selectedStep.startTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Global & Phase Timers */}
                  <div className="text-right flex flex-col min-w-[140px] border-l md:border-l border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0 pl-0 md:pl-6 self-stretch md:self-auto justify-center">
                    <span className="font-label font-bold text-[10px] tracking-widest text-on-surface-variant uppercase">
                      Total Execution Time
                    </span>
                    <span className="font-headline text-3xl font-black text-on-surface tracking-tight mt-1 font-label">
                      {selectedStep.status === "ACTIVE" ? displayTotalTime : data.totalExecutionTime}
                    </span>
                    {selectedStep.status === "ACTIVE" && (
                      <span className="text-[11px] font-semibold text-primary mt-1 font-label">
                        Current Phase: {displayPhaseTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub-steps Checklist details (only shown if step is active and has them) */}
                {selectedStep.subSteps && selectedStep.subSteps.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Phase Checklist
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                      {selectedStep.subSteps.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-3 bg-surface-card p-3.5 rounded-xl border border-outline-variant/15 shadow-sm"
                        >
                          {sub.status === "COMPLETED" ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 font-black" />
                            </div>
                          ) : sub.status === "ACTIVE" ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-outline-variant shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              sub.status === "PENDING" ? "text-on-surface-variant/40" : "text-on-surface"
                            }`}
                          >
                            {sub.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics Section */}
                <div className="flex-1 flex flex-col gap-4">
                  <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Execution Metrics
                  </h3>

                  {selectedStep.status === "PENDING" ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl flex-1 bg-surface-container-lowest/50">
                      <Clock className="w-10 h-10 text-outline-variant/40 mb-3" />
                      <p className="text-on-surface font-semibold text-sm">Este paso está en espera</p>
                      <p className="text-on-surface-variant text-xs mt-1 max-w-[280px]">
                        Las métricas y telemetría de ejecución se generarán automáticamente en cuanto se inicie esta fase.
                      </p>
                    </div>
                  ) : selectedStep.metrics && selectedStep.metrics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {selectedStep.metrics.map((metric, mIdx) => {
                        return (
                          <div
                            key={mIdx}
                            className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md ${
                              metric.hasWarnings
                                ? "bg-rose-50/20 border-rose-200/50 dark:border-rose-900/30 shadow-sm"
                                : "bg-surface-container border-outline-variant/15"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-3">
                                <span className="font-label font-bold text-[10px] tracking-widest text-on-surface-variant/75 uppercase">
                                  {metric.label}
                                </span>
                                {metric.hasWarnings && (
                                  <div className="flex gap-1">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                                      !
                                    </div>
                                  </div>
                                )}
                              </div>
                              <h3
                                className={`text-3xl font-headline font-black mt-2 tracking-tight ${
                                  metric.hasWarnings ? "text-amber-600 dark:text-amber-400" : "text-on-surface"
                                }`}
                              >
                                {metric.value}
                              </h3>
                            </div>

                            {/* Sublabel / Trend */}
                            {metric.subLabel && (
                              <p
                                className={`text-xs font-semibold mt-3 ${
                                  metric.subLabelColor === "green"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : metric.subLabelColor === "red"
                                    ? "text-rose-600 dark:text-rose-400"
                                    : metric.subLabelColor === "blue"
                                    ? "text-primary"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {metric.subLabel}
                              </p>
                            )}

                            {/* Optional Progress Bar */}
                            {metric.progress !== undefined && (
                              <div className="w-full mt-4">
                                <div className="h-1.5 w-full bg-outline-variant/25 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      metric.hasWarnings ? "bg-amber-500" : "bg-primary"
                                    }`}
                                    style={{ width: `${metric.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-on-surface-variant/60 text-sm italic">
                      No hay métricas específicas para esta fase.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-on-surface-variant italic">
                Selecciona una fase para ver sus detalles.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentExecutionView;
