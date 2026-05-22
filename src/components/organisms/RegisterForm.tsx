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
import { SuccessModal } from "@/components/atoms/SuccessModal";
import { RegisterFormFields } from "@/components/molecules/RegisterFormFields";
import { toRegisterPayload, type RegisterFormValues } from "@/adapters/userAdapter";
import { registerUser } from "@/services/userService";

/* ─── Validation Schema ──────────────────────────────────────────────────── */
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido.")
    .email("Ingresa un correo institucional válido."),
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre es demasiado largo."),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(50, "El apellido es demasiado largo."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga."),
});

/**
 * Organism: RegisterForm
 * Built using the same structural and aesthetic formulas of the clinical dashboard.
 *
 * Rules Adhered:
 *   - "Glass & Gradient" Rule: Uses a glass-panel wrapper with blur effect and pulse-gradient button.
 *   - "No-Line" Rule: Uses ghost-border at outline-variant/15 opacity rather than hard borders.
 *   - Business flow: maps form inputs to request payload using adapters, hits the register API endpoint,
 *     and shows a Success Modal on 201 response.
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    try {
      const payload = toRegisterPayload(values);
      const response = await registerUser(payload);

      if (response.status === 201) {
        setModalOpen(true);
        return;
      }

      // Handle 4xx / Client validation errors returned by backend
      if (response.status >= 400 && response.status < 500) {
        let errorMsg = "Error en los datos suministrados. Por favor verifique.";
        try {
          const resJson = await response.json();
          if (resJson && typeof resJson.message === "string") {
            errorMsg = resJson.message;
          } else if (resJson && typeof resJson.error === "string") {
            errorMsg = resJson.error;
          }
        } catch {
          // Response is not JSON
        }
        setApiError(errorMsg);
        return;
      }

      // Handle 5xx / Server errors
      setApiError("Error en el servidor. Por favor, intente de nuevo más tarde.");
    } catch {
      // Handle Network-level errors
      setApiError("No se pudo conectar con el servidor. Verifique su conexión de red.");
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
        {/* Decorative background blur orb */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface mb-2">
            Join the Research Network
          </h2>
          <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider mb-8">
            Node-04 Registration Portal
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Form Fields Molecule */}
            <RegisterFormFields register={register} errors={errors} />

            {/* API level error warning */}
            {apiError && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-error-container text-on-error-container text-xs font-label leading-relaxed flex gap-2 items-center"
              >
                <span className="font-bold">⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* Submit Button */}
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
                  Registrando...
                </>
              ) : (
                "Initialize Registration"
              )}
            </Button>
          </form>

          {/* Account redirect link */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              ¿Ya eres investigador registrado?
            </p>
            <Button
              variant="link"
              className="mt-2 text-sm"
              type="button"
              onClick={() => navigate("/")}
            >
              Volver al portal de acceso
            </Button>
          </div>
        </div>
      </div>

      {/* Custom success modal popup */}
      <SuccessModal
        open={modalOpen}
        title="¡Registro exitoso!"
        message="registro exitoso, por favor verifique la bandeja de entrada de su correo"
        onClose={handleModalClose}
      />
    </>
  );
};

export { RegisterForm };
