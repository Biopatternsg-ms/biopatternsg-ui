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
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BenefitCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  className?: string;
}

/**
 * Benefit / feature card used in the 3-column grid.
 * Clinical Lens style with depth, subtle border, hover elevation, and icon anchor.
 */
const BenefitCard = ({ icon: Icon, title, description, tag, className }: BenefitCardProps) => (
  <div
    className={cn(
      "p-8 rounded-2xl bg-surface-card border border-outline-variant/15 shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6",
      className
    )}
  >
    <div className="space-y-4">
      {Icon && (
        <div className="w-12 h-12 bg-primary-container/15 rounded-xl flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="font-bold text-lg font-headline text-on-surface">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
    </div>

    {tag && (
      <div className="pt-2">
        <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">
          {tag}
        </span>
      </div>
    )}
  </div>
);

export { BenefitCard };
