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

// Map technical steps to friendly labels
const STEP_LABELS: Record<string, string> = {
  CONFIG: "Configuration",
  LAUNCH: "Launch",
  TRANSCRIPTION_FACTOR: "Transcription Factor",
  EXPERT_OBJECTS: "Expert Objects",
  SEARCH_LEVELS: "Search Levels",
  COMBINATIONS: "Combinations",
  SEARCH_PUBMED_IDS: "Search PubMed IDs",
  SEARCH_PUBTATOR: "Search PubTator",
  BUILD_KNOWLEDGE_BASE: "Build Knowledge Base",
  GENERATE_ALIGNED_OBJECTS: "Generate Aligned Objects",
  UPDATE_SYNONYMS: "Update Synonyms",
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
  return STEP_LABELS[step] || step;
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
  } catch (e) {
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
  const tooltipText = formattedDate ? `Started at: ${formattedDate}` : undefined;

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
