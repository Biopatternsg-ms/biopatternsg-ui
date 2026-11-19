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
 * Backend wire transport DTOs for experiments, execution pipelines, and inferred biological roles.
 * All interfaces carry the `Dto` suffix to clearly distinguish them from pure domain models.
 *
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

export interface TranscriptionFactorConfigDto {
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

export interface ExpertObjectDto {
  symbol: string | null;
  uniprotId: string | null;
  hgncId: string | null;
}

export interface PipelineStatusDto {
  step: string;
  status: string;
  createdAt: string;
}

export interface MetricCardDto {
  label: string;
  value: string;
  subLabel?: string;
  subLabelColor?: "green" | "red" | "blue" | "default";
  progress?: number;
  hasWarnings?: boolean;
  warningCount?: number;
}

export interface SubStepDto {
  name: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
}

export interface PipelineStepExecutionDto {
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
  subSteps?: SubStepDto[];
  metrics?: MetricCardDto[] | Record<string, string>;
}

export interface ExperimentExecutionDto {
  experimentId: string;
  experimentName: string;
  networkId?: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PENDING";
  totalExecutionTime: string;
  currentPhaseDuration: string;
  steps: PipelineStepExecutionDto[];
}

export interface ExperimentDto {
  id: string;
  name: string;
  description: string;
  networkId: string;
  levels?: number;
  retMax?: number;
  maxComplexes?: number;
  step?: string;
  transcriptionFactorConfig?: TranscriptionFactorConfigDto;
  expertObjects?: ExpertObjectDto[];
  createdAt?: number; // Raw epoch timestamp from backend
  status?: PipelineStatusDto;
  useOnlyPrincipalName?: boolean;
}

export interface AlignedAsItemDto {
  expertObjectName: string;
  alternativeIds: string[];
}

export interface AlignedResultResponseDto {
  pipelineId: string;
  aligned: string[];
  noAligned: string[];
  alignedAs: AlignedAsItemDto[];
}

export interface PipelineSynonymResponseDto {
  name: string;
  synonyms: string[];
}

export interface KbEventResponseDto {
  first: string;
  relation: string;
  second: string;
  pubmedIds: string[];
}

export type RestrictionLevelDto = "RESTRICTED" | "VERY_RESTRICTED" | "UNRESTRICTED";

export interface InferenceConfigDto {
  restrictionLevel: RestrictionLevelDto;
  summarizeKb?: boolean;
  maxDepth?: number;
  startFirstRoles?: string[];
  startSecondRoles?: string[];
  intermediateFirstRoles?: string[];
  intermediateSecondRoles?: string[];
  endFirstRoles?: string[];
  endSecondRoles?: string[];
  startObjects?: string[];
  endObjects?: string[];
}

export interface InferenceResponseDto {
  id?: string;
  pipelineId: string;
  restrictionLevel: RestrictionLevelDto;
  summarizeKb?: boolean;
  maxDepth?: number;
  startFirstRoles?: string[];
  startSecondRoles?: string[];
  intermediateFirstRoles?: string[];
  intermediateSecondRoles?: string[];
  endFirstRoles?: string[];
  endSecondRoles?: string[];
  roles?: Record<string, string[]>;
}

export interface BiologicalObjectItemDto {
  symbol?: string;
  name: string;
  synonyms?: string[];
  biotypes: string[];
  meshRoles: string[];
  roles: string[];
  alternativeIds?: string[];
  description?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BACKWARD COMPATIBILITY ALIASES (Deprecated: prefer explicit *Dto or @/domain/models)
   ───────────────────────────────────────────────────────────────────────────── */
export type TranscriptionFactorConfig = TranscriptionFactorConfigDto;
export type ExpertObject = ExpertObjectDto;
export type PipelineStatus = PipelineStatusDto;
export type MetricCard = MetricCardDto;
export type SubStep = SubStepDto;
export type PipelineStepExecution = PipelineStepExecutionDto;
export type ExperimentExecution = ExperimentExecutionDto;
export type Experiment = ExperimentDto;
export type AlignedAsItem = AlignedAsItemDto;
export type AlignedResultResponse = AlignedResultResponseDto;
export type PipelineSynonymResponse = PipelineSynonymResponseDto;
export type KbEventResponse = KbEventResponseDto;
export type RestrictionLevel = RestrictionLevelDto;
export type InferenceConfig = InferenceConfigDto;
export type InferenceResponse = InferenceResponseDto;
export type BiologicalObjectItem = BiologicalObjectItemDto;
