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
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-label font-bold uppercase transition-colors",
  {
    variants: {
      variant: {
        // Tertiary / success tone
        success:
          "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] tracking-widest",
        // Neutral surface
        neutral:
          "px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] tracking-widest",
        // Primary accent
        primary:
          "px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] tracking-widest",
        // Live pulse badge
        live:
          "px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] tracking-[0.3em]",
        // Experiment status — Nuevo
        new:
          "px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] tracking-widest",
        // Experiment status — En progreso
        inProgress:
          "px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30 text-[10px] tracking-widest",
        // Experiment status — Completado
        completed:
          "px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 text-[10px] tracking-widest",
        // Experiment status — Fallido (Rojo)
        failed:
          "px-3 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/30 text-[10px] tracking-widest",
        // Experiment status — Pendiente (Gris)
        pending:
          "px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50 text-[10px] tracking-widest",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, className }))} {...props} />
);

export { Badge, badgeVariants };
