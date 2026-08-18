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

export interface StepGeneralConfigProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  nameReadOnly?: boolean;
}

export function StepGeneralConfig({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  nameReadOnly = false,
}: StepGeneralConfigProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">General Configuration</h3>
      <p className="text-sm text-on-surface-variant">
        Set the basic identification details and scope for this experimental pipeline.
      </p>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          label="Experiment Name"
          placeholder="e.g. Model Alpha v1.0"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={nameReadOnly}
        />
        <FormField
          label="Description"
          placeholder="Describe the objective..."
          type="textarea"
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
