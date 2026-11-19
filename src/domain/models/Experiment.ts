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
 * Pure domain definitions for experiments, execution pipelines, and inferred biological roles.
 *
 * Adheres to BioPatternSG UI Constitution Principle III (Pure Domain Modeling).
 */

export type PipelineStage = "queued" | "running" | "completed" | "failed";

export interface PipelineStatus {
  step: string;
  status: string;
  createdAt?: string;
  progressPercentage?: number;
}

export interface BiologicalRoleItem {
  id?: string;
  symbol: string;
  roles: string[];
  activeRoles?: string[];
  category?: string;
  score?: number;
  description?: string;
}

export interface InferenceRolesDomain {
  pipelineId: string;
  restrictionLevel: string;
  roles: Record<string, string[]>;
  allSymbols: string[];
  entitiesWithActiveRolesCount: number;
}
