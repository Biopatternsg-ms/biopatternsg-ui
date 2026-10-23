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
import { cn } from "@/lib/utils";

export interface StepStatItem {
  label: string;
  value: string | number;
  valueColor?: string;
}

export interface StepStatsBarProps {
  stats: StepStatItem[];
  className?: string;
}

export function StepStatsBar({ stats, className }: StepStatsBarProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs text-on-surface-variant font-medium flex-wrap",
        className
      )}
    >
      {stats.map((stat, idx) => (
        <React.Fragment key={stat.label}>
          {idx > 0 && <span className="text-outline-variant/40">•</span>}
          <span>
            {stat.label}:{" "}
            <strong className={stat.valueColor || "text-on-surface"}>
              {stat.value}
            </strong>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
