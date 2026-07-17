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
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Atomic Breadcrumb component.
 *
 * Renders a horizontal trail of navigation items. Items with an `href` are
 * rendered as clickable ghost buttons; the last item (or items without `href`)
 * is rendered as active text. Items are separated by a chevron.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm font-body", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Button
                variant="ghost"
                onClick={() => navigate(item.href!)}
                className="text-on-surface-variant hover:text-primary gap-2"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Button>
            ) : (
              <span className="flex items-center gap-2 text-primary font-semibold">
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
