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

import { FormField } from "@/components/molecules/FormField";
import { Checkbox } from "@/components/atoms/Checkbox";

export interface StepSearchConfigProps {
  searchLevel: string;
  onSearchLevelChange: (value: string) => void;
  retMax: string;
  onRetMaxChange: (value: string) => void;
  useOnlyPrincipalName: boolean;
  onUseOnlyPrincipalNameChange: (value: boolean) => void;
  maxComplexes: string;
  onMaxComplexesChange: (value: string) => void;
}

export function StepSearchConfig({
  searchLevel,
  onSearchLevelChange,
  retMax,
  onRetMaxChange,
  useOnlyPrincipalName,
  onUseOnlyPrincipalNameChange,
  maxComplexes,
  onMaxComplexesChange,
}: StepSearchConfigProps) {

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Search Configuration</h3>
      <p className="text-sm text-on-surface-variant">
        Set the search depth level, the maximum number of results retrieved from Pubtator, entity search rules, and maximum number of complexes.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          label="Search Level"
          type="number"
          placeholder="e.g. 1, 2, 3"
          min={1}
          max={3}
          value={searchLevel}
          onChange={(e) => onSearchLevelChange(e.target.value)}
        />
        <FormField
          label="Maximum Search Number in Pubtator"
          type="number"
          placeholder="e.g. 100"
          value={retMax}
          onChange={(e) => onRetMaxChange(e.target.value)}
        />
        <FormField
          label="Maximum Number of Complexes"
          type="number"
          placeholder="e.g. 10"
          min={1}
          value={maxComplexes}
          onChange={(e) => onMaxComplexesChange(e.target.value)}
        />
        <div className="flex items-center space-x-3 bg-surface-container-high/50 p-4 rounded-xl border border-outline-variant/10">
          <Checkbox
            id="useOnlyPrincipalName"
            checked={useOnlyPrincipalName}
            onCheckedChange={(checked) => onUseOnlyPrincipalNameChange(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="useOnlyPrincipalName"
              className="text-sm font-bold text-on-surface cursor-pointer select-none"
            >
              Use Only Principal Name
            </label>
            <p className="text-xs text-on-surface-variant">
              Only search using the main canonical name of entities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
