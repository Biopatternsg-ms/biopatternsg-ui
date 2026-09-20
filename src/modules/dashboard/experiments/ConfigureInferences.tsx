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
  Search,
  CheckCircle2,
  X,
  Loader2,
  Shield,
  ShieldAlert,
  Globe,
  SlidersHorizontal,
  ExternalLink,
  Check,
  Tag,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Edit3,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { experimentService } from "@/services/experimentService";
import type {
  ExperimentExecution,
  KbEventResponse,
  RestrictionLevel,
} from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";

const DEFAULT_ALIGNED_SYMBOLS = [
  "BILE ACID",
  "CYP7A1",
  "LXR",
  "RXR",
  "FXR",
  "SHP",
  "TP53",
];

export default function ConfigureInferences() {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<ExperimentExecution | null>(null);
  const [alignedSymbols, setAlignedSymbols] = useState<string[]>(DEFAULT_ALIGNED_SYMBOLS);

  // Configuration Form State
  const [restrictionLevel, setRestrictionLevel] = useState<RestrictionLevel>("RESTRICTED");
  const [startObjects, setStartObjects] = useState<string[]>(["CYP7A1", "LXR"]);
  const [endObjects, setEndObjects] = useState<string[]>(["SHP", "FXR"]);

  // Search & Filter State for Starts / Ends and KB Events
  const [startSearch, setStartSearch] = useState("");
  const [endSearch, setEndSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  // KB Events
  const [events, setEvents] = useState<KbEventResponse[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  // Modals and Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmCompleteModalOpen, setIsConfirmCompleteModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);

  // 1. Initial Load: Experiment Execution Details and Aligned Objects
  useEffect(() => {
    const expId = experimentId;
    if (!expId) return;

    let ignore = false;
    async function loadInitialData(id: string) {
      try {
        setLoading(true);
        const [execData, alignedData] = await Promise.allSettled([
          experimentService.getExperimentExecution(id),
          experimentService.getAlignedResults(id),
        ]);

        if (ignore) return;

        if (execData.status === "fulfilled") {
          setExperimentData(execData.value);
        }

        let confirmedSymbols: string[] = [];
        if (alignedData.status === "fulfilled" && alignedData.value) {
          const res = alignedData.value;
          const symbols = Array.from(
            new Set([
              ...(res.aligned || []),
              ...(res.alignedAs || []).map((a) => a.expertObjectName),
            ])
          ).filter(Boolean);

          if (symbols.length > 0) {
            confirmedSymbols = symbols;
            setAlignedSymbols(symbols);
          }
        }

        if (confirmedSymbols.length === 0) {
          confirmedSymbols = DEFAULT_ALIGNED_SYMBOLS;
          setAlignedSymbols(DEFAULT_ALIGNED_SYMBOLS);
        }

        // Set default starts/ends if aligned objects available
        if (confirmedSymbols.length >= 2) {
          setStartObjects([confirmedSymbols[0], confirmedSymbols[1]]);
          setEndObjects([confirmedSymbols[confirmedSymbols.length - 1]]);
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

  // 2. Fetch / Filter KB Events whenever restrictionLevel or alignedSymbols change
  useEffect(() => {
    const expId = experimentId || "pipeline-demo-123";
    let ignore = false;

    async function fetchFilteredEvents() {
      setIsEventsLoading(true);
      try {
        const result = await experimentService.getKbEventsByRestriction(
          expId,
          restrictionLevel,
          alignedSymbols
        );
        if (!ignore) {
          setEvents(result);
        }
      } catch (err) {
        console.warn("Error fetching kb_events by restriction", err);
      } finally {
        if (!ignore) {
          setIsEventsLoading(false);
        }
      }
    }

    fetchFilteredEvents();

    return () => {
      ignore = true;
    };
  }, [experimentId, restrictionLevel, alignedSymbols]);

  // Toggle Start Object
  const handleToggleStart = (symbol: string) => {
    setStartObjects((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Toggle End Object
  const handleToggleEnd = (symbol: string) => {
    setEndObjects((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Select / Clear All Helpers
  const handleSelectAllStarts = () => setStartObjects([...alignedSymbols]);
  const handleClearAllStarts = () => setStartObjects([]);
  const handleSelectAllEnds = () => setEndObjects([...alignedSymbols]);
  const handleClearAllEnds = () => setEndObjects([]);

  // Filtered Starts / Ends by Search Text
  const filteredStartSymbols = useMemo(() => {
    return alignedSymbols.filter((sym) =>
      sym.toLowerCase().includes(startSearch.toLowerCase())
    );
  }, [alignedSymbols, startSearch]);

  const filteredEndSymbols = useMemo(() => {
    return alignedSymbols.filter((sym) =>
      sym.toLowerCase().includes(endSearch.toLowerCase())
    );
  }, [alignedSymbols, endSearch]);

  // Filtered Events by Search Text
  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events;
    const term = eventSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.first.toLowerCase().includes(term) ||
        e.relation.toLowerCase().includes(term) ||
        e.second.toLowerCase().includes(term) ||
        e.pubmedIds.some((id) => id.includes(term))
    );
  }, [events, eventSearch]);

  // Handle Save and Complete Action
  const handleConfirmSaveAndComplete = async () => {
    setIsConfirmCompleteModalOpen(false);
    setIsSubmitting(true);
    try {
      const pipeId = experimentId || "pipeline-demo-123";

      // 1. Save Inference Configuration
      await experimentService.saveInferenceConfig(pipeId, {
        restrictionLevel,
        startObjects,
        endObjects,
      });

      // 2. Complete Step with Summary Metrics
      try {
        await experimentService.updatePipelineStep(
          pipeId,
          "CONFIGURE_INFERENCES",
          "COMPLETED",
          {
            restrictionLevel,
            totalEvents: String(events.length),
            startObjectsCount: String(startObjects.length),
            endObjectsCount: String(endObjects.length),
            startObjects: startObjects.join(", "),
            endObjects: endObjects.join(", "),
            statusMessage: `Configured with ${restrictionLevel} restriction level`,
          }
        );
      } catch (stepErr) {
        console.warn("Update step endpoint warning:", stepErr);
      }

      setIsSubmitting(false);
      setSuccessModalData({
        title: "Inferences Configured Successfully",
        message: `Inference settings have been saved with ${events.length} filtered biological events, ${startObjects.length} start objects, and ${endObjects.length} end objects.`,
      });
    } catch (err) {
      console.error("Error saving inference configuration:", err);
      setIsSubmitting(false);
      alert("Error saving inference configuration. Please check backend connection.");
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
        sublabel="Fetching aligned objects and biological knowledge base events"
      />
    );
  }

  const alignedSet = new Set(alignedSymbols.map((s) => s.trim().toUpperCase()));

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
              Define the biological restriction strategy, select start and end boundary objects, and review the mined knowledge base events before launching inferences.
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
            disabled={isSubmitting || !isUpdateAlignedCompleted || startObjects.length === 0 || endObjects.length === 0}
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
              1. Restriction Level
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Active Mode: <strong className="text-primary">{restrictionLevel.replace("_", " ")}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Restringido (Default) */}
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
                Restringido (Restricted)
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Includes events where <strong>at least 1 object</strong> matches the confirmed aligned objects list.
              </p>
            </div>
          </div>

          {/* 2. Muy Restringido */}
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
                Muy Restringido (Very Restricted)
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Strict criteria: <strong>both objects</strong> (Subject and Object) must belong to the confirmed aligned objects list.
              </p>
            </div>
          </div>

          {/* 3. Sin Restriccion */}
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
                Sin Restricción (Unrestricted)
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Broad exploration: includes <strong>all mined events</strong> without filtering against the aligned list.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Starts & Ends Biological Objects Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Inicios (Starts) */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="font-headline text-base font-bold text-on-surface">
                2. Start Objects (Inicios)
              </h2>
            </div>
            <Badge variant="completed" className="text-[10px] font-bold">
              {startObjects.length} Selected
            </Badge>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Select trigger/source biological objects that initiate inference discovery paths.
          </p>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                type="text"
                placeholder="Search start objects..."
                value={startSearch}
                onChange={(e) => setStartSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllStarts}
              className="text-[11px] h-8 px-2.5 border border-outline-variant/20"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllStarts}
              className="text-[11px] h-8 px-2.5 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20"
            >
              Clear
            </Button>
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2 p-3 bg-surface-card rounded-2xl border border-outline-variant/15 max-h-48 overflow-y-auto">
            {filteredStartSymbols.map((sym) => {
              const isSelected = startObjects.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleToggleStart(sym)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-xs scale-102"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 font-bold" /> : <Tag className="w-3 h-3 text-on-surface-variant/50" />}
                  <span>{sym}</span>
                </button>
              );
            })}
            {filteredStartSymbols.length === 0 && (
              <span className="text-xs text-on-surface-variant/50 italic p-2">No symbols match search.</span>
            )}
          </div>
        </div>

        {/* Panel Cierres (Ends) */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="font-headline text-base font-bold text-on-surface">
                3. End Objects (Cierres)
              </h2>
            </div>
            <Badge variant="primary" className="text-[10px] font-bold">
              {endObjects.length} Selected
            </Badge>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Select target/destination biological objects where inference chains terminate.
          </p>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                type="text"
                placeholder="Search end objects..."
                value={endSearch}
                onChange={(e) => setEndSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllEnds}
              className="text-[11px] h-8 px-2.5 border border-outline-variant/20"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllEnds}
              className="text-[11px] h-8 px-2.5 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20"
            >
              Clear
            </Button>
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2 p-3 bg-surface-card rounded-2xl border border-outline-variant/15 max-h-48 overflow-y-auto">
            {filteredEndSymbols.map((sym) => {
              const isSelected = endObjects.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleToggleEnd(sym)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs scale-102"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/20"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 font-bold" /> : <Tag className="w-3 h-3 text-on-surface-variant/50" />}
                  <span>{sym}</span>
                </button>
              );
            })}
            {filteredEndSymbols.length === 0 && (
              <span className="text-xs text-on-surface-variant/50 italic p-2">No symbols match search.</span>
            )}
          </div>
        </div>
      </div>

      {/* Step 3: Biological Events (kb_events) Table */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-headline text-base font-bold text-on-surface">
              4. Mined Biological Events (Knowledge Base)
            </h2>
            <Badge variant="inProgress" className="text-[10px] font-bold">
              {filteredEvents.length} Events Available
            </Badge>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                type="text"
                placeholder="Search events by term, relation, PMID..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-card shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/15 bg-surface-container-low text-[11px] font-label uppercase font-bold tracking-wider text-on-surface-variant">
                <th className="py-3 px-4">Subject (First)</th>
                <th className="py-3 px-4 text-center">Relation</th>
                <th className="py-3 px-4">Object (Second)</th>
                <th className="py-3 px-4">Evidence (PubMed IDs)</th>
                <th className="py-3 px-4 text-right">Alignment Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {isEventsLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading filtered biological events...</span>
                  </td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((evt, idx) => {
                  const firstUpper = evt.first.trim().toUpperCase();
                  const secondUpper = evt.second.trim().toUpperCase();
                  const firstAligned = alignedSet.has(firstUpper);
                  const secondAligned = alignedSet.has(secondUpper);
                  const bothAligned = firstAligned && secondAligned;
                  const oneAligned = firstAligned || secondAligned;

                  const isStart = startObjects.includes(evt.first) || startObjects.includes(firstUpper);
                  const isEnd = endObjects.includes(evt.second) || endObjects.includes(secondUpper);

                  return (
                    <tr key={`${evt.first}-${evt.relation}-${evt.second}-${idx}`} className="hover:bg-surface-container-low/60 transition-colors">
                      {/* First */}
                      <td className="py-3 px-4 font-mono font-bold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span>{evt.first}</span>
                          {isStart && (
                            <Badge variant="completed" className="text-[8px] px-1 py-0 font-bold">
                              START
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Relation */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                          <ArrowRight className="w-3 h-3" />
                          {evt.relation}
                        </span>
                      </td>

                      {/* Second */}
                      <td className="py-3 px-4 font-mono font-bold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span>{evt.second}</span>
                          {isEnd && (
                            <Badge variant="primary" className="text-[8px] px-1 py-0 font-bold">
                              END
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Evidence (PubMed IDs) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {evt.pubmedIds && evt.pubmedIds.length > 0 ? (
                            evt.pubmedIds.map((pmid) => (
                              <a
                                key={pmid}
                                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary px-2 py-0.5 rounded text-[10px] font-mono border border-outline-variant/20 transition-colors"
                              >
                                <span>{pmid}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ))
                          ) : (
                            <span className="text-[11px] text-on-surface-variant/40 italic">-</span>
                          )}
                        </div>
                      </td>

                      {/* Alignment Status */}
                      <td className="py-3 px-4 text-right">
                        {bothAligned ? (
                          <Badge variant="completed" className="text-[9px] font-bold">
                            Both Aligned
                          </Badge>
                        ) : oneAligned ? (
                          <Badge variant="primary" className="text-[9px] font-bold">
                            1 Object Aligned
                          </Badge>
                        ) : (
                          <Badge variant="pending" className="text-[9px] font-bold">
                            Unrestricted
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant/60 text-xs italic">
                    No biological events found for the active restriction criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                <span className="text-on-surface-variant">Restriction Level:</span>
                <strong className="text-on-surface font-mono">{restrictionLevel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Start Objects (Inicios):</span>
                <strong className="text-emerald-600 font-mono">{startObjects.join(", ") || "None"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">End Objects (Cierres):</span>
                <strong className="text-blue-600 font-mono">{endObjects.join(", ") || "None"}</strong>
              </div>
              <div className="flex justify-between border-t border-outline-variant/10 pt-2">
                <span className="text-on-surface-variant">Filtered KB Events:</span>
                <strong className="text-primary font-mono">{events.length} Events</strong>
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
    </div>
  );
}
