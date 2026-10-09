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

import { Badge } from "@/components/atoms/Badge";
import type { PipelineStatus as PipelineStatusType } from "@/services/models/Experiment";

// Map technical steps to friendly labels matching execution pipeline steps
const STEP_LABELS: Record<string, string> = {
  // Enum keys
  CONFIG: "Configuration Setup",
  LAUNCH: "Launch Pipeline",
  TRANSCRIPTION_FACTOR: "Transcription Factor Config",
  EXPERT_OBJECTS: "Expert Objects Processing",
  SEARCH_LEVELS: "Search Levels Processing",
  COMBINATIONS: "Pubmed Combinations Generation",
  SEARCH_PUBMED_IDS: "Search PubMed IDs",
  SEARCH_PUBTATOR: "Search PubTator Annotations",
  BUILD_KNOWLEDGE_BASE: "Build Knowledge Base Graph",
  GENERATE_ALIGNED_OBJECTS: "Generate Aligned Objects",
  UPDATE_ALIGNED_OBJECTS: "Update Aligned Objects",
  UPDATE_SYNONYMS: "Update Synonyms",
  CONFIGURE_INFERENCES: "Configure Inferences",
  FIND_ROLES: "Find Biological Roles",
  UPDATE_BIOLOGICAL_OBJECTS: "Update Biological Objects",

  // Lowercase keys
  configuration: "Configuration Setup",
  launched: "Launch Pipeline",
  transcription_factor: "Transcription Factor Config",
  expert_objects: "Expert Objects Processing",
  search_levels: "Search Levels Processing",
  combinations: "Pubmed Combinations Generation",
  search_pubmed_ids: "Search PubMed IDs",
  search_pubtator: "Search PubTator Annotations",
  build_knowledge_base: "Build Knowledge Base Graph",
  generate_aligned_objects: "Generate Aligned Objects",
  update_aligned_objects: "Update Aligned Objects",
  update_synonyms: "Update Synonyms",
  configure_inferences: "Configure Inferences",
  find_roles: "Find Biological Roles",
  update_biological_objects: "Update Biological Objects",

  // Prefixed step- keys
  "step-configuration": "Configuration Setup",
  "step-launched": "Launch Pipeline",
  "step-transcription_factor": "Transcription Factor Config",
  "step-expert_objects": "Expert Objects Processing",
  "step-search_levels": "Search Levels Processing",
  "step-combinations": "Pubmed Combinations Generation",
  "step-search_pubmed_ids": "Search PubMed IDs",
  "step-search_pubtator": "Search PubTator Annotations",
  "step-build_knowledge_base": "Build Knowledge Base Graph",
  "step-generate_aligned_objects": "Generate Aligned Objects",
  "step-update_aligned_objects": "Update Aligned Objects",
  "step-configure_inferences": "Configure Inferences",
  "step-find_roles": "Find Biological Roles",
  "step-update_biological_objects": "Update Biological Objects",

  // Legacy mappings
  Configuration: "Configuration Setup",
  Launch: "Launch Pipeline",
  "Transcription Factor": "Transcription Factor Config",
  "Expert Objects": "Expert Objects Processing",
  "Search Levels": "Search Levels Processing",
  Combinations: "Pubmed Combinations Generation",
  "Search PubTator": "Search PubTator Annotations",
  "Build Knowledge Base": "Build Knowledge Base Graph",
};

// Map status to friendly text and Badge variant
const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "pending" | "inProgress" | "completed" | "failed" }
> = {
  PENDING: { label: "Pending", variant: "pending" },
  IN_PROGRESS: { label: "In Progress", variant: "inProgress" },
  COMPLETED: { label: "Completed", variant: "completed" },
  FAILED: { label: "Failed", variant: "failed" },
};

export function getFriendlyStepLabel(step?: string): string {
  if (!step) return "Unknown";
  if (STEP_LABELS[step]) return STEP_LABELS[step];

  const cleanStep = step.replace(/^step-/, "");
  if (STEP_LABELS[cleanStep]) return STEP_LABELS[cleanStep];

  const upperStep = cleanStep.toUpperCase();
  if (STEP_LABELS[upperStep]) return STEP_LABELS[upperStep];

  return step;
}

const formatStatusDate = (dateVal?: string | number) => {
  if (!dateVal) return "";
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return "";
  }
};

export function PipelineStatus({ status }: { status?: PipelineStatusType }) {
  const currentStatus = status?.status || "PENDING";
  const { label: friendlyStatus, variant } = STATUS_CONFIG[currentStatus] || {
    label: "Pending",
    variant: "pending",
  };

  const formattedDate = status?.createdAt ? formatStatusDate(status.createdAt) : "";
  const tooltipText = formattedDate ? `Date: ${formattedDate}` : undefined;

  return (
    <div className="relative group inline-block">
      <Badge
        variant={variant}
        className="flex items-center gap-1.5 normal-case font-medium"
      >
        {currentStatus === "IN_PROGRESS" && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
        )}
        {friendlyStatus}
      </Badge>

      {tooltipText && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] tracking-wider uppercase font-semibold font-label rounded shadow-lg whitespace-nowrap z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface" />
        </div>
      )}
    </div>
  );
}
