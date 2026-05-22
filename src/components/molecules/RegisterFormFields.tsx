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
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormValues } from "@/adapters/userAdapter";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

export interface RegisterFormFieldsProps {
  /** The register function returned by react-hook-form's useForm */
  register: UseFormRegister<RegisterFormValues>;
  /** Error state object from react-hook-form */
  errors: FieldErrors<RegisterFormValues>;
}

/**
 * Molecule: RegisterFormFields
 * Groups together and structures the 4 required input fields for registering a researcher.
 *
 * It structures the layout as follows:
 *   - Institutional Email (full-width)
 *   - First Name & Last Name (two-column row)
 *   - Access Key / Password (full-width)
 * 
 * Rules Adhered:
 *   - "No-Line" Rule: utilizes background-based visual depth (bg-surface-container-high via Input) without lines.
 *   - Accessibility: uses htmlFor, aria-invalid, and role="alert" for error reporting.
 */
const RegisterFormFields = ({ register, errors }: RegisterFormFieldsProps) => {
  return (
    <div className="space-y-5">
      {/* 1. Institutional Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Institutional Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@institute.edu"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <ErrorMessage>{errors.email.message}</ErrorMessage>
        )}
      </div>

      {/* 2. Names (First & Last in 2 columns on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Jane"
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
          {errors.firstName && (
            <ErrorMessage>{errors.firstName.message}</ErrorMessage>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          {errors.lastName && (
            <ErrorMessage>{errors.lastName.message}</ErrorMessage>
          )}
        </div>
      </div>

      {/* 3. Security Key / Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Access Key</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
      </div>
    </div>
  );
};

/** Internal mini helper to display red error text nicely following the design system label styles */
const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide">
    {children}
  </p>
);

RegisterFormFields.displayName = "RegisterFormFields";

export { RegisterFormFields };
