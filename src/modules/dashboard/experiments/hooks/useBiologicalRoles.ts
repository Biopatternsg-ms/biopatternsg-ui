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

import { useState, useCallback, useEffect } from "react";
import { experimentService } from "@/services/experimentService";
import { toInferenceRolesDomain, toBiologicalRoleList } from "@/adapters/experimentAdapter";
import type { BiologicalRoleItem, InferenceRolesDomain } from "@/domain/models/Experiment";

export interface UseBiologicalRolesResult {
  loading: boolean;
  error: string | null;
  inferenceDomain: InferenceRolesDomain | null;
  rolesList: BiologicalRoleItem[];
  fetchRoles: (pipelineId: string) => Promise<void>;
  reset: () => void;
}

export function useBiologicalRoles(initialPipelineId?: string): UseBiologicalRolesResult {
  const [loading, setLoading] = useState(Boolean(initialPipelineId));
  const [error, setError] = useState<string | null>(null);
  const [inferenceDomain, setInferenceDomain] = useState<InferenceRolesDomain | null>(null);
  const [rolesList, setRolesList] = useState<BiologicalRoleItem[]>([]);

  const fetchRoles = useCallback(async (pipelineId: string) => {
    if (!pipelineId) return;
    try {
      setLoading(true);
      setError(null);
      const dto = await experimentService.getInferenceByPipelineId(pipelineId);
      const domain = toInferenceRolesDomain(dto);
      const list = toBiologicalRoleList(dto);
      setInferenceDomain(domain);
      setRolesList(list);
    } catch (err) {
      console.error("Failed loading biological roles:", err);
      setError(err instanceof Error ? err.message : "Failed loading biological roles");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setInferenceDomain(null);
    setRolesList([]);
  }, []);

  useEffect(() => {
    let ignore = false;
    if (initialPipelineId) {
      experimentService
        .getInferenceByPipelineId(initialPipelineId)
        .then((dto) => {
          if (!ignore) {
            setInferenceDomain(toInferenceRolesDomain(dto));
            setRolesList(toBiologicalRoleList(dto));
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            console.error("Failed loading biological roles:", err);
            setError(err instanceof Error ? err.message : "Failed loading biological roles");
            setLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [initialPipelineId]);

  return {
    loading,
    error,
    inferenceDomain,
    rolesList,
    fetchRoles,
    reset,
  };
}
