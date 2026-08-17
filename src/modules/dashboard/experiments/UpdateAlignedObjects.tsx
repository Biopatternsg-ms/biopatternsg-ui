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

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitBranch,
  ArrowLeft,
  Search,
  CheckCircle2,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
  BookOpen,
  Activity,
  Layers,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  FileText,
  Database,
  Trash2,
  AlertTriangle,
  SlidersHorizontal
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { experimentService } from "@/services/experimentService";
import type { ExperimentExecution } from "@/services/models/Experiment";
import { SuccessModal } from "@/components/molecules/SuccessModal";

interface AlignedObjectItem {
  id: string;
  symbol: string;
  status: "ALIGNED" | "ALIGNED_AS" | "NO_ALIGNED" | "NEW" | "MODIFIED" | "CUSTOM_SYNONYMS";
  synonyms: string[];
}

export interface ModifiedExpertObjectRecord {
  action: "REPLACE_SYMBOL" | "ADD_NEW_SYMBOL" | "DELETE_SYMBOL";
  originalSymbol?: string;
  newSymbol: string;
  synonymUsed: string;
  timestamp: string;
}

const INITIAL_ALIGNED_OBJECTS: AlignedObjectItem[] = [
  {
    id: "obj-1",
    symbol: "BILE ACID",
    status: "ALIGNED_AS",
    synonyms: ["BILE ACID MALABSORPTION PRIMARY", "GBA2", "BILE ACIDS AND SALTS"],
  },
  {
    id: "obj-2",
    symbol: "CYP7A1",
    status: "ALIGNED_AS",
    synonyms: ["CYP7A1", "LOC101790267"],
  },
  {
    id: "obj-3",
    symbol: "LXR",
    status: "ALIGNED_AS",
    synonyms: ["NR1H2", "NR1H3"],
  },
  {
    id: "obj-4",
    symbol: "RXR",
    status: "ALIGNED_AS",
    synonyms: ["LOC100136128", "RXRA"],
  },
  {
    id: "obj-5",
    symbol: "FXR",
    status: "ALIGNED_AS",
    synonyms: ["FXR", "NR1H4"],
  },
  {
    id: "obj-6",
    symbol: "SHP",
    status: "ALIGNED_AS",
    synonyms: ["NR0B2", "LAMC1", "HYPERPARATHYROIDISM SECONDARY"],
  },
  {
    id: "obj-7",
    symbol: "TP53",
    status: "ALIGNED",
    synonyms: [],
  },
  {
    id: "obj-8",
    symbol: "KRAS",
    status: "NO_ALIGNED",
    synonyms: [],
  },
];

