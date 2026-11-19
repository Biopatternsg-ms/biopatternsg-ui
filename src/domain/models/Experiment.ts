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
 * Pure domain definitions for experiments, execution pipelines, biological objects, and step metadata.
 *
 * Adheres to BioPatternSG UI Constitution Principle III (Pure Domain Modeling).
 * ZERO imports from React, Lucide, components, services, or adapters.
 */

export type PipelineStage = "queued" | "running" | "completed" | "failed";

export interface PipelineStatus {
  step: string;
  status: string;
  createdAt?: string; // Normalized ISO 8601 string
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

export interface BiologicalObjectItem {
  id?: string;
  name: string;
  symbol?: string;
  synonyms?: string[];
  biotypes: string[];
  meshRoles: string[];
  roles: string[];
  alternativeIds?: string[];
  description?: string;
}

export type AlignedStatus =
  | "ALIGNED"
  | "ALIGNED_AS"
  | "NO_ALIGNED"
  | "NEW"
  | "MODIFIED"
  | "CUSTOM_SYNONYMS";

export interface AlignedObjectItem {
  id: string;
  symbol: string;
  status: AlignedStatus;
  synonyms: string[];
}

export interface TranscriptionFactorConfig {
  sources: string[];
  genome?: string;
  track?: string;
  identity?: number;
  chromosome?: string;
  strand?: string;
  start?: string;
  end?: string;
  reliability: number;
  promoterRegion: string;
}

export interface ExpertObject {
  symbol: string | null;
  uniprotId: string | null;
  hgncId: string | null;
}

export interface ExperimentMetric {
  label: string;
  value: string;
  subLabel?: string;
  subLabelColor?: "green" | "red" | "blue" | "default";
  progress?: number;
  hasWarnings?: boolean;
  warningCount?: number;
}

export interface SubStep {
  name: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
}

export interface PipelineStepExecution {
  id: string;
  name: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING" | "FAILED";
  startTime?: string;
  duration?: string;
  outputText?: string;
  description: string;
  iconName: string;
  isManual?: boolean;
  actionRoute?: string;
  subSteps?: SubStep[];
  metrics?: ExperimentMetric[] | Record<string, string>;
}

export interface ExperimentExecution {
  experimentId: string;
  experimentName: string;
  networkId?: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PENDING";
  totalExecutionTime: string;
  currentPhaseDuration: string;
  steps: PipelineStepExecution[];
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  networkId: string;
  levels?: number;
  retMax?: number;
  maxComplexes?: number;
  step?: string;
  transcriptionFactorConfig?: TranscriptionFactorConfig;
  expertObjects?: ExpertObject[];
  createdAt?: string; // Normalized ISO 8601 string
  status?: PipelineStatus;
  useOnlyPrincipalName?: boolean;
}

export type RestrictionLevel = "RESTRICTED" | "VERY_RESTRICTED" | "UNRESTRICTED";

export interface ManualStepMetadata {
  routeSegment: string;
  buttonLabel: string;
  iconName?: string;
}
