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

import type { ExperimentMetric } from "@/domain/models/Experiment";

export interface ParsedMetricItem extends ExperimentMetric {
  isLongText?: boolean;
}

export type RawMetricInput =
  | ExperimentMetric[]
  | Record<string, string | number | boolean | null | undefined>;

export const METRIC_LABELS: Record<string, string> = {
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

  // Inferences Stage
  restrictionLevel: "RESTRICTION LEVEL",
  totalAlignedObjects: "ALIGNED OBJECTS EVALUATED",
  meshIdsFound: "MESH IDS FOUND",
  rolesIdentified: "ROLES IDENTIFIED",
  entitiesWithActiveRoles: "ENTITIES WITH ACTIVE ROLES",
  totalEntitiesEvaluated: "TOTAL ENTITIES EVALUATED",
  pathwaysCount: "PATHWAYS INFERRED",
  graphNodesCount: "GRAPH NODES",
  graphEdgesCount: "GRAPH EDGES",
  executionTimeMs: "INFERENCE TIME (MS)",
  inferenceStatus: "INFERENCE STATUS",
  statusMessage: "STATUS",
  candidateClosingObjects: "CANDIDATE CLOSING OBJECTS",
  selectedClosingObjects: "SELECTED CLOSING OBJECTS",
  closingObjectsCount: "CLOSING OBJECTS COUNT",
  closingObjects: "CLOSING OBJECTS",
};

export function formatMetricValue(value: string): string {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

/**
 * Parses raw pipeline execution metrics (array or key-value dictionary)
 * into standardized, presentation-ready metric items for clinical step cards.
 */
export function parseExperimentMetrics(rawMetrics?: RawMetricInput): ParsedMetricItem[] {
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
        key === "tfSources" ||
        key === "statusMessage";

      return {
        label,
        value: stringVal,
        isLongText,
      };
    });
}