const UpdateAlignedObjects = () => {
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<ExperimentExecution | null>(null);
  const [objects, setObjects] = useState<AlignedObjectItem[]>(INITIAL_ALIGNED_OBJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AlignedObjectItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [activeSynonymMenu, setActiveSynonymMenu] = useState<{
    itemId: string;
    itemSymbol: string;
    synonym: string;
  } | null>(null);

  const [modifiedExpertObjects, setModifiedExpertObjects] = useState<ModifiedExpertObjectRecord[]>([]);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AlignedObjectItem | null>(null);

  const [isAddSymbolModalOpen, setIsAddSymbolModalOpen] = useState(false);
  const [newSymbolInput, setNewSymbolInput] = useState("");
  const [newSymbolError, setNewSymbolError] = useState("");

  const handleCreateNewSymbolSubmit = () => {
    const trimmedSymbol = newSymbolInput.trim().toUpperCase();
    if (!trimmedSymbol) {
      setNewSymbolError("Symbol name is required");
      return;
    }

    if (objects.some(o => o.symbol.toUpperCase() === trimmedSymbol)) {
      setNewSymbolError(`Symbol "${trimmedSymbol}" already exists in the list`);
      return;
    }

    const newItem: AlignedObjectItem = {
      id: `custom-new-${Date.now()}`,
      symbol: trimmedSymbol,
      status: "NEW",
      synonyms: [],
    };

    setObjects(prev => [newItem, ...prev]);

    setModifiedExpertObjects(prev => [
      ...prev,
      {
        action: "ADD_NEW_SYMBOL",
        newSymbol: trimmedSymbol,
        synonymUsed: trimmedSymbol,
        timestamp: new Date().toISOString(),
      },
    ]);

    setNewSymbolInput("");
    setNewSymbolError("");
    setIsAddSymbolModalOpen(false);
  };

  const [synonymSearchResult, setSynonymSearchResult] = useState<{
    term: string;
    pipelineId: string;
    activeMenuContext?: { itemId: string; itemSymbol: string; synonym: string };
    data: { name: string; synonyms: string[] }[];
  } | null>(null);

  const [kbEventsSearchResult, setKbEventsSearchResult] = useState<{
    term: string;
    pipelineId: string;
    activeMenuContext?: { itemId: string; itemSymbol: string; synonym: string };
    data: { first: string; relation: string; second: string; pubmedIds: string[] }[];
  } | null>(null);

  const [searchLoadingState, setSearchLoadingState] = useState<{
    type: "synonyms" | "kbEvents";
    term: string;
  } | null>(null);

  const handleSearchSynonyms = async (
    term: string,
    activeMenuContext?: { itemId: string; itemSymbol: string; synonym: string }
  ) => {
    const pipeId = experimentId || "pipeline-demo-123";
    setSearchLoadingState({ type: "synonyms", term });
    try {
      const result = await experimentService.getSynonymsByName(pipeId, term);
      setSynonymSearchResult({
        term,
        pipelineId: pipeId,
        activeMenuContext,
        data: result.name || (result.synonyms && result.synonyms.length > 0)
          ? [{ name: result.name, synonyms: result.synonyms || [] }]
          : [],
      });
    } catch (err) {
      console.warn("Synonyms search endpoint returned empty/error", err);
      setSynonymSearchResult({
        term,
        pipelineId: pipeId,
        activeMenuContext,
        data: [],
      });
    } finally {
      setSearchLoadingState(null);
    }
  };

  const handleSearchKbEvents = async (
    term: string,
    activeMenuContext?: { itemId: string; itemSymbol: string; synonym: string }
  ) => {
    const pipeId = experimentId || "pipeline-demo-123";
    setSearchLoadingState({ type: "kbEvents", term });
    try {
      const events = await experimentService.getKbEventsByTerm(pipeId, term);
      setKbEventsSearchResult({
        term,
        pipelineId: pipeId,
        activeMenuContext,
        data: events.map((e) => ({
          first: e.first,
          relation: e.relation,
          second: e.second,
          pubmedIds: e.pubmedIds || [],
        })),
      });
    } catch (err) {
      console.warn("KB events search endpoint returned empty/error", err);
      setKbEventsSearchResult({
        term,
        pipelineId: pipeId,
        activeMenuContext,
        data: [],
      });
    } finally {
      setSearchLoadingState(null);
    }
  };

  useEffect(() => {
    if (!experimentId) return;

    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);

        const [execData, alignedResultsData] = await Promise.allSettled([
          experimentService.getExperimentExecution(experimentId),
          experimentService.getAlignedResults(experimentId),
        ]);

        if (ignore) return;

        if (execData.status === "fulfilled") {
          setExperimentData(execData.value);
        }

        if (alignedResultsData.status === "fulfilled" && alignedResultsData.value) {
          const res = alignedResultsData.value;
          const mappedItems: AlignedObjectItem[] = [];

          const alignedAsMap = new Map<string, string[]>();
          (res.alignedAs || []).forEach((item) => {
            if (item.expertObjectName) {
              alignedAsMap.set(item.expertObjectName.toUpperCase(), item.alternativeIds || []);
            }
          });

          // 1. Process `aligned` list
          (res.aligned || []).forEach((symbol, idx) => {
            const symUpper = symbol.toUpperCase();
            const hasAlignedAs = alignedAsMap.has(symUpper);

            if (hasAlignedAs) {
              // Rule 2: In aligned AND in alignedAs -> ALIGNED AS + show synonyms
              mappedItems.push({
                id: `alignedAs-${idx}-${symbol}`,
                symbol: symbol,
                status: "ALIGNED_AS",
                synonyms: alignedAsMap.get(symUpper) || [],
              });
            } else {
              // Rule 1: In aligned AND NOT in alignedAs -> ALIGNED + NO synonyms
              mappedItems.push({
                id: `aligned-${idx}-${symbol}`,
                symbol: symbol,
                status: "ALIGNED",
                synonyms: [],
              });
            }
          });

          // Process any alignedAs items that were not in `aligned` list
          (res.alignedAs || []).forEach((item, idx) => {
            const symUpper = (item.expertObjectName || "").toUpperCase();
            const alreadyAdded = mappedItems.some(
              (m) => m.symbol.toUpperCase() === symUpper
            );
            if (!alreadyAdded && symUpper) {
              mappedItems.push({
                id: `alignedAsOnly-${idx}-${item.expertObjectName}`,
                symbol: item.expertObjectName,
                status: "ALIGNED_AS",
                synonyms: item.alternativeIds || [],
              });
            }
          });

          // 3. Rule 3: Process `noAligned` list -> NO ALIGNED + NO synonyms
          (res.noAligned || []).forEach((symbol, idx) => {
            const symUpper = symbol.toUpperCase();
            const alreadyAdded = mappedItems.some(
              (m) => m.symbol.toUpperCase() === symUpper
            );
            if (!alreadyAdded) {
              mappedItems.push({
                id: `noaligned-${idx}-${symbol}`,
                symbol: symbol,
                status: "NO_ALIGNED",
                synonyms: [],
              });
            }
          });

          if (mappedItems.length > 0) {
            setObjects(mappedItems);
          }
        }
      } catch (err) {
        console.warn("Failed to load aligned results from backend", err);
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

  const handleStartEdit = (item: AlignedObjectItem) => {
    setEditingId(item.id);
    setEditForm({ ...item, synonyms: [...item.synonyms] });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setObjects((prev) =>
      prev.map((item) => (item.id === editForm.id ? editForm : item))
    );
    setEditingId(null);
    setEditForm(null);
  };

  const handleReplaceSymbolName = (itemId: string, currentSymbol: string, synonym: string) => {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === itemId
          ? {
              ...obj,
              symbol: synonym,
              status: "MODIFIED",
            }
          : obj
      )
    );
    setModifiedExpertObjects((prev) => [
      ...prev,
      {
        action: "REPLACE_SYMBOL",
        originalSymbol: currentSymbol,
        newSymbol: synonym,
        synonymUsed: synonym,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleAddSynonymAsNewSymbol = (synonym: string) => {
    const newObj: AlignedObjectItem = {
      id: `new-${Date.now()}-${synonym}`,
      symbol: synonym,
      status: "NEW",
      synonyms: [],
    };
    setObjects((prev) => [...prev, newObj]);
    setModifiedExpertObjects((prev) => [
      ...prev,
      {
        action: "ADD_NEW_SYMBOL",
        newSymbol: synonym,
        synonymUsed: synonym,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleDeleteObject = (itemId: string, symbol: string) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== itemId));
    setModifiedExpertObjects((prev) => [
      ...prev,
      {
        action: "DELETE_SYMBOL",
        originalSymbol: symbol,
        newSymbol: "",
        synonymUsed: "",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const [isConfirmStepModalOpen, setIsConfirmStepModalOpen] = useState(false);

  const handleSaveAndCompleteStep = () => {
    setIsConfirmStepModalOpen(true);
  };

  const handleConfirmSaveAndCompleteStep = async () => {
    setIsConfirmStepModalOpen(false);
    setIsSubmitting(true);
    try {
      const pipeId = experimentId || "pipeline-demo-123";
      const symbolList = objects.map((o) => o.symbol);

      // 1. Save alignedExpertObjects in config-and-control
      await experimentService.saveAlignedExpertObjects(pipeId, symbolList);

      // 2. Re-trigger Knowledge Base Construction step
      try {
        await experimentService.generateKnowledgeBase(pipeId);
      } catch (kbErr) {
        console.warn("Knowledge base generation endpoint warning:", kbErr);
      }

      setIsSubmitting(false);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Error saving aligned expert objects:", err);
      setIsSubmitting(false);
      alert("Error saving aligned expert objects. Please check backend connection.");
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(`/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`);
  };

  const filteredObjects = objects.filter(
    (obj) =>
      obj.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <LoadingSpinner
        backdrop
        size="lg"
        variant="primary"
        label="Loading aligned objects..."
        sublabel="Fetching pipeline data and biological symbols"
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
                  { label: "Update Aligned Objects" },
                ]
              : [
                  { label: "Experiments" },
                  { label: experimentData?.experimentName || "Experiment" },
                  { label: "Update Aligned Objects" },
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-card p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shrink-0 shadow-sm">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                Update Aligned Objects
              </h1>
              <Badge variant="inProgress" className="text-[9px] px-2 py-0.5 font-bold">
                Manual Execution Step
              </Badge>
            </div>
            <p className="text-on-surface-variant font-body text-xs max-w-xl mt-1 leading-relaxed">
              Review, edit, and confirm biological object alignments and synonym mappings before completing this step.
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
            title="Cancel and return to Pipeline Sequence Execution view"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAndCompleteStep}
            disabled={isSubmitting}
            className="gap-2 shadow-primary-glow font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Save & Complete Step
          </Button>
        </div>
      </div>

      {/* Main Table Glass Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                type="text"
                placeholder="Search by Symbol or Synonym..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddSymbolModalOpen(true)}
              className="gap-1.5 text-xs font-bold shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Symbol
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
            <span>Total Objects: <strong className="text-on-surface">{objects.length}</strong></span>
            <span className="text-outline-variant/40">•</span>
            <span>Aligned: <strong className="text-emerald-600">{objects.filter(o => o.status === "ALIGNED" || o.status === "ALIGNED_AS").length}</strong></span>
            <span className="text-outline-variant/40">•</span>
            <span>No Aligned: <strong className="text-rose-500">{objects.filter(o => o.status === "NO_ALIGNED").length}</strong></span>
            <span className="text-outline-variant/40">•</span>
            <span>New: <strong className="text-blue-500">{objects.filter(o => o.status === "NEW").length}</strong></span>
            <span className="text-outline-variant/40">•</span>
            <span>Modified: <strong className="text-amber-500">{objects.filter(o => o.status === "MODIFIED").length}</strong></span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-card shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/15 bg-surface-container-low text-[11px] font-label uppercase font-bold tracking-wider text-on-surface-variant">
                <th className="py-3.5 px-4">Symbol</th>
                <th className="py-3.5 px-4 min-w-[140px] w-40">Status</th>
                <th className="py-3.5 px-4">Synonyms</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {filteredObjects.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing && editForm) {
                  return (
                    <tr key={item.id} className="bg-primary/5">
                      <td className="py-3 px-4 font-bold text-primary">
                        <Input
                          value={editForm.symbol}
                          onChange={(e) =>
                            setEditForm({ ...editForm, symbol: e.target.value })
                          }
                          className="h-8 text-xs font-bold"
                        />
                      </td>
                      <td className="py-3 px-4 min-w-[140px] whitespace-nowrap">
                        <Badge variant="inProgress" className="text-[9px]">
                          Editing
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {editForm.synonyms && editForm.synonyms.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {editForm.synonyms.map((syn) => (
                              <span
                                key={syn}
                                className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-mono text-on-surface-variant"
                              >
                                {syn}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant/40 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-8 px-2.5 gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-8 px-2 text-xs"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-headline font-bold text-on-surface">
                      {item.symbol}
                    </td>
                    <td className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">
                      <Badge
                        variant={
                          item.status === "ALIGNED"
                            ? "completed"
                            : item.status === "ALIGNED_AS"
                            ? "primary"
                            : item.status === "NEW"
                            ? "inProgress"
                            : item.status === "MODIFIED"
                            ? "pending"
                            : item.status === "CUSTOM_SYNONYMS"
                            ? "primary"
                            : "pending"
                        }
                        className="text-[9px] font-bold tracking-wider"
                      >
                        {item.status === "ALIGNED"
                          ? "ALIGNED"
                          : item.status === "ALIGNED_AS"
                          ? "ALIGNED AS"
                          : item.status === "NO_ALIGNED"
                          ? "NO ALIGNED"
                          : item.status === "NEW"
                          ? "NEW"
                          : item.status === "MODIFIED"
                          ? "MODIFIED"
                          : item.status === "CUSTOM_SYNONYMS"
                          ? "CUSTOM SYNONYMS"
                          : item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.synonyms && item.synonyms.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.synonyms.map((syn) => (
                            <button
                              key={syn}
                              type="button"
                              onClick={() =>
                                setActiveSynonymMenu({
                                  itemId: item.id,
                                  itemSymbol: item.symbol,
                                  synonym: syn,
                                })
                              }
                              className="inline-flex items-center gap-1.5 bg-primary/5 hover:bg-primary/15 text-primary dark:text-primary-light border border-primary/20 hover:border-primary/40 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all hover:scale-102 cursor-pointer group shadow-2xs"
                              title={`Options for "${syn}" (click to open actions menu)`}
                            >
                              <span>{syn}</span>
                              <SlidersHorizontal className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant/40 italic">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className="h-7 px-2 gap-1 text-[11px] text-primary hover:bg-primary/10 border border-primary/20"
                          title="Edit Object Symbol"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="h-7 px-2 gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title="Aligned Objects Updated"
        message="Manual step completed successfully. Aligned objects, references, and custom synonyms have been updated."
        onClose={handleSuccessClose}
      />

      {/* Consolidated Action Modal for Clicked Synonym */}
      {activeSynonymMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Synonym Actions</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">
                    "{activeSynonymMenu.synonym}"
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                    Source Symbol: <strong className="text-on-surface font-semibold">{activeSynonymMenu.itemSymbol}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSynonymMenu(null)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions List */}
            <div className="flex flex-col gap-2.5">
              {/* Option 1: Replace Symbol */}
              <button
                type="button"
                onClick={() => {
                  handleReplaceSymbolName(
                    activeSynonymMenu.itemId,
                    activeSynonymMenu.itemSymbol,
                    activeSynonymMenu.synonym
                  );
                  setActiveSynonymMenu(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-amber-500/10 border border-outline-variant/15 hover:border-amber-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Replace Symbol Name
                  </div>
                  <div className="text-[11px] text-on-surface-variant leading-snug">
                    Replace "{activeSynonymMenu.itemSymbol}" with "{activeSynonymMenu.synonym}" (Status: MODIFIED)
                  </div>
                </div>
              </button>

              {/* Option 2: Add as New Symbol */}
              <button
                type="button"
                onClick={() => {
                  handleAddSynonymAsNewSymbol(activeSynonymMenu.synonym);
                  setActiveSynonymMenu(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-emerald-500/10 border border-outline-variant/15 hover:border-emerald-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Add to List as New Symbol
                  </div>
                  <div className="text-[11px] text-on-surface-variant leading-snug">
                    Create new object with symbol "{activeSynonymMenu.synonym}" (Status: NEW)
                  </div>
                </div>
              </button>

              {/* Option 3: Search Synonyms in PubMed */}
              <button
                type="button"
                onClick={() => {
                  handleSearchSynonyms(activeSynonymMenu.synonym, activeSynonymMenu);
                  setActiveSynonymMenu(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-blue-500/10 border border-outline-variant/15 hover:border-blue-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Search PubMed Synonyms
                  </div>
                  <div className="text-[11px] text-on-surface-variant leading-snug">
                    Query synonyms collection for "{activeSynonymMenu.synonym}"
                  </div>
                </div>
              </button>

              {/* Option 4: Search KB Events */}
              <button
                type="button"
                onClick={() => {
                  handleSearchKbEvents(activeSynonymMenu.synonym, activeSynonymMenu);
                  setActiveSynonymMenu(null);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-slate-500/10 border border-outline-variant/15 hover:border-slate-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-slate-700/10 text-slate-800 dark:text-slate-200 group-hover:bg-slate-800 group-hover:text-white transition-colors shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-on-surface group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    Search Knowledge Base Events
                  </div>
                  <div className="text-[11px] text-on-surface-variant leading-snug">
                    Query registered interactions for "{activeSynonymMenu.synonym}"
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-outline-variant/10 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSynonymMenu(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Loading Overlay */}
      {searchLoadingState && (
        <LoadingSpinner
          backdrop
          size="lg"
          variant={searchLoadingState.type === "synonyms" ? "blue" : "secondary"}
          label={
            searchLoadingState.type === "synonyms"
              ? "Searching PubMed Synonyms..."
              : "Fetching Knowledge Base Events..."
          }
          sublabel={`Querying collection for "${searchLoadingState.term}"`}
        />
      )}

      {/* Synonyms Search Result Modal (Mongo 'synonyms' collection format) */}
      {synonymSearchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-xl w-full flex flex-col gap-5">
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">PubMed Synonyms</span>
                    <Badge variant="primary" className="text-[9px]">PubMed Integration</Badge>
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Results for "{synonymSearchResult.term}"
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSynonymSearchResult(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-on-surface-variant flex items-center gap-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Pipeline ID: <strong className="font-mono text-on-surface">{synonymSearchResult.pipelineId}</strong></span>
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {synonymSearchResult.data.length === 0 || synonymSearchResult.data.every(d => !d.synonyms || d.synonyms.length === 0) ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3 text-center bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-headline text-sm font-bold text-on-surface">Not Found</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                      No synonyms recorded in PubMed collection for "{synonymSearchResult.term}".
                    </p>
                  </div>
                </div>
              ) : (
                synonymSearchResult.data.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-outline-variant/10">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Principal Name: <strong>{item.name}</strong>
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {item.synonyms.length} synonyms found
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      {item.synonyms.map((syn) => (
                        <div
                          key={syn}
                          className="bg-surface-card px-3 py-2 rounded-xl text-xs font-mono font-semibold text-on-surface border border-outline-variant/15 w-full flex items-center justify-between shadow-xs hover:border-blue-500/30 transition-colors"
                        >
                          <span>{syn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
              {synonymSearchResult.activeMenuContext ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const ctx = synonymSearchResult.activeMenuContext;
                    setSynonymSearchResult(null);
                    if (ctx) setActiveSynonymMenu(ctx);
                  }}
                  className="text-xs flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : <div />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSynonymSearchResult(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KB Events Search Result Modal (Mongo 'kb_events' collection format) */}
      {kbEventsSearchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-4xl w-full flex flex-col gap-5">
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-700/10 text-slate-800 dark:text-slate-200 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Knowledge Base Events</span>
                    <Badge variant="completed" className="text-[9px]">Knowledge Base</Badge>
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Interaction Events for "{kbEventsSearchResult.term}"
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setKbEventsSearchResult(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-on-surface-variant flex items-center justify-between bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>Pipeline ID: <strong className="font-mono text-on-surface">{kbEventsSearchResult.pipelineId}</strong></span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{kbEventsSearchResult.data.length} Biological Events</span>
            </div>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {kbEventsSearchResult.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3 text-center bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-headline text-sm font-bold text-on-surface">Not Found</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                      No biological interaction events recorded in Knowledge Base for "{kbEventsSearchResult.term}".
                    </p>
                  </div>
                </div>
              ) : (
                kbEventsSearchResult.data.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-3 hover:border-slate-500/30 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-on-surface leading-normal whitespace-nowrap overflow-x-auto pb-1">
                      <span className="px-3 py-1.5 rounded-xl bg-surface-card border border-outline-variant/20 text-primary whitespace-nowrap shrink-0 text-xs shadow-2xs">
                        {event.first}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-700/10 text-slate-700 dark:text-slate-300 font-sans italic text-[11px] font-semibold shrink-0 whitespace-nowrap">
                        ── [{event.relation}] ──▶
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-surface-card border border-outline-variant/20 text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0 text-xs shadow-2xs">
                        {event.second}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/10 pt-2.5 text-[11px]">
                      <span className="text-on-surface-variant font-medium flex items-center gap-1 shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-600" /> PubMed References ({event.pubmedIds.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {event.pubmedIds.map((pmid) => (
                          <a
                            key={pmid}
                            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid.replace("PMID:", "")}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/10 hover:bg-slate-700/20 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold transition-colors border border-slate-500/10"
                            title="View on PubMed NCBI"
                          >
                            {pmid}
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
              {kbEventsSearchResult.activeMenuContext ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const ctx = kbEventsSearchResult.activeMenuContext;
                    setKbEventsSearchResult(null);
                    if (ctx) setActiveSynonymMenu(ctx);
                  }}
                  className="text-xs flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : <div />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKbEventsSearchResult(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-rose-500/20 shadow-2xl max-w-sm w-full flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b border-outline-variant/10">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Confirm Elimination</span>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Delete object?
                </h3>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete biological symbol <strong className="text-on-surface font-semibold">"{deleteConfirmItem.symbol}"</strong>? This will remove it from the list.
            </p>

            <div className="pt-3 border-t border-outline-variant/10 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmItem(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDeleteObject(deleteConfirmItem.id, deleteConfirmItem.symbol);
                  setDeleteConfirmItem(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1 px-3"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Biological Symbol Modal */}
      {isAddSymbolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full flex flex-col gap-5">
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-xs">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    Add New Biological Symbol
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Insert a new gene, protein, or biological object into the list
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddSymbolModalOpen(false);
                  setNewSymbolError("");
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">
                  Symbol Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CYP7A1, TP53, BRCA1"
                  value={newSymbolInput}
                  onChange={(e) => {
                    setNewSymbolInput(e.target.value);
                    if (newSymbolError) setNewSymbolError("");
                  }}
                  className="text-xs font-mono font-bold uppercase"
                />
                {newSymbolError && (
                  <p className="text-[11px] text-rose-500 font-medium">{newSymbolError}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/10 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddSymbolModalOpen(false);
                  setNewSymbolError("");
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNewSymbolSubmit}
                className="text-xs font-bold gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Symbol
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save & Complete Step Confirmation Modal */}
      {isConfirmStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card p-6 rounded-3xl border border-primary/20 shadow-2xl max-w-md w-full flex flex-col gap-5">
            <div className="flex justify-between items-start pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Re-ejecución de paso</span>
                    <Badge variant="inProgress" className="text-[9px]">Knowledge Base</Badge>
                  </div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Confirmar Guardado y Re-ejecución
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmStepModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-on-surface-variant flex flex-col gap-3 leading-relaxed bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
              <p>
                Al confirmar esta acción, se guardará la lista de <strong className="text-on-surface font-semibold">{objects.length} símbolos</strong> de la columna <span className="font-mono text-primary font-bold">Symbol</span> como un nuevo campo <code className="bg-surface-card px-1.5 py-0.5 rounded border border-outline-variant/15 text-primary font-mono font-bold">alignedExpertObjects</code> en la colección de pipelines.
              </p>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Se ejecutará de nuevo el paso de <strong>Construcción de la Base de Conocimiento</strong> (Knowledge Base Construction) para procesar estos objetos alineados.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/10 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmStepModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSaveAndCompleteStep}
                className="text-xs font-bold gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmar y Ejecutar Paso
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateAlignedObjects;
