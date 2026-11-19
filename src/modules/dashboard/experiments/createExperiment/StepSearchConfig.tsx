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

import { useFormContext, Controller } from "react-hook-form";
import { FormField } from "@/components/molecules/FormField";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";
import type { CreateExperimentFormValues } from "@/schemas/experiments/createExperimentSchema";

export function StepSearchConfig() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateExperimentFormValues>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Search Configuration</h3>
      <p className="text-sm text-on-surface-variant">
        Set the search depth level, the maximum number of results retrieved from Pubtator, entity search rules, and maximum number of complexes.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <FormField
            label="Search Level"
            type="number"
            placeholder="e.g. 1, 2, 3"
            min={1}
            max={3}
            aria-invalid={!!errors.searchLevel}
            {...register("searchLevel")}
          />
          {errors.searchLevel && (
            <p
              role="alert"
              className="text-[11px] text-error font-label font-medium tracking-wide mt-1"
            >
              {errors.searchLevel.message}
            </p>
          )}
        </div>

        <div>
          <FormField
            label="Max Results (Pubtator)"
            type="number"
            placeholder="e.g. 100"
            min={1}
            max={10000}
            aria-invalid={!!errors.retMax}
            {...register("retMax")}
          />
          {errors.retMax && (
            <p
              role="alert"
              className="text-[11px] text-error font-label font-medium tracking-wide mt-1"
            >
              {errors.retMax.message}
            </p>
          )}
        </div>

        <div>
          <FormField
            label="Max Complexes"
            type="number"
            placeholder="e.g. 10"
            min={1}
            max={1000}
            aria-invalid={!!errors.maxComplexes}
            {...register("maxComplexes")}
          />
          {errors.maxComplexes && (
            <p
              role="alert"
              className="text-[11px] text-error font-label font-medium tracking-wide mt-1"
            >
              {errors.maxComplexes.message}
            </p>
          )}
        </div>

        <Controller
          name="useOnlyPrincipalName"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useOnlyPrincipalName"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <Label
                htmlFor="useOnlyPrincipalName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-on-surface"
              >
                Use only principal name
              </Label>
            </div>
          )}
        />
      </div>
    </div>
  );
}
