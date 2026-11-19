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

import type { NetworkDto, PaginatedResponseDto } from "@/services/models/NetworkDto";
import type { Network } from "@/domain/models/Network";
import type { PaginatedResult } from "@/domain/models/Common";

/**
 * Adapter mediating between Network backend DTOs and pure domain models.
 * Adheres strictly to Principle IV (Mandatory Adapter Pattern).
 */
export const networkAdapter = {
  toDomain(dto: NetworkDto): Network {
    const epochMs =
      typeof dto.createdAt === "number"
        ? dto.createdAt > 1e11
          ? dto.createdAt
          : dto.createdAt * 1000
        : Date.now();

    return {
      id: dto.id,
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(epochMs).toISOString(),
    };
  },

  toPaginatedDomain(dto: PaginatedResponseDto<NetworkDto>): PaginatedResult<Network> {
    return {
      count: dto.count,
      list: (dto.list || []).map(networkAdapter.toDomain),
    };
  },
};
