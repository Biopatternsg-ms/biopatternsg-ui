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

export interface StepModelParametersProps {
  sourceSelection: string;
  onSourceChange: (value: string) => void;
  genome: string;
  onGenomeChange: (value: string) => void;
  track: string;
  onTrackChange: (value: string) => void;
  identity: string;
  onIdentityChange: (value: string) => void;
  chromosome: string;
  onChromosomeChange: (value: string) => void;
  strand: string;
  onStrandChange: (value: string) => void;
  start: string;
  onStartChange: (value: string) => void;
  end: string;
  onEndChange: (value: string) => void;
  reliability: string;
  onReliabilityChange: (value: string) => void;
  promoterRegion: string;
  onPromoterRegionChange: (value: string) => void;
  placeholders: {
    genome: string;
    track: string;
    identity: string;
    chromosome: string;
    strand: string;
    start: string;
    end: string;
    reliability: string;
    promoterRegion: string;
  };
}

export function StepModelParameters({
  sourceSelection,
  onSourceChange,
  genome,
  onGenomeChange,
  track,
  onTrackChange,
  identity,
  onIdentityChange,
  chromosome,
  onChromosomeChange,
  strand,
  onStrandChange,
  start,
  onStartChange,
  end,
  onEndChange,
  reliability,
  onReliabilityChange,
  promoterRegion,
  onPromoterRegionChange,
  placeholders,
}: StepModelParametersProps) {
  const showJasparFields = sourceSelection === "JASPAR" || sourceSelection === "BOTH";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Parámetros del Modelo</h3>
      <p className="text-sm text-on-surface-variant">
        Configura las fuentes genómicas y los parámetros de la región promotora.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Sources"
          type="select"
          containerClassName="col-span-1 sm:col-span-2"
          value={sourceSelection}
          onChange={(e) => onSourceChange(e.target.value)}
          options={[
            { value: "JASPAR", label: "JASPAR" },
            { value: "TFBIND", label: "TFBIND" },
            { value: "BOTH", label: "Ambos" },
          ]}
        />

        {showJasparFields && (
          <>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Genome" type="text" value={genome} placeholder={placeholders.genome} onChange={(e) => onGenomeChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Track" type="text" value={track} placeholder={placeholders.track} onChange={(e) => onTrackChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Identity" type="text" value={identity} placeholder={placeholders.identity} onChange={(e) => onIdentityChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Chromosome" type="text" value={chromosome} placeholder={placeholders.chromosome} onChange={(e) => onChromosomeChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Strand" type="text" value={strand} placeholder={placeholders.strand} onChange={(e) => onStrandChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="Start" type="text" value={start} placeholder={placeholders.start} onChange={(e) => onStartChange(e.target.value)} />
            </div>
            <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
              <FormField label="End" type="text" value={end} placeholder={placeholders.end} onChange={(e) => onEndChange(e.target.value)} />
            </div>
          </>
        )}

        <div className="col-span-1 sm:col-span-2">
          <FormField label="Reliability" type="text" value={reliability} placeholder={placeholders.reliability} onChange={(e) => onReliabilityChange(e.target.value)} />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <FormField
            label="Promoter Region"
            type="textarea"
            rows={3}
            placeholder={placeholders.promoterRegion}
            value={promoterRegion}
            onChange={(e) => onPromoterRegionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
