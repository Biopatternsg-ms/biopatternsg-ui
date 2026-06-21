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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-surface-variant z-0 rounded-full" />
        
        {/* Active line */}
        <div 
          className="absolute left-0 top-5 -translate-y-1/2 h-1 bg-primary transition-all duration-500 z-0 rounded-full" 
          style={{ width: `${(Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted ? "bg-primary border-primary text-white" : "",
                  isActive ? "bg-surface-card border-primary text-primary shadow-primary-glow" : "",
                  isPending ? "bg-surface-card border-outline-variant text-on-surface-variant" : "",
                  onStepClick && "cursor-pointer hover:border-primary"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </button>
              
              <div className="mt-3 text-center w-32 hidden sm:block">
                <p className={cn(
                  "text-sm font-bold tracking-tight mb-0.5 transition-colors duration-300",
                  isActive || isCompleted ? "text-on-surface" : "text-on-surface-variant"
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-on-surface-variant font-medium leading-tight">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
