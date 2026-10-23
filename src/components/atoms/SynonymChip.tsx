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

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SynonymChipProps {
  synonym: string;
  onClick?: () => void;
  showMenuIcon?: boolean;
  className?: string;
  title?: string;
  maxChars?: number;
}

export function SynonymChip({
  synonym,
  onClick,
  showMenuIcon = false,
  className,
  title,
  maxChars = 18,
}: SynonymChipProps) {
  const isTruncated = synonym.length > maxChars;
  const displayText = isTruncated
    ? `${synonym.slice(0, maxChars).trimEnd()}...`
    : synonym;

  const tooltipText = title || synonym;

  const content = (
    <>
      <span className="truncate">{displayText}</span>
      {showMenuIcon && (
        <SlidersHorizontal className="w-3 h-3 text-primary/70 group-hover/btn:text-primary transition-colors shrink-0" />
      )}
    </>
  );

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all shadow-2xs whitespace-nowrap",
    onClick && "hover:scale-102 cursor-pointer group/btn",
    className
  );

  return (
    <div className="relative group/chip inline-flex">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={baseClasses}
          title={tooltipText}
        >
          {content}
        </button>
      ) : (
        <span className={baseClasses} title={tooltipText}>
          {content}
        </span>
      )}

      {/* Floating Tooltip showing full text */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-mono font-medium rounded-lg shadow-xl whitespace-nowrap z-50 invisible opacity-0 group-hover/chip:visible group-hover/chip:opacity-100 transition-all duration-150 pointer-events-none">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface" />
      </div>
    </div>
  );
}
