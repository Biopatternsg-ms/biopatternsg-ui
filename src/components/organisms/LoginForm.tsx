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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { SuccessModal } from "@/components/atoms/SuccessModal";
import { LoginFormFields } from "@/components/molecules/LoginFormFields";
import {
  toLoginPayload,
  type LoginFormValues,
} from "@/adapters/authAdapter";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import type { TokenPair } from "@/domain/models/Auth";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido.")
    .email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);
  const [pendingTokens, setPendingTokens] = React.useState<TokenPair | null>(null);

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (pendingTokens) {
      login(pendingTokens);
    }
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const payload = toLoginPayload(values);
      const response = await loginUser(payload);

      if (response.status === 200) {
        const data = (await response.json()) as TokenPair;
        setPendingTokens(data);

        const fromState = location.state as { from?: string } | null;
        const redirectTo = fromState?.from ?? "/dashboard/network";
        
        setRedirectPath(redirectTo);
        setSuccessModalOpen(true);
        return;
      }

      if (response.status === 401) {
        let msg = "Credenciales inválidas.";
        try {
          const resJson = await response.json();
          if (resJson && typeof resJson.message === "string") {
            msg = resJson.message;
          }
        } catch {
          // Response is not JSON
        }
        setErrorMessage(msg);
        setErrorModalOpen(true);
        return;
      }

      setErrorMessage("Ocurrió un error al momento de iniciar sesión.");
      setErrorModalOpen(true);
    } catch {
      setErrorMessage("Ocurrió un error al momento de iniciar sesión.");
      setErrorModalOpen(true);
    }
  };

  return (
    <>
      <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface mb-2">
            Access Lab Portal
          </h2>
          <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider mb-8">
            Node-04 Secure Entrance
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <LoginFormFields register={register} errors={errors} />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Initialize Session"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              New researcher on the team?
            </p>
            <Button
              variant="link"
              className="mt-2"
              type="button"
              onClick={() => navigate("/register")}
            >
              Create an institutional account
            </Button>
          </div>
        </div>
      </div>

      <ErrorModal
        open={errorModalOpen}
        message={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />

      <SuccessModal
        open={successModalOpen}
        title="¡Bienvenido!"
        message="Inicio de sesión exitoso. Redirigiendo..."
        onClose={handleSuccessClose}
      />
    </>
  );
};

export { LoginForm };
