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

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/molecules/FormField";
import type { CreateExperimentFormValues } from "@/schemas/experiments/createExperimentSchema";

const defaultPlaceholders = {
  genome: "e.g.: HG38",
  track: "e.g.: jaspar2022",
  identity: "e.g.: 100.0",
  chromosome: "e.g.: chr8",
  strand: "e.g.: NEGATIVE",
  start: "e.g.: 58498163",
  end: "e.g.: 58502163",
  reliability: "e.g.: 95",
  promoterRegion: "Enter promoter region sequence...",
};

export function StepModelParameters() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateExperimentFormValues>();

  const sourceSelection = watch("sourceSelection") || "JASPAR";
  const showJasparFields = sourceSelection === "JASPAR" || sourceSelection === "BOTH";
  const showTfbindFields = sourceSelection === "TFBIND" || sourceSelection === "BOTH";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Model Parameters</h3>
      <p className="text-sm text-on-surface-variant">
        Configure genomic sources and promoter region parameters.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <FormField
            label="Sources"
            type="select"
            options={[
              { value: "JASPAR", label: "JASPAR" },
              { value: "TFBIND", label: "TFBIND" },
              { value: "BOTH", label: "Both" },
            ]}
            {...register("sourceSelection")}
          />
        </div>

        {showJasparFields && (
          <>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Genome"
                type="text"
                placeholder={defaultPlaceholders.genome}
                aria-invalid={!!errors.genome}
                {...register("genome")}
              />
              {errors.genome && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.genome.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Track"
                type="text"
                placeholder={defaultPlaceholders.track}
                aria-invalid={!!errors.track}
                {...register("track")}
              />
              {errors.track && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.track.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Identity"
                type="text"
                placeholder={defaultPlaceholders.identity}
                aria-invalid={!!errors.identity}
                {...register("identity")}
              />
              {errors.identity && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.identity.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Chromosome"
                type="text"
                placeholder={defaultPlaceholders.chromosome}
                aria-invalid={!!errors.chromosome}
                {...register("chromosome")}
              />
              {errors.chromosome && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.chromosome.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Strand"
                type="text"
                placeholder={defaultPlaceholders.strand}
                aria-invalid={!!errors.strand}
                {...register("strand")}
              />
              {errors.strand && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.strand.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="Start"
                type="text"
                placeholder={defaultPlaceholders.start}
                aria-invalid={!!errors.start}
                {...register("start")}
              />
              {errors.start && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.start.message}
                </p>
              )}
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField
                label="End"
                type="text"
                placeholder={defaultPlaceholders.end}
                aria-invalid={!!errors.end}
                {...register("end")}
              />
              {errors.end && (
                <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                  {errors.end.message}
                </p>
              )}
            </div>
          </>
        )}

        {showTfbindFields && (
          <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
            <FormField
              label="Reliability"
              type="text"
              placeholder={defaultPlaceholders.reliability}
              aria-invalid={!!errors.reliability}
              {...register("reliability")}
            />
            {errors.reliability && (
              <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
                {errors.reliability.message}
              </p>
            )}
          </div>
        )}

        <div className="col-span-1 sm:col-span-2">
          <FormField
            label="Promoter Region"
            type="textarea"
            rows={4}
            placeholder={defaultPlaceholders.promoterRegion}
            aria-invalid={!!errors.promoterRegion}
            {...register("promoterRegion")}
          />
          {errors.promoterRegion && (
            <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide mt-1">
              {errors.promoterRegion.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
