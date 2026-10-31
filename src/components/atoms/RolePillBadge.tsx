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

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_STYLES } from "@/config/biologicalCategories";

const ROLE_COLOR_MAP: Record<string, string> = {
  PROTEIN: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70",
  GENE: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100/70",
  LIGAND: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70",
  RECEPTOR: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/70",
  ENZYME: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70",
  TRANSCRIPTION_FACTOR: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70",
  ADAPTOR_PROTEIN: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70",
  DISEASE: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70",
  VARIANT: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70",
};

function formatRoleLabel(role: string): string {
  const normalizedKey = role.trim().toUpperCase();
  if (CATEGORY_STYLES[normalizedKey]?.label) {
    return CATEGORY_STYLES[normalizedKey].label;
  }
  return role
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export interface RolePillBadgeProps {
  role: string;
  onRemove?: () => void;
  className?: string;
}

export function RolePillBadge({ role, onRemove, className }: RolePillBadgeProps) {
  const normalizedKey = role.trim().toUpperCase();
  const label = formatRoleLabel(role);
  const colorClass = ROLE_COLOR_MAP[normalizedKey] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border transition-all shadow-2xs",
        colorClass,
        className
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${label}`}
          className="p-0.5 rounded-full hover:bg-black/10 transition-colors ml-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
