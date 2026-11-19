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
  GENE: {
    label: "Gene",
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
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
  DISEASE: {
    label: "Disease",
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
  },
  VARIANT: {
    label: "Variant",
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
};

export const CATEGORIES_LIST = [
  { key: "PROTEIN", label: "Protein" },
  { key: "GENE", label: "Gene" },
  { key: "ENZYME", label: "Enzyme" },
  { key: "RECEPTOR", label: "Receptor" },
  { key: "LIGAND", label: "Ligand" },
  { key: "TRANSCRIPTION_FACTOR", label: "Transcription Factor" },
  { key: "ADAPTOR_PROTEIN", label: "Adaptor Protein" },
  { key: "DISEASE", label: "Disease" },
  { key: "VARIANT", label: "Variant" },
] as const;

export const CATEGORY_KEYS = [
  "PROTEIN",
  "GENE",
  "ENZYME",
  "RECEPTOR",
  "LIGAND",
  "TRANSCRIPTION_FACTOR",
  "ADAPTOR_PROTEIN",
  "DISEASE",
  "VARIANT",
] as const;

/**
 * Canonical dictionary mapping biological role keys to clinical hex colors.
 */
export const ROLE_COLORS: Record<string, string> = {
  ligand: "#0066ff",
  protein: "#ff6b35",
  enzyme: "#10b981",
  receptor: "#f59e0b",
  transcription_factor: "#ec4899",
  tf: "#ec4899",
  adaptor_protein: "#8b5cf6",
  disease: "#06b6d4",
  variant: "#ef4444",
  gene: "#14b8a6",
};

export const DEFAULT_ROLE_COLOR = "#94a3b8";

/**
 * Resolves the canonical hex color for a given biological role.
 */
export function getRoleColor(role?: string): string {
  if (!role) return DEFAULT_ROLE_COLOR;
  const clean = role.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  return ROLE_COLORS[clean] || DEFAULT_ROLE_COLOR;
}

/**
 * Formats a biological role string into a human-readable title.
 */
export function formatRoleName(role?: string): string {
  if (!role) return "Protein";
  const clean = role.toLowerCase().trim().replace(/-/g, "_").replace(/\s+/g, "_");
  switch (clean) {
    case "transcription_factor":
    case "tf":
      return "Transcription Factor";
    case "adaptor_protein":
      return "Adaptor Protein";
    default:
      return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}

