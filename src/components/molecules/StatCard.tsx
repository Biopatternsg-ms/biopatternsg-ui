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

export interface StatCardProps {
  value: string;
  valueAccent?: string;
  accentColor?: string;
  label: string;
  className?: string;
}

const StatCard = ({
  value,
  valueAccent,
  accentColor = "text-primary",
  label,
  className,
}: StatCardProps) => (
  <div className={cn("space-y-2", className)}>
    <p className="font-label text-4xl font-bold tracking-tighter">
      {value}
      {valueAccent && (
        <span className={accentColor}>{valueAccent}</span>
      )}
    </p>
    <p className="text-xs uppercase font-bold tracking-[0.2em] text-on-surface-variant">
      {label}
    </p>
  </div>
);

export { StatCard };
