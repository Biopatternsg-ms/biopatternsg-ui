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
import { cn } from "@/lib/utils";

export interface BenefitCardProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Benefit / feature card used in the 3-column grid.
 * "No-Line" rule: bg depth used for visual separation.
 */
const BenefitCard = ({ title, description, className }: BenefitCardProps) => (
  <div
    className={cn(
      "p-8 rounded-xl bg-surface-container-high/30 space-y-4",
      className
    )}
  >
    <h4 className="font-bold text-lg">{title}</h4>
    <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
  </div>
);

export { BenefitCard };
