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
import { toRegisterPayload, type RegisterFormValues } from "@/adapters/userAdapter";
import { registerUser } from "@/services/userService";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";

export const registerSchema = z.object({
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
 * Register Page — Authenticator module.
 *
 * Layout:
 *   - Shared fixed TopNavBar (Header).
 *   - Centered RegisterForm within a full-height body minus the header offset.
 *   - Shared Footer.
 *
 * Rules Adhered:
 *   - "Clinical Lens" aesthetics: body container uses .bg-surface-section for depth transition.
 *   - Offset padding-top adjusted to pt-28 to allow for the logo protruding 50% below the header.
 */
const Register = () => {
  const navigate = useNavigate();

  const registerConfig: DataFormConfig<RegisterFormValues> = {
    schema: registerSchema,
    fields: [
      {
        name: "email",
        label: "Institutional Email",
        type: "email",
        placeholder: "name@institute.edu",
        colSpan: "full",
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "Jane",
        colSpan: "half",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        colSpan: "half",
      },
      {
        name: "password",
        label: "Access Key",
        type: "password",
        placeholder: "••••••••",
        colSpan: "full",
      },
    ],
    title: "Join the Research Network",
    subtitle: "Node-04 Registration Portal",
    submitLabel: "Initialize Registration",
    submittingLabel: "Registrando...",
    onSubmit: async (values) => {
      const payload = toRegisterPayload(values);
      return registerUser(payload);
    },
    successStatus: 201,
    successModal: {
      title: "¡Registro exitoso!",
      message: "registro exitoso, por favor verifique la bandeja de entrada de su correo",
    },
    errorModal: {
      title: "No se pudo completar el registro",
      defaultMessage: "Error en el servidor. Por favor, intente de nuevo más tarde.",
      parseResponseMessage: true,
    },
    onSuccessClose: () => {
      navigate("/");
    },
    footerLink: {
      text: "¿Ya eres investigador registrado?",
      label: "Volver al portal de acceso",
      to: "/",
    },
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      {/* Shared TopNavBar */}
      <Header />

      {/* Main layout wrapper */}
      <main className="flex-1 pt-28">
        {/* Centering layout with sutil dot grid design element */}
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
            {/* Context Badge */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Researcher Onboarding Session
              </span>
            </div>

            {/* Registration Card Organism */}
            <DataForm config={registerConfig} />
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};

export default Register;
