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
import { NETWORKS_ENDPOINT } from "./apiConfig";
import type { NetworkDto, PaginatedResponseDto } from "./models/NetworkDto";
import type { Network } from "@/domain/models/Network";
import type { PaginatedResult } from "@/domain/models/Common";
import { networkAdapter } from "@/adapters/networkAdapter";

export const networkService = {
  /**
   * Retrieves the list of networks using authFetch, which automatically
   * injects the Authorization: Bearer token into the headers.
   * Returns a domain PaginatedResult<Network> mediated by networkAdapter.
   */
  async getNetworks(page: number = 0, size: number = 10): Promise<PaginatedResult<Network>> {
    const response = await authFetch(`${NETWORKS_ENDPOINT}?page=${page}&size=${size}`);

    if (!response.ok) {
      throw new Error("Failed to fetch networks");
    }

    const dto: PaginatedResponseDto<NetworkDto> = await response.json();
    return networkAdapter.toPaginatedDomain(dto);
  },

  /**
   * Creates a new network configuration by sending a POST request.
   * Returns the raw Response so callers can inspect the status code.
   */
  async createNetwork(name: string, description: string): Promise<Response> {
    return authFetch(NETWORKS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },
};
