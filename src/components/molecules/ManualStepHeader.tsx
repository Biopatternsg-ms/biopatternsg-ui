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
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export interface ManualStepHeaderProps {
  networkId?: string;
  experimentId?: string;
  experimentName?: string;
  stepTitle: string;
  stepDescription: string;
  badgeLabel?: string;
  badgeVariant?: "inProgress" | "pending" | "completed" | "primary";
  extraBadges?: React.ReactNode;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ManualStepHeader({
  networkId,
  experimentId,
  experimentName = "Experiment",
  stepTitle,
  stepDescription,
  badgeLabel = "Manual Execution Step",
  badgeVariant = "inProgress",
  extraBadges,
  icon: Icon,
  backHref,
  backLabel = "Back to Execution Monitor",
  onBack,
  actions,
  className,
}: ManualStepHeaderProps) {
  const navigate = useNavigate();

  const defaultExecutionHref = `/dashboard/experiments/${networkId || ""}/execution/${experimentId || ""}`;
  const resolvedBackHref = backHref || defaultExecutionHref;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(resolvedBackHref);
    }
  };

  const breadcrumbItems = networkId
    ? [
        { label: "Networks", href: "/dashboard/network" },
        { label: "Experiments", href: `/dashboard/experiments/${networkId}` },
        {
          label: experimentName || "Experiment",
          href: resolvedBackHref,
        },
        { label: stepTitle },
      ]
    : [
        { label: "Experiments" },
        { label: experimentName || "Experiment", href: resolvedBackHref },
        { label: stepTitle },
      ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Top Breadcrumb & Back Action */}
      <div className="flex justify-between items-center">
        <Breadcrumb items={breadcrumbItems} />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 hover:bg-surface-container-high text-on-surface-variant font-medium text-xs rounded-lg border border-outline-variant/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Button>
      </div>

      {/* Header Card Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-card p-6 rounded-3xl border border-outline-variant/15 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shrink-0 shadow-sm">
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
              {stepTitle}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {badgeLabel && (
                <Badge
                  variant={badgeVariant}
                  className="text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider"
                >
                  {badgeLabel}
                </Badge>
              )}
              {extraBadges}
            </div>
            <p className="text-on-surface-variant font-body text-xs max-w-xl leading-relaxed">
              {stepDescription}
            </p>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
