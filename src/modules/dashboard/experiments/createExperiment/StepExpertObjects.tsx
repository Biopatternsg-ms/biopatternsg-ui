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
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { parseExpertObjectsCsv } from "@/utils/csvParser";
import type { ExpertObject } from "@/services/models/Experiment";

export interface StepExpertObjectsProps {
  searchLevel: string;
  onSearchLevelChange: (value: string) => void;
  expertObjectsFile: File | null;
  onFileChange: (file: File | null) => void;
  onFileParsed: (objects: ExpertObject[]) => void;
  onError: (message: string) => void;
}

export function StepExpertObjects({
  searchLevel,
  onSearchLevelChange,
  expertObjectsFile,
  onFileChange,
  onFileParsed,
  onError,
}: StepExpertObjectsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      onFileChange(null);
      return;
    }

    const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
    if (!isCsv) {
      onFileChange(null);
      onError("Solo se permiten archivos de tipo CSV.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseExpertObjectsCsv(text);
        onFileChange(file);
        onFileParsed(parsed);
      } catch (err) {
        onFileChange(null);
        onError(err instanceof Error ? err.message : "Error al leer el archivo CSV.");
        input.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-on-surface">Define expert objects</h3>
      <p className="text-sm text-on-surface-variant">
        Configure the search level and upload the CSV file with the objects to export.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          label="Search Level"
          type="text"
          placeholder="e.g. 1, 2, 3"
          value={searchLevel}
          onChange={(e) => onSearchLevelChange(e.target.value)}
        />
        <FormField
          label="Expert objects"
          type="file"
          accept=".csv"
          ref={fileInputRef}
          labelRight={
            <Button variant="link" size="sm" asChild>
              <a href="/templates/expert-objects-template.csv" download>
                Download template CSV
              </a>
            </Button>
          }
          onChange={handleFileChange}
        />
        {expertObjectsFile && (
          <p className="text-sm text-on-surface-variant">
            Archivo seleccionado: <span className="font-medium text-on-surface">{expertObjectsFile.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
