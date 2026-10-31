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
 * Payload sent to execute pathway inference on MongoDB knowledge base.
 * POST /api/inferences/pathways/run
 */
export interface PathwayInferenceRequest {
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
export interface PathwayInferenceResponse {
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
export interface PathwayGraphNode {
  name: string;
  role?: string;
  type?: string;
}

/**
 * Consolidated Pathway Graph directed edge from pathway_graphs.
 */
export interface PathwayGraphEdge {
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
export interface PathwayGraph {
  pipelineId: string;
  user?: string;
  totalPathways?: number;
  executionTimeMs?: number;
  nodes: PathwayGraphNode[];
  edges: PathwayGraphEdge[];
}

/**
 * Single event reaction within an inferred pathway.
 */
export interface PathwayEventStep {
  first: string;
  relation: string;
  second: string;
}

/**
 * Biological entity participating in an inferred pathway.
 */
export interface PathwayObjectStep {
  name: string;
  roles: string[];
}

/**
 * Inferred biological pathway document.
 */
export interface BiologicalPathway {
  id?: string;
  pipelineId: string;
  pathwayIndex: number;
  length: number;
  startObject: string;
  endObject: string;
  events: PathwayEventStep[];
  objects: PathwayObjectStep[];
}

/**
 * Query parameters for fetching paginated pathways.
 */
export interface PathwayQueryParams {
  startObject?: string;
  endObject?: string;
  containsObject?: string;
  page?: number;
  size?: number;
}

/**
 * Paginated pathways response wrapper.
 */
export interface PaginatedPathwaysResponse {
  list: BiologicalPathway[];
  total: number;
  page: number;
  size: number;
}
