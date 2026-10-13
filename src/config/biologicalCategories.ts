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

export interface CategoryStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  PROTEIN: {
    label: "Protein",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  ENZYME: {
    label: "Enzyme",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  RECEPTOR: {
    label: "Receptor",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
  },
  LIGAND: {
    label: "Ligand",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  TRANSCRIPTION_FACTOR: {
    label: "Transcription Factor",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  ADAPTOR_PROTEIN: {
    label: "Adaptor Protein",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
};

export const CATEGORIES_LIST = [
  { key: "PROTEIN", label: "Protein" },
  { key: "ENZYME", label: "Enzyme" },
  { key: "RECEPTOR", label: "Receptor" },
  { key: "LIGAND", label: "Ligand" },
  { key: "TRANSCRIPTION_FACTOR", label: "Transcription Factor" },
  { key: "ADAPTOR_PROTEIN", label: "Adaptor Protein" },
] as const;

export const CATEGORY_KEYS = [
  "PROTEIN",
  "ENZYME",
  "RECEPTOR",
  "LIGAND",
  "TRANSCRIPTION_FACTOR",
  "ADAPTOR_PROTEIN",
] as const;
