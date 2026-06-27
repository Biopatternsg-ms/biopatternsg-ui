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
import { PIPELINES_ENDPOINT } from "./apiConfig";

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
   * Updates an existing pipeline configuration with transcription factor config.
   */
  async updatePipeline(id: string, transcriptionFactorConfig: TranscriptionFactorConfig): Promise<Response> {
    return authFetch(PIPELINES_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, transcriptionFactorConfig }),
    });
  },

  /**
   * Updates the description of an existing pipeline.
   */
  async updatePipelineDescription(id: string, description: string): Promise<Response> {
    return authFetch(PIPELINES_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, description }),
    });
  },

  /**
   * Updates the final configuration of an existing pipeline (levels + expert objects).
   */
  async updateExperimentConfiguration(
    id: string,
    levels: number,
    expertObjects: ExpertObject[]
  ): Promise<Response> {
    return authFetch(PIPELINES_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ id, levels, expertObjects }),
    });
  },
};
