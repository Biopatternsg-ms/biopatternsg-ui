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

export function PipelineStatus({ status }: { status?: string }) {
  const currentStatus = status || "PENDING";
  const { label: friendlyStatus, variant } = STATUS_CONFIG[currentStatus] || {
    label: "Pending",
    variant: "pending",
  };

  return (
    <Badge variant={variant} className="flex items-center gap-1.5 normal-case font-medium">
      {currentStatus === "IN_PROGRESS" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
      )}
      {friendlyStatus}
    </Badge>
  );
}
