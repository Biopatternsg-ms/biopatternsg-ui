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
} from "./apiConfig";

import type { Experiment, ExpertObject, TranscriptionFactorConfig } from "./models/Experiment";

export const experimentService = {
  /**
   * Retrieves the list of pipelines for a given network using authFetch,
   * which automatically injects the Authorization: Bearer token into the headers.
   */
  async getPipelines(networkId?: string | null): Promise<Experiment[]> {
    const url = networkId
      ? `${PIPELINES_ENDPOINT}?networkId=${encodeURIComponent(networkId)}`
      : PIPELINES_ENDPOINT;

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
   * Updates the search configuration of an existing pipeline (levels + retMax).
   * PUT /config-and-control/pipelines/search-config
   * Body: { id, levels, retMax }
   */
  async updateSearchConfig(
    id: string,
    levels: number,
    retMax: number
  ): Promise<Response> {
    return authFetch(PIPELINES_SEARCH_CONFIG_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, levels, retMax }),
    });
  },
};
