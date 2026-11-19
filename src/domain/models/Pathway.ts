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
 * Pure domain definitions for biological pathways and grouped pathway sequences.
 *
 * Adheres to BioPatternSG UI Constitution Principle III (Pure Domain Modeling).
 */

export interface GroupedPathwayObject {
  name: string;
  role: string;
  position: number;
}

export interface GroupedPathwayStepEvent {
  id?: string;
  relation: string;
  pubmedIds?: string[];
}

export interface GroupedPathwayStep {
  position: number;
  first: string;
  second: string;
  relations: string[];
  events?: GroupedPathwayStepEvent[];
}

export interface GroupedPathway {
  groupId: string;
  length: number;
  startObject: string;
  endObject: string;
  pathwaysCount: number;
  objects: GroupedPathwayObject[];
  relations: string[];
  steps: GroupedPathwayStep[];
  relationCombinations: string[][];
  eventIdCombinations?: string[][];
  favorite?: boolean;
}

export interface PathwayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathway: GroupedPathway | null;
}
