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

import type {
  InferenceResponse as InferenceResponseDTO,
  PipelineStatus as PipelineStatusDTO,
} from "@/services/models/Experiment";
import type {
  BiologicalRoleItem,
  InferenceRolesDomain,
  PipelineStatus,
} from "@/domain/models/Experiment";

/**
 * Adapter to translate backend experiment and inference DTOs to pure domain models.
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

export function toPipelineStatus(dto: PipelineStatusDTO): PipelineStatus {
  return {
    step: dto.step,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}

export function toInferenceRolesDomain(dto?: InferenceResponseDTO | null): InferenceRolesDomain {
  const roles = dto?.roles ?? {};
  const allSymbols = Object.keys(roles);
  const entitiesWithActiveRolesCount = allSymbols.filter((sym) => {
    const val = roles[sym];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return Object.keys(val).length > 0;
  }).length;

  return {
    pipelineId: dto?.pipelineId ?? "",
    restrictionLevel: dto?.restrictionLevel ?? "VERY_RESTRICTED",
    roles,
    allSymbols,
    entitiesWithActiveRolesCount,
  };
}

export function toBiologicalRoleList(dto?: InferenceResponseDTO | null): BiologicalRoleItem[] {
  const roles = dto?.roles ?? {};
  return Object.entries(roles).map(([symbol, roleValues]) => {
    const activeRoles = Array.isArray(roleValues)
      ? roleValues
      : Object.keys(roleValues).filter((k) => !!(roleValues as unknown as Record<string, boolean>)[k]);

    return {
      symbol,
      roles: activeRoles,
      activeRoles,
    };
  });
}
