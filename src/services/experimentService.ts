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
import { authFetch } from "@/core/http/httpClient";
import {
  PIPELINES_ENDPOINT,
  PIPELINES_DESCRIPTION_ENDPOINT,
  PIPELINES_TRANSCRIPTION_FACTOR_ENDPOINT,
  PIPELINES_EXPERT_OBJECTS_ENDPOINT,
  PIPELINES_ALIGNED_EXPERT_OBJECTS_ENDPOINT,
  PIPELINES_SEARCH_CONFIG_ENDPOINT,
  PIPELINES_LAUNCH_ENDPOINT,
  PUBMED_ALIGNED_RESULTS_ENDPOINT,
  PUBMED_SYNONYMS_BY_NAME_ENDPOINT,
  PUBMED_KB_EVENTS_BY_TERM_ENDPOINT,
  PUBMED_GENERATE_KB_ENDPOINT,
} from "./apiConfig";

import type {
  Experiment,
  ExpertObject,
  TranscriptionFactorConfig,
  ExperimentExecution,
  AlignedResultResponse,
  PipelineSynonymResponse,
  KbEventResponse,
} from "./models/Experiment";

export interface PaginatedResponse<T> {
  count: number;
  list: T[];
}

export const experimentService = {
  /**
   * Retrieves the list of pipelines for a given network using authFetch,
   * which automatically injects the Authorization: Bearer token into the headers.
   */
  async getPipelines(networkId?: string | null, page: number = 0, size: number = 10): Promise<PaginatedResponse<Experiment>> {
    const url = networkId
      ? `${PIPELINES_ENDPOINT}?networkId=${encodeURIComponent(networkId)}&page=${page}&size=${size}`
      : `${PIPELINES_ENDPOINT}?page=${page}&size=${size}`;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch pipelines");
    }

    return response.json();
  },

  /**
   * Retrieves a single pipeline by its ID.
   */
  async getPipelineById(id: string): Promise<Experiment> {
    const response = await authFetch(`${PIPELINES_ENDPOINT}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch pipeline");
    }
    return response.json();
  },

  /**
   * Creates a new pipeline configuration by sending a POST request.
   * Returns the raw Response so callers can inspect the status code.
   */
  async createPipeline(networkId: string, name: string, description: string): Promise<Response> {
    return authFetch(PIPELINES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ networkId, name, description }),
    });
  },

  /**
   * Updates the transcription factor configuration of an existing pipeline.
   * PUT /config-and-control/pipelines/transcription-factor
   * Body: { id, transcriptionFactorConfig }
   */
  async updatePipeline(id: string, transcriptionFactorConfig: TranscriptionFactorConfig): Promise<Response> {
    return authFetch(PIPELINES_TRANSCRIPTION_FACTOR_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, transcriptionFactorConfig }),
    });
  },

  /**
   * Updates the name and description of an existing pipeline.
   * PUT /config-and-control/pipelines/description
   * Body: { id, name, description }
   */
  async updatePipelineDescription(id: string, name: string, description: string): Promise<Response> {
    return authFetch(PIPELINES_DESCRIPTION_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, name, description }),
    });
  },

  /**
   * Updates the expert objects of an existing pipeline.
   * PUT /config-and-control/pipelines/expert-objects
   * Body: { id, expertObjects }
   */
  async updateExperimentConfiguration(
    id: string,
    expertObjects: ExpertObject[]
  ): Promise<Response> {
    return authFetch(PIPELINES_EXPERT_OBJECTS_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, expertObjects }),
    });
  },

  /**
   * Updates the aligned expert objects list (symbols) of an existing pipeline.
   * PUT /config-and-control/pipelines/aligned-expert-objects
   * Body: { id, alignedExpertObjects }
   */
  async saveAlignedExpertObjects(
    id: string,
    alignedExpertObjects: string[]
  ): Promise<Response> {
    return authFetch(PIPELINES_ALIGNED_EXPERT_OBJECTS_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, alignedExpertObjects }),
    });
  },

  /**
   * Re-triggers the aligned objects generation step.
   * POST /config-and-control/pipelines/{id}/regenerate-aligned-objects
   */
  async regenerateAlignedObjects(id: string): Promise<Response> {
    return authFetch(`${PIPELINES_ENDPOINT}/${id}/regenerate-aligned-objects`, {
      method: "POST",
    });
  },

  /**
   * Updates a specific pipeline step status and metrics.
   * PATCH /config-and-control/pipelines/update-step
   */
  async updatePipelineStep(
    id: string,
    step: string,
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
    metrics?: Record<string, string>
  ): Promise<Response> {
    return authFetch(`${PIPELINES_ENDPOINT}/update-step`, {
      method: "PATCH",
      body: JSON.stringify({ id, step, status, metrics }),
    });
  },

  /**
   * Re-triggers the Knowledge Base Generation step for a pipeline.
   * POST /pubmed/generate-kb
   * Body: { pipelineId }
   */
  async generateKnowledgeBase(pipelineId: string): Promise<Response> {
    return authFetch(PUBMED_GENERATE_KB_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ pipelineId }),
    });
  },

  /**
   * Updates the search configuration of an existing pipeline (levels + retMax + useOnlyPrincipalName + maxComplexes).
   * PUT /config-and-control/pipelines/search-config
   * Body: { id, levels, retMax, useOnlyPrincipalName, maxComplexes }
   */
  async updateSearchConfig(
    id: string,
    levels: number,
    retMax: number,
    useOnlyPrincipalName: boolean,
    maxComplexes: number
  ): Promise<Response> {
    return authFetch(PIPELINES_SEARCH_CONFIG_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, levels, retMax, useOnlyPrincipalName, maxComplexes }),
    });
  },

  /**
   * Launches the execution of a pipeline.
   * POST /config-and-control/pipelines/launch
   * Body: { pipelineId }
   */
  async launchPipeline(pipelineId: string): Promise<Response> {
    return authFetch(PIPELINES_LAUNCH_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ pipelineId }),
    });
  },

  /**
   * Retrieves the detailed execution status of a launched experiment.
   * If the backend endpoint is not built yet, falls back to mocked data.
   */
  async getExperimentExecution(experimentId: string): Promise<ExperimentExecution> {
    let experimentName = "Protein Folding Analysis";
    let networkId = "";
    try {
      const exp = await this.getPipelineById(experimentId);
      if (exp) {
        if (exp.name) experimentName = exp.name;
        if (exp.networkId) networkId = exp.networkId;
      }
    } catch (err) {
      console.warn("Failed to fetch experiment details for name, using default name", err);
    }

    try {
      const response = await authFetch(`${PIPELINES_ENDPOINT}/${experimentId}/execution`);
      if (response.ok) {
        const data = await response.json();
        const steps = (data.steps || []).map((s: any) => ({
          ...s,
          id: s.id || s.step || s.name,
        }));

        // Ensure "Update Aligned Objects" manual step is present right after "Generate Aligned Objects"
        const hasUpdateAligned = steps.some(
          (s: any) =>
            s.id === "step-update_aligned_objects" ||
            s.id === "UPDATE_ALIGNED_OBJECTS" ||
            s.name === "Update Aligned Objects"
        );

        if (!hasUpdateAligned) {
          const genIndex = steps.findIndex(
            (s: any) =>
              s.id === "step-generate_aligned_objects" ||
              s.id === "GENERATE_ALIGNED_OBJECTS" ||
              s.name === "Generate Aligned Objects"
          );

          const updateStep = {
            id: "step-update_aligned_objects",
            name: "Update Aligned Objects",
            status: "PENDING",
            duration: "Manual",
            outputText: "Manual Action Required",
            description: "Manual step to review, modify, and align biological objects, synonyms, and identifiers.",
            iconName: "GitBranch",
            isManual: true,
          };

          if (genIndex !== -1) {
            steps.splice(genIndex + 1, 0, updateStep);
          } else {
            steps.push(updateStep);
          }
        }

        return {
          ...data,
          steps,
          networkId: data.networkId || networkId,
        };
      }
    } catch (err) {
      console.warn("Failed to fetch execution details from backend, falling back to mock data", err);
    }

    return {
      ...getMockExecutionData(experimentId, experimentName),
      networkId,
    };
  },

  /**
   * Fetches aligned results for a given pipelineId from pubmed-integration endpoint.
   */
  async getAlignedResults(pipelineId: string): Promise<AlignedResultResponse> {
    const response = await authFetch(`${PUBMED_ALIGNED_RESULTS_ENDPOINT}/${pipelineId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch aligned results for pipeline ${pipelineId}`);
    }
    return response.json();
  },

  /**
   * Fetches synonyms for a given pipelineId and object name from pubmed-integration endpoint.
   */
  async getSynonymsByName(pipelineId: string, name: string): Promise<PipelineSynonymResponse> {
    const url = `${PUBMED_SYNONYMS_BY_NAME_ENDPOINT}/${pipelineId}/by-name/${encodeURIComponent(name)}`;
    const response = await authFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch synonyms for pipeline ${pipelineId} and name ${name}`);
    }
    return response.json();
  },

  /**
   * Fetches kb_events for a given pipelineId and term from pubmed-integration endpoint.
   */
  async getKbEventsByTerm(pipelineId: string, term: string): Promise<KbEventResponse[]> {
    const url = `${PUBMED_KB_EVENTS_BY_TERM_ENDPOINT}/${pipelineId}/by-term/${encodeURIComponent(term)}`;
    const response = await authFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch kb_events for pipeline ${pipelineId} and term ${term}`);
    }
    return response.json();
  },
};

export function getMockExecutionData(experimentId: string, experimentName = "Protein Folding Analysis"): ExperimentExecution {
  return {
    experimentId,
    experimentName,
    status: "ACTIVE",
    totalExecutionTime: "01:15:58",
    currentPhaseDuration: "18:42",
    steps: [
      {
        id: "step-1",
        name: "Sequence Pre-processing",
        status: "COMPLETED",
        startTime: "13:50:07",
        duration: "12m 4s",
        outputText: "Completed • 12m 4s",
        description: "Filters low-quality reads, trims adapter sequences, and runs initial sequence quality control checks.",
        iconName: "Sliders",
        metrics: [
          { label: "TOTAL READS", value: "42.8M", progress: 100 },
          { label: "QUALITY SCORE (Q30)", value: "94.2%", subLabel: "Optimal quality profile", subLabelColor: "green" },
          { label: "TRIMMED BASES", value: "1.2M", subLabel: "2.7% of total reads" }
        ]
      },
      {
        id: "step-2",
        name: "Sequence Pre-processing",
        status: "COMPLETED",
        startTime: "14:02:11",
        duration: "12m 4s",
        outputText: "Output: 42.8M reads",
        description: "Secondary pre-processing phase, indexing genomic reference and aligning reads.",
        iconName: "GitBranch",
        metrics: [
          { label: "ALIGNMENT RATE", value: "98.6%", subLabel: "↑ 0.4% vs index", subLabelColor: "green" },
          { label: "UNMAPPED READS", value: "0.6M", progress: 1.4 },
          { label: "DUPLICATION RATE", value: "1.8%" }
        ]
      },
      {
        id: "step-3",
        name: "Alignment & Mapping",
        status: "COMPLETED",
        startTime: "14:14:15",
        duration: "45m 12s",
        outputText: "Output: 98.4% Quality",
        description: "Performs coordinate sorting, duplicate marking, and base quality score recalibration (BQSR).",
        iconName: "Cpu",
        metrics: [
          { label: "TOTAL READS", value: "42.8M" },
          { label: "MAPPING QUALITY", value: "98.4%", subLabel: "↑ 0.2% from baseline", subLabelColor: "green" },
          { label: "WARNINGS DETECTED", value: "02", hasWarnings: true, warningCount: 2 }
        ]
      },
      {
        id: "step-4",
        name: "Variant Calling",
        status: "COMPLETED",
        startTime: "14:59:27",
        duration: "18m 42s",
        outputText: "Completed",
        description: "Identifying genetic variations from aligned sequences using the GATK HaplotypeCaller engine.",
        iconName: "Activity",
        metrics: [
          { label: "TOTAL READS", value: "42.8M", progress: 100 },
          { label: "MAPPING QUALITY", value: "98.4%", subLabel: "↑ 0.2% from baseline", subLabelColor: "green" },
        ]
      },
      {
        id: "step-generate_aligned_objects",
        name: "Generate Aligned Objects",
        status: "COMPLETED",
        startTime: "15:20:00",
        duration: "05m 10s",
        outputText: "Completed • 142 Aligned Objects",
        description: "Automatically generates initial aligned biological objects from mined literature and databases.",
        iconName: "GitBranch",
        metrics: [
          { label: "ALIGNED OBJECTS", value: "142" },
          { label: "UNALIGNED OBJECTS", value: "8" }
        ]
      },
      {
        id: "step-update_aligned_objects",
        name: "Update Aligned Objects",
        status: "PENDING",
        duration: "Manual",
        outputText: "Manual Action Required",
        description: "Manual step to review, modify, and align biological objects, synonyms, and identifiers.",
        iconName: "GitBranch",
        isManual: true,
        metrics: [
          { label: "STATUS", value: "Awaiting Manual Update" },
          { label: "TARGET OBJECTS", value: "150" }
        ]
      },
      {
        id: "step-5",
        name: "Final Reporting",
        status: "PENDING",
        description: "Generates clinical annotation reports, exports annotated VCFs, and packages pipeline artifacts.",
        iconName: "FileText"
      }
    ]
  };
}

