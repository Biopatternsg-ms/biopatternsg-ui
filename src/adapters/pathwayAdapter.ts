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
  GroupedPathwayDto,
  GroupedPathwaysResponseDto,
  BiologicalPathwayDto,
  PathwayGraphNodeDto,
  PathwayGraphEdgeDto,
  PathwayGraphDto,
} from "@/services/models/Pathway";
import type {
  GroupedPathway,
  GroupedPathwaysResult,
  BiologicalPathway,
  PathwayGraphNode,
  PathwayGraphEdge,
} from "@/domain/models/Pathway";
import type { GraphNodeInput, GraphLinkInput } from "@/domain/models/Graph";

/**
 * Adapter to translate backend pathway DTOs to pure domain models and graph visualization inputs.
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

export function toGroupedPathway(dto: GroupedPathwayDto): GroupedPathway {
  return {
    groupId: dto.groupId,
    length: dto.length,
    startObject: dto.startObject,
    endObject: dto.endObject,
    pathwaysCount: dto.pathwaysCount,
    objects: dto.objects.map((obj) => ({
      name: obj.name,
      role: obj.role,
      position: obj.position,
    })),
    relations: [...dto.relations],
    steps: dto.steps.map((step) => ({
      position: step.position,
      first: step.first,
      second: step.second,
      relations: [...step.relations],
      events: step.events?.map((ev) => ({
        id: ev.id,
        relation: ev.relation,
        pubmedIds: ev.pubmedIds ? [...ev.pubmedIds] : undefined,
      })),
    })),
    relationCombinations: dto.relationCombinations.map((rc) => [...rc]),
    eventIdCombinations: dto.eventIdCombinations?.map((eic) => [...eic]),
    favorite: dto.favorite,
  };
}

export function toGroupedPathwayList(dtos: GroupedPathwayDto[]): GroupedPathway[] {
  return dtos.map(toGroupedPathway);
}

export function toPathwayGraphNode(dto: PathwayGraphNodeDto): PathwayGraphNode {
  return {
    name: dto.name,
    role: dto.role,
    type: dto.type,
  };
}

export function toPathwayGraphEdge(dto: PathwayGraphEdgeDto): PathwayGraphEdge {
  return {
    first: dto.first,
    relation: dto.relation,
    second: dto.second,
    pathwayCount: dto.pathwayCount,
  };
}

export function toBiologicalPathway(dto: BiologicalPathwayDto): BiologicalPathway {
  return {
    id: dto.id,
    pipelineId: dto.pipelineId,
    pathwayIndex: dto.pathwayIndex,
    length: dto.length,
    startObject: dto.startObject,
    endObject: dto.endObject,
    events: dto.events.map((e) => ({
      first: e.first,
      relation: e.relation,
      second: e.second,
    })),
    objects: dto.objects.map((o) => ({
      name: o.name,
      roles: [...o.roles],
    })),
  };
}

export function toGroupedPathwaysResult(dto: GroupedPathwaysResponseDto): GroupedPathwaysResult {
  return {
    pipelineId: dto.pipelineId,
    totalRawPathways: dto.totalRawPathways,
    totalGroups: dto.totalGroups,
    availableLengths: dto.availableLengths ? [...dto.availableLengths] : undefined,
    availableStartObjects: dto.availableStartObjects ? [...dto.availableStartObjects] : undefined,
    availableEndObjects: dto.availableEndObjects ? [...dto.availableEndObjects] : undefined,
    page: dto.page,
    size: dto.size,
    groups: toGroupedPathwayList(dto.groups || []),
  };
}

export function formatPathwayRoleLabel(rawRole?: string): string {
  if (!rawRole || !rawRole.trim()) return "Protein";
  const normalized = rawRole.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  switch (normalized) {
    case "protein":
      return "Protein";
    case "gene":
      return "Gene";
    case "enzyme":
      return "Enzyme";
    case "receptor":
      return "Receptor";
    case "ligand":
      return "Ligand";
    case "transcription_factor":
    case "tf":
      return "Transcription Factor";
    case "adaptor_protein":
      return "Adaptor Protein";
    case "disease":
      return "Disease";
    case "variant":
      return "Variant";
    default:
      return normalized
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

export function filterLinksByValidNodes(
  nodes: GraphNodeInput[],
  rawLinks: GraphLinkInput[]
): GraphLinkInput[] {
  const nodeSet = new Set(nodes.map((n) => n.name));
  return rawLinks.filter((link) => nodeSet.has(link.object1) && nodeSet.has(link.object2));
}

export interface PathwayGraphForceData {
  nodes: GraphNodeInput[];
  links: GraphLinkInput[];
  totalPathways: number;
  executionTimeMs: number;
}

/**
 * Transforms raw PathwayGraphDto responses into ForceGraphData (nodes and links)
 * suitable for 2D/3D force graph visualization engines, with role normalization
 * and link validation.
 */
export function toPathwayGraphForceData(
  dto?: PathwayGraphDto | null
): PathwayGraphForceData {
  if (!dto || !Array.isArray(dto.nodes) || dto.nodes.length === 0) {
    return {
      nodes: [],
      links: [],
      totalPathways: dto?.totalPathways ?? 0,
      executionTimeMs: dto?.executionTimeMs ?? 0,
    };
  }

  const mappedNodes: GraphNodeInput[] = dto.nodes
    .filter((n) => n && n.name)
    .map((n) => ({
      name: n.name.trim(),
      type: formatPathwayRoleLabel(n.type || n.role),
    }));

  const rawLinks: GraphLinkInput[] = (dto.edges || [])
    .filter((e) => e && (e.object1 || e.first) && (e.object2 || e.second))
    .map((e) => ({
      object1: (e.object1 || e.first).trim(),
      interaction: (e.interaction || e.relation || "association").trim(),
      object2: (e.object2 || e.second).trim(),
      pathwayCount: e.pathwayCount,
    }));

  const validLinks = filterLinksByValidNodes(mappedNodes, rawLinks);

  return {
    nodes: mappedNodes,
    links: validLinks,
    totalPathways: dto.totalPathways ?? 0,
    executionTimeMs: dto.executionTimeMs ?? 0,
  };
}

export const pathwayAdapter = {
  toGroupedPathway,
  toGroupedPathwayList,
  toPathwayGraphNode,
  toPathwayGraphEdge,
  toBiologicalPathway,
  toGroupedPathwaysResult,
  formatPathwayRoleLabel,
  toPathwayGraphForceData,
};
