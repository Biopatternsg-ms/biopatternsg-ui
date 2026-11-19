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

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { expertObjectsToCsvFile, parseExpertObjectsCsv } from "@/utils/csvParser";
import type { ExpertObject } from "@/domain/models/Experiment";
import type { CreateExperimentFormValues } from "@/schemas/experiments/createExperimentSchema";

export interface StepExpertObjectsProps {
  onError: (message: string) => void;
  expertObjects?: ExpertObject[];
}

export function StepExpertObjects({
  onError,
  expertObjects,
}: StepExpertObjectsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateExperimentFormValues>();

  const expertObjectsFile = watch("expertObjectsFile");

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/expert-objects-template.csv";
    link.download = "expert-objects-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCurrentCsv = () => {
    if (!expertObjects || expertObjects.length === 0) {
      return;
    }
    const file = expertObjectsToCsvFile(expertObjects);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "expert-objects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input || !expertObjectsFile) {
      return;
    }
    if (input.files?.[0]?.name === expertObjectsFile.name) {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(expertObjectsFile);
    input.files = dataTransfer.files;
  }, [expertObjectsFile]);

  const handleFileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      setValue("expertObjectsFile", null, { shouldValidate: true });
      setValue("expertObjectsList", [], { shouldValidate: true });
      return;
    }

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    if (!isCsv) {
      setValue("expertObjectsFile", null, { shouldValidate: true });
      setValue("expertObjectsList", [], { shouldValidate: true });
      onError("Only CSV files are allowed.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseExpertObjectsCsv(text);
        setValue("expertObjectsFile", file, { shouldValidate: true });
        setValue("expertObjectsList", parsed, { shouldValidate: true });
      } catch (err) {
        setValue("expertObjectsFile", null, { shouldValidate: true });
        setValue("expertObjectsList", [], { shouldValidate: true });
        onError(err instanceof Error ? err.message : "Error reading CSV file.");
        input.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Define expert objects</h3>
      <p className="text-sm text-on-surface-variant">
        Upload the CSV file with the expert objects to export.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <FormField
            ref={fileInputRef}
            label="Upload CSV"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
          {errors.expertObjectsFile && (
            <p
              role="alert"
              className="text-[11px] text-error font-label font-medium tracking-wide mt-1"
            >
              {String(errors.expertObjectsFile.message)}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadTemplate}
          >
            Download CSV template
          </Button>

          {expertObjects && expertObjects.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadCurrentCsv}
            >
              Download current CSV
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
