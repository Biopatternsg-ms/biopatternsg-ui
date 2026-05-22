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
import { Input, type InputProps } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends InputProps {
  label: string;
  labelRight?: React.ReactNode;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, labelRight, containerClassName, className, ...inputProps }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex justify-between items-center">
          <Label>{label}</Label>
          {labelRight && <div>{labelRight}</div>}
        </div>
        <Input ref={ref} className={className} {...inputProps} />
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
