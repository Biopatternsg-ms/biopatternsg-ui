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

import type { GroupedPathway as GroupedPathwayDTO } from "@/services/models/Pathway";
import type { GroupedPathway } from "@/domain/models/Pathway";

/**
 * Adapter to translate backend pathway DTOs to pure domain models.
 * Adheres to BioPatternSG UI Constitution Principle IV (Mandatory Adapter Pattern).
 */

export function toGroupedPathway(dto: GroupedPathwayDTO): GroupedPathway {
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

export function toGroupedPathwayList(dtos: GroupedPathwayDTO[]): GroupedPathway[] {
  return dtos.map(toGroupedPathway);
}
