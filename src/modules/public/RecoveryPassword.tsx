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
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { DataForm } from "@/components/organisms/DataForm";
import * as z from "zod";
import { toRecoveryPayload, type RecoveryFormValues } from "@/adapters/authAdapter";
import { recoverPassword } from "@/services/authService";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";

export const recoverySchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido.")
    .email("Ingresa un correo electrónico válido."),
});

/**
 * RecoveryPassword Page.
 *
 * Minimalist editorial layout featuring a centered single-input form.
 * Structure matches the Register page layout: Header, content, Footer.
 */
const RecoveryPassword = () => {
  const navigate = useNavigate();

  const recoveryConfig: DataFormConfig<RecoveryFormValues> = {
    schema: recoverySchema,
    fields: [
      {
        name: "email",
        label: "Institutional Email",
        type: "email",
        placeholder: "name@institute.edu",
        autoComplete: "email",
        colSpan: "full",
      },
    ],
    title: "Recover Access",
    subtitle: "Node-04 Password Recovery",
    submitLabel: "Send Recovery Link",
    submittingLabel: "Enviando...",
    onSubmit: async (values) => {
      const payload = toRecoveryPayload(values);
      return recoverPassword(payload);
    },
    successStatus: "ok",
    successModal: {
      title: "¡Revisa tu correo!",
      message: "Te hemos enviado un email, revisa tu correo electrónico",
    },
    errorModal: {
      title: "Error de recuperación",
      defaultMessage: "Ocurrió un problema para recuperar tu contraseña",
      parseResponseMessage: false,
    },
    onSuccessClose: () => {
      navigate("/");
    },
    onErrorClose: () => {
      navigate("/");
    },
    footerLink: {
      text: "Remembered your password?",
      label: "Back to the access portal",
      to: "/",
    },
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-28">
        <section className="bg-surface-section min-h-[calc(100vh-112px)] flex items-center justify-center px-8 py-16 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-lg">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Researcher Password Recovery
              </span>
            </div>

            <DataForm config={recoveryConfig} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RecoveryPassword;
