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
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  initials?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const Avatar = ({ initials, size = "md" }: AvatarProps) => (
  <div
    className={cn(
      "rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center",
      sizeClasses[size]
    )}
    aria-label={initials ? `Avatar: ${initials}` : "User avatar"}
  >
    {initials ? (
      initials.slice(0, 2).toUpperCase()
    ) : (
      <User className="w-4 h-4" />
    )}
  </div>
);

export { Avatar };
