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
  Save,
  Check,
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
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
  hgncId: string;
  uniprotId: string;
  status: "ALIGNED" | "PENDING_REVIEW" | "CUSTOM_SYNONYMS";
  synonyms: string[];
}

const INITIAL_ALIGNED_OBJECTS: AlignedObjectItem[] = [
  {
    id: "obj-1",
    symbol: "BRCA1",
    hgncId: "HGNC:1100",
    uniprotId: "P38398",
    status: "ALIGNED",
    synonyms: ["BRCAI", "BRCC1", "IRIS", "PNCA2", "FANCS"],
  },
  {
    id: "obj-2",
    symbol: "TP53",
    hgncId: "HGNC:11998",
    uniprotId: "P04637",
    status: "ALIGNED",
    synonyms: ["P53", "BCC7", "LFS1", "TRP53"],
  },
  {
    id: "obj-3",
    symbol: "EGFR",
    hgncId: "HGNC:3236",
    uniprotId: "P00533",
    status: "CUSTOM_SYNONYMS",
    synonyms: ["ERBB", "ERBB1", "HER1", "PIG61"],
  },
  {
    id: "obj-4",
    symbol: "MYC",
    hgncId: "HGNC:7553",
    uniprotId: "P01106",
    status: "ALIGNED",
    synonyms: ["C-MYC", "MRTL", "MYCC", "bHLHe39"],
  },
  {
    id: "obj-5",
    symbol: "TNF",
    hgncId: "HGNC:11892",
    uniprotId: "P01375",
    status: "PENDING_REVIEW",
    synonyms: ["DIF", "TNFA", "TNFSF2"],
  },
  {
    id: "obj-6",
    symbol: "IL6",
    hgncId: "HGNC:6018",
    uniprotId: "P05231",
    status: "ALIGNED",
    synonyms: ["BSF2", "HSF", "IFNB2"],
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
  const [newSynonymInput, setNewSynonymInput] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (!experimentId) return;
    experimentService
      .getExperimentExecution(experimentId)
      .then((data) => {
        setExperimentData(data);
      })
      .catch((err) => console.warn("Failed to load experiment data", err))
      .finally(() => setLoading(false));
  }, [experimentId]);

  const handleStartEdit = (item: AlignedObjectItem) => {
    setEditingId(item.id);
    setEditForm({ ...item, synonyms: [...item.synonyms] });
    setNewSynonymInput("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setNewSynonymInput("");
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setObjects((prev) =>
      prev.map((item) => (item.id === editForm.id ? editForm : item))
    );
    setEditingId(null);
    setEditForm(null);
    setNewSynonymInput("");
  };

  const handleAddSynonym = () => {
    if (!editForm || !newSynonymInput.trim()) return;
    const trimmed = newSynonymInput.trim().toUpperCase();
    if (!editForm.synonyms.includes(trimmed)) {
      setEditForm({
        ...editForm,
        synonyms: [...editForm.synonyms, trimmed],
        status: "CUSTOM_SYNONYMS",
      });
    }
    setNewSynonymInput("");
  };

  const handleRemoveSynonym = (synToRem: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      synonyms: editForm.synonyms.filter((s) => s !== synToRem),
      status: "CUSTOM_SYNONYMS",
    });
  };

  const handleSaveAndCompleteStep = async () => {
    setIsSubmitting(true);
    // Simulate updating backend alignment
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessModalOpen(true);
    }, 800);
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(`/dashboard/experiments/${networkId || experimentData?.networkId}/execution/${experimentId}`);
  };

  const filteredObjects = objects.filter(
    (obj) =>
      obj.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.hgncId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.uniprotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant text-sm font-medium">Loading aligned objects...</p>
      </div>
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
              Review, edit, and confirm biological object alignments, HGNC/UniProt IDs, and custom synonym mappings before completing this step.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSaveAndCompleteStep}
          disabled={isSubmitting}
          className="gap-2 shadow-primary-glow font-bold shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Save & Complete Step
        </Button>
      </div>

      {/* Main Table Glass Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/15 shadow-md flex flex-col gap-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <Input
              type="text"
              placeholder="Search by Symbol, HGNC ID, UniProt ID or Synonym..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
            <span>Total Objects: <strong className="text-on-surface">{objects.length}</strong></span>
            <span className="text-outline-variant/40">•</span>
            <span>Aligned: <strong className="text-emerald-600">{objects.filter(o => o.status === "ALIGNED").length}</strong></span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-card shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/15 bg-surface-container-low text-[11px] font-label uppercase font-bold tracking-wider text-on-surface-variant">
                <th className="py-3.5 px-4">Symbol</th>
                <th className="py-3.5 px-4">HGNC ID</th>
                <th className="py-3.5 px-4">UniProt ID</th>
                <th className="py-3.5 px-4">Status</th>
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
                      <td className="py-3 px-4">
                        <Input
                          value={editForm.hgncId}
                          onChange={(e) =>
                            setEditForm({ ...editForm, hgncId: e.target.value })
                          }
                          className="h-8 text-xs font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          value={editForm.uniprotId}
                          onChange={(e) =>
                            setEditForm({ ...editForm, uniprotId: e.target.value })
                          }
                          className="h-8 text-xs font-mono"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="inProgress" className="text-[9px]">
                          Editing
                        </Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editForm.synonyms.map((syn) => (
                            <span
                              key={syn}
                              className="inline-flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-md text-[11px] font-mono text-on-surface"
                            >
                              {syn}
                              <button
                                type="button"
                                onClick={() => handleRemoveSynonym(syn)}
                                className="text-on-surface-variant hover:text-rose-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Input
                            placeholder="Add synonym..."
                            value={newSynonymInput}
                            onChange={(e) => setNewSynonymInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSynonym();
                              }
                            }}
                            className="h-7 text-[11px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddSynonym}
                            className="h-7 px-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
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
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant font-medium">
                      {item.hgncId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant font-medium">
                      {item.uniprotId}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          item.status === "ALIGNED"
                            ? "completed"
                            : item.status === "CUSTOM_SYNONYMS"
                            ? "primary"
                            : "pending"
                        }
                        className="text-[9px]"
                      >
                        {item.status === "ALIGNED"
                          ? "Aligned"
                          : item.status === "CUSTOM_SYNONYMS"
                          ? "Custom Synonyms"
                          : "Pending Review"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.synonyms.map((syn) => (
                          <span
                            key={syn}
                            className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-mono text-on-surface-variant"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
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
    </div>
  );
};

export default UpdateAlignedObjects;
