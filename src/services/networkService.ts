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

export interface Network {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: number;
}

export const networkService = {
  /**
   * Retrieves the list of networks using authFetch, which automatically
   * injects the Authorization: Bearer token into the headers.
   */
  async getNetworks(): Promise<Network[]> {
    const response = await authFetch(NETWORKS_ENDPOINT);

    if (!response.ok) {
      throw new Error("Failed to fetch networks");
    }

    return response.json();
  },

  /**
   * Creates a new network configuration by sending a POST request.
   */
  async createNetwork(name: string, description: string): Promise<Network> {
    const response = await authFetch(NETWORKS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error("Failed to create network");
    }

    return response.json();
  },
};
