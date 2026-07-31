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
  PIPELINES_SEARCH_CONFIG_ENDPOINT,
  PIPELINES_LAUNCH_ENDPOINT,
} from "./apiConfig";

import type { Experiment, ExpertObject, TranscriptionFactorConfig, ExperimentExecution } from "./models/Experiment";

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
        return {
          ...data,
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
        status: "ACTIVE",
        startTime: "14:59:27",
        duration: "18m 42s",
        outputText: "(Active)",
        description: "Identifying genetic variations from aligned sequences using the GATK HaplotypeCaller engine. Currently processing chromosome 14.",
        iconName: "Activity",
        subSteps: [
          { name: "Haplotype Engine Init", status: "COMPLETED" },
          { name: "Chr 14 Processing", status: "ACTIVE" },
          { name: "VCF Generation", status: "PENDING" }
        ],
        metrics: [
          { label: "TOTAL READS", value: "42.8M", progress: 75 },
          { label: "MAPPING QUALITY", value: "98.4%", subLabel: "↑ 0.2% from baseline", subLabelColor: "green" },
          { label: "WARNINGS DETECTED", value: "02", hasWarnings: true, warningCount: 2 }
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

