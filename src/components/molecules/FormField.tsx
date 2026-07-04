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
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Select, type SelectOption } from "@/components/atoms/Select";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  label: string;
  type?: "text" | "email" | "password" | "file" | "textarea" | "select" | "number";
  labelRight?: React.ReactNode;
  containerClassName?: string;
  rows?: number;
  options?: SelectOption[];
} & Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.SelectHTMLAttributes<HTMLSelectElement>, "type">;

const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  ({ label, labelRight, containerClassName, className, type, rows, options, ...inputProps }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex justify-between items-baseline">
          <Label>{label}</Label>
          {labelRight && <div>{labelRight}</div>}
        </div>
        {type === "textarea" ? (
          <Textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={className}
            rows={rows}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : type === "select" ? (
          <Select
            ref={ref as React.Ref<HTMLSelectElement>}
            className={className}
            options={options}
            {...(inputProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
          />
        ) : (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={className}
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
