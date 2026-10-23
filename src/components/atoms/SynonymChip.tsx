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
}

export function SynonymChip({
  synonym,
  onClick,
  showMenuIcon = false,
  className,
  title,
}: SynonymChipProps) {
  const content = (
    <>
      <span className="truncate">{synonym}</span>
      {showMenuIcon && (
        <SlidersHorizontal className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
      )}
    </>
  );

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all shadow-2xs",
    onClick && "hover:scale-102 cursor-pointer group",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClasses}
        title={title || `Options for "${synonym}"`}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={baseClasses} title={title || synonym}>
      {content}
    </span>
  );
}
