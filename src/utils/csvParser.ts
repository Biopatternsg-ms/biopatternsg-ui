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
import type { ExpertObject } from "@/services/models/Experiment";

const CSV_SEPARATOR = ";";
const REQUIRED_HEADERS = ["symbol", "uniprotid", "hgncid"];

export function expertObjectsToCsvFile(expertObjects: ExpertObject[]): File {
  const headers = "symbol;uniprotId;hgncId";
  const rows = expertObjects.map(
    (obj) => `${obj.symbol ?? ""};${obj.uniprotId ?? ""};${obj.hgncId ?? ""}`
  );
  const content = [headers, ...rows].join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  return new File([blob], "expert-objects.csv", { type: "text/csv" });
}

export function parseExpertObjectsCsv(csvText: string): ExpertObject[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("El archivo CSV no contiene datos.");
  }

  const headers = lines[0].split(CSV_SEPARATOR).map((header) => header.trim().toLowerCase());

  const missingHeaders = REQUIRED_HEADERS.filter((required) => !headers.includes(required));
  if (missingHeaders.length > 0) {
    throw new Error(`El CSV no contiene las columnas requeridas: ${missingHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(CSV_SEPARATOR).map((value) => value.trim());

    const getValue = (name: string): string | null => {
      const columnIndex = headers.indexOf(name);
      const rawValue = columnIndex >= 0 ? values[columnIndex] : undefined;
      return rawValue === undefined || rawValue === "" ? null : rawValue;
    };

    const symbol = getValue("symbol");
    const uniprotId = getValue("uniprotid");
    const hgncId = getValue("hgncid");

    if (symbol === null && uniprotId === null && hgncId === null) {
      throw new Error(`La fila ${index + 2} tiene todos los campos vacíos.`);
    }

    return { symbol, uniprotId, hgncId };
  });
}
