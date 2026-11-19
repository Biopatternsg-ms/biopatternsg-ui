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

/**
 * Backend wire transport DTOs for pathway endpoints and inference graph responses.
 * All interfaces carry the `Dto` suffix to clearly distinguish them from pure domain models.
 *
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

/**
 * Payload sent to execute pathway inference on MongoDB knowledge base.
 * POST /api/inferences/pathways/run
 */
export interface PathwayInferenceRequestDto {
  pipelineId: string;
  user?: string;
  restrictedObjects?: string[];
  closingObjects?: string[];
  summarizeKb?: boolean;
  maxDepth?: number;
}

/**
 * Response returned by pathway inference execution.
 */
export interface PathwayInferenceResponseDto {
  status: "SUCCESS" | "ERROR";
  pipelineId: string;
  pathwaysCount: number;
  executionTimeMs: number;
  graphNodesCount: number;
  graphEdgesCount: number;
  message?: string;
}

/**
 * Consolidated Pathway Graph node from pathway_graphs.
 */
export interface PathwayGraphNodeDto {
  name: string;
  role?: string;
  type?: string;
}

/**
 * Consolidated Pathway Graph directed edge from pathway_graphs.
 */
export interface PathwayGraphEdgeDto {
  first: string;
  relation: string;
  second: string;
  object1?: string;
  interaction?: string;
  object2?: string;
  pathwayCount?: number;
}

/**
 * Consolidated Pathway Graph structure returned by GET /inferences/pathway-graphs/{pipelineId}.
 */
export interface PathwayGraphDto {
  pipelineId: string;
  user?: string;
  totalPathways?: number;
  executionTimeMs?: number;
  nodes: PathwayGraphNodeDto[];
  edges: PathwayGraphEdgeDto[];
}

/**
 * Single event reaction within an inferred pathway.
 */
export interface PathwayEventStepDto {
  first: string;
  relation: string;
  second: string;
}

/**
 * Biological entity participating in an inferred pathway.
 */
export interface PathwayObjectStepDto {
  name: string;
  roles: string[];
}

/**
 * Inferred biological pathway document.
 */
export interface BiologicalPathwayDto {
  id?: string;
  pipelineId: string;
  pathwayIndex: number;
  length: number;
  startObject: string;
  endObject: string;
  events: PathwayEventStepDto[];
  objects: PathwayObjectStepDto[];
}

/**
 * Query parameters for fetching paginated pathways.
 */
export interface PathwayQueryParamsDto {
  startObject?: string;
  endObject?: string;
  containsObject?: string;
  length?: number;
  search?: string;
  favorite?: boolean;
  page?: number;
  size?: number;
}

/**
 * Paginated pathways response wrapper.
 */
export interface PaginatedPathwaysResponseDto {
  list: BiologicalPathwayDto[];
  total: number;
  page: number;
  size: number;
}

/**
 * Biological entity participating in a grouped pathway sequence.
 */
export interface GroupedPathwayObjectDto {
  name: string;
  role: string;
  position: number;
}

/**
 * Underlying event details linking a relation transition to its KB event and PubMed evidence.
 */
export interface GroupedPathwayStepEventDto {
  id?: string;
  relation: string;
  pubmedIds?: string[];
}

/**
 * Step transition between two adjacent biological objects in a grouped pathway.
 */
export interface GroupedPathwayStepDto {
  position: number;
  first: string;
  second: string;
  relations: string[];
  events?: GroupedPathwayStepEventDto[];
}

/**
 * Biological pathway group consolidated by identical ordered sequence of objects.
 */
export interface GroupedPathwayDto {
  groupId: string;
  length: number;
  startObject: string;
  endObject: string;
  pathwaysCount: number;
  objects: GroupedPathwayObjectDto[];
  relations: string[];
  steps: GroupedPathwayStepDto[];
  relationCombinations: string[][];
  eventIdCombinations?: string[][];
  favorite?: boolean;
}

/**
 * Response returned by GET /inferences/pathways/{pipelineId}/grouped.
 */
export interface GroupedPathwaysResponseDto {
  pipelineId: string;
  totalRawPathways: number;
  totalGroups: number;
  availableLengths?: number[];
  availableStartObjects?: string[];
  availableEndObjects?: string[];
  page: number;
  size: number;
  groups: GroupedPathwayDto[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   BACKWARD COMPATIBILITY ALIASES (Deprecated: prefer explicit *Dto or @/domain/models)
   ───────────────────────────────────────────────────────────────────────────── */
export type PathwayInferenceRequest = PathwayInferenceRequestDto;
export type PathwayInferenceResponse = PathwayInferenceResponseDto;
export type PathwayGraphNode = PathwayGraphNodeDto;
export type PathwayGraphEdge = PathwayGraphEdgeDto;
export type PathwayGraph = PathwayGraphDto;
export type PathwayEventStep = PathwayEventStepDto;
export type PathwayObjectStep = PathwayObjectStepDto;
export type BiologicalPathway = BiologicalPathwayDto;
export type PathwayQueryParams = PathwayQueryParamsDto;
export type PaginatedPathwaysResponse = PaginatedPathwaysResponseDto;
export type GroupedPathwayObject = GroupedPathwayObjectDto;
export type GroupedPathwayStepEvent = GroupedPathwayStepEventDto;
export type GroupedPathwayStep = GroupedPathwayStepDto;
export type GroupedPathway = GroupedPathwayDto;
export type GroupedPathwaysResponse = GroupedPathwaysResponseDto;
