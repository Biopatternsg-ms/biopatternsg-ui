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
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { SuccessModal } from "@/components/atoms/SuccessModal";
import { FormField } from "@/components/molecules/FormField";
import {
  toRecoveryPayload,
  type RecoveryFormValues,
} from "@/adapters/authAdapter";
import { recoverPassword } from "@/services/authService";

const recoverySchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido.")
    .email("Ingresa un correo electrónico válido."),
});

/**
 * Organism: RecoveryForm
 * Single-field password recovery form. Posts the email to
 * POST /config-and-control/users/recovery-password and shows a success or
 * error modal. Either modal closes by redirecting the user to /dashboard.
 */
const RecoveryForm = () => {
  const navigate = useNavigate();
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [errorOpen, setErrorOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: RecoveryFormValues) => {
    try {
      const payload = toRecoveryPayload(values);
      const response = await recoverPassword(payload);

      if (response.ok) {
        setSuccessOpen(true);
        return;
      }

      setErrorOpen(true);
    } catch {
      setErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/dashboard");
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
    navigate("/dashboard");
  };

  return (
    <>
      <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface mb-2">
            Recover Access
          </h2>
          <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider mb-8">
            Node-04 Password Recovery
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <FormField
              label="Institutional Email"
              type="email"
              placeholder="name@institute.edu"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p
                role="alert"
                className="text-[11px] text-error font-label font-medium tracking-wide -mt-4"
              >
                {errors.email.message}
              </p>
            )}

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
                  Enviando...
                </>
              ) : (
                "Send Recovery Link"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              Remembered your password?
            </p>
            <Button
              variant="link"
              className="mt-2"
              type="button"
              onClick={() => navigate("/login")}
            >
              Back to the access portal
            </Button>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successOpen}
        title="¡Revisa tu correo!"
        message="Te hemos enviado un email, revisa tu correo electrónico"
        onClose={handleSuccessClose}
      />
      <ErrorModal
        open={errorOpen}
        title="Error de recuperación"
        message="Ocurrió un problema para recuperar tu contraseña"
        onClose={handleErrorClose}
      />
    </>
  );
};

export { RecoveryForm };
