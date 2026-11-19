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
  ExperimentDto,
  PipelineStatusDto,
  InferenceResponseDto,
  BiologicalObjectItemDto,
  AlignedResultResponseDto,
} from "@/services/models/Experiment";
import type {
  Experiment,
  PipelineStatus,
  BiologicalRoleItem,
  InferenceRolesDomain,
  BiologicalObjectItem,
  AlignedObjectItem,
} from "@/domain/models/Experiment";

/**
 * Adapter to translate backend experiment, inference, and biological object DTOs to pure domain models.
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

export function toPipelineStatus(dto: PipelineStatusDto): PipelineStatus {
  return {
    step: dto.step,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}

export function toExperimentDomain(dto: ExperimentDto): Experiment {
  const epochMs =
    typeof dto.createdAt === "number"
      ? dto.createdAt > 1e11
        ? dto.createdAt
        : dto.createdAt * 1000
      : undefined;

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    networkId: dto.networkId,
    levels: dto.levels,
    retMax: dto.retMax,
    maxComplexes: dto.maxComplexes,
    step: dto.step,
    transcriptionFactorConfig: dto.transcriptionFactorConfig,
    expertObjects: dto.expertObjects,
    createdAt: epochMs ? new Date(epochMs).toISOString() : undefined,
    status: dto.status ? toPipelineStatus(dto.status) : undefined,
    useOnlyPrincipalName: dto.useOnlyPrincipalName,
  };
}

export function toBiologicalObjectDomain(dto: BiologicalObjectItemDto): BiologicalObjectItem {
  return {
    name: dto.name,
    symbol: dto.symbol,
    synonyms: dto.synonyms ? [...dto.synonyms] : undefined,
    biotypes: [...(dto.biotypes || [])],
    meshRoles: [...(dto.meshRoles || [])],
    roles: [...(dto.roles || [])],
    alternativeIds: dto.alternativeIds ? [...dto.alternativeIds] : undefined,
    description: dto.description,
  };
}

export function toAlignedObjectDomain(dto: AlignedResultResponseDto): AlignedObjectItem[] {
  const alignedItems: AlignedObjectItem[] = [];

  // Map explicitly aligned items with synonyms
  dto.alignedAs.forEach((item, index) => {
    alignedItems.push({
      id: `aligned-${index}`,
      symbol: item.expertObjectName,
      status: "ALIGNED_AS",
      synonyms: [...item.alternativeIds],
    });
  });

  // Map aligned without synonyms
  dto.aligned.forEach((symbol, index) => {
    if (!alignedItems.some((a) => a.symbol === symbol)) {
      alignedItems.push({
        id: `direct-${index}`,
        symbol,
        status: "ALIGNED",
        synonyms: [],
      });
    }
  });

  // Map unaligned
  dto.noAligned.forEach((symbol, index) => {
    alignedItems.push({
      id: `no-aligned-${index}`,
      symbol,
      status: "NO_ALIGNED",
      synonyms: [],
    });
  });

  return alignedItems;
}

export function toInferenceRolesDomain(dto?: InferenceResponseDto | null): InferenceRolesDomain {
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

export function toBiologicalRoleList(dto?: InferenceResponseDto | null): BiologicalRoleItem[] {
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
