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
import { cn } from "@/lib/utils";

export interface BentoFeatureCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  badgesTop?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Large bento feature card (e.g. the Sequence Mapping card).
 * "No-Line" rule: separation done via bg-surface-container-lowest
 * and ambient shadow, no 1px border.
 */
const BentoFeatureCard = ({
  icon,
  iconBg = "bg-primary-fixed",
  title,
  subtitle,
  badgesTop,
  children,
  className,
}: BentoFeatureCardProps) => (
  <div
    className={cn(
      "bg-surface-container-lowest rounded-2xl p-8 flex flex-col group overflow-hidden relative",
      "shadow-ambient hover:shadow-ambient-md transition-shadow duration-300",
      className
    )}
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          {subtitle && (
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {badgesTop && <div className="flex gap-2">{badgesTop}</div>}
    </div>
    {children}
  </div>
);

export { BentoFeatureCard };
