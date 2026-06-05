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
import { useNavigate } from "react-router-dom";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { LoginFormValues } from "@/adapters/authAdapter";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

export interface LoginFormFieldsProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}

const LoginFormFields = ({ register, errors }: LoginFormFieldsProps) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          type="email"
          placeholder="name@institute.edu"
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        <p className="text-[11px] text-on-surface-variant font-label font-medium tracking-wide">
          Ingresa tu correo electrónico
        </p>
        {errors.username && (
          <ErrorMessage>{errors.username.message}</ErrorMessage>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/recovery-password")}
            className="text-[11px] text-primary font-bold uppercase tracking-widest hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        {errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
      </div>
    </div>
  );
};

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide">
    {children}
  </p>
);

LoginFormFields.displayName = "LoginFormFields";

export { LoginFormFields };
