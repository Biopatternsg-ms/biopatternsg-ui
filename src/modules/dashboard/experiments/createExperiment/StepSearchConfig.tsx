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

export interface StepSearchConfigProps {
  searchLevel: string;
  onSearchLevelChange: (value: string) => void;
  retMax: string;
  onRetMaxChange: (value: string) => void;
  useOnlyPrincipalName: boolean;
  onUseOnlyPrincipalNameChange: (value: boolean) => void;
}

export function StepSearchConfig({
  searchLevel,
  onSearchLevelChange,
  retMax,
  onRetMaxChange,
  useOnlyPrincipalName,
  onUseOnlyPrincipalNameChange,
}: StepSearchConfigProps) {
  const options = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Search Configuration</h3>
      <p className="text-sm text-on-surface-variant">
        Set the search depth level, the maximum number of results retrieved from Pubtator, and entity search rules.
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
          label="Use Only Principal Name"
          type="select"
          options={options}
          value={useOnlyPrincipalName.toString()}
          onChange={(e) => onUseOnlyPrincipalNameChange(e.target.value === "true")}
        />
      </div>
    </div>
  );
}
