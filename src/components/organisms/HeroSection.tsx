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
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { DataForm } from "@/components/organisms/DataForm";
import { useAuth } from "@/context/AuthContext";
import * as z from "zod";
import { toLoginPayload, type LoginFormValues } from "@/adapters/authAdapter";
import { loginUser } from "@/services/authService";
import type { TokenPair } from "@/domain/models/Auth";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido.")
    .email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

/**
 * HeroSection Organism.
 * Editorial asymmetric layout: 7/5 column split.
 */
const HeroSection = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingTokensRef = useRef<TokenPair | null>(null);
  const fromState = location.state as { from?: string } | null;
  const redirectPath = fromState?.from ?? "/dashboard/network";

  const loginConfig: DataFormConfig<LoginFormValues> = {
    schema: loginSchema,
    fields: [
      {
        name: "username",
        label: "Usuario",
        type: "email",
        placeholder: "name@institute.edu",
        helperText: "Ingresa tu correo electrónico",
        colSpan: "full",
      },
      {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "••••••••",
        colSpan: "full",
        labelRight: (
          <button
            type="button"
            onClick={() => navigate("/recovery-password")}
            className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
          >
            Forgot?
          </button>
        ),
      },
    ],
    title: "Access Lab Portal",
    subtitle: "Node-04 Secure Entrance",
    submitLabel: "Initialize Session",
    submittingLabel: "Iniciando sesión...",
    onSubmit: async (values) => {
      const payload = toLoginPayload(values);
      return loginUser(payload);
    },
    successStatus: 200,
    successModal: {
      title: "¡Bienvenido!",
      message: "Inicio de sesión exitoso. Redirigiendo...",
    },
    errorModal: {
      defaultMessage: "Ocurrió un error al momento de iniciar sesión.",
      parseResponseMessage: true,
    },
    onSuccessResponse: async (response) => {
      const data = (await response.json()) as TokenPair;
      pendingTokensRef.current = data;
    },
    onSuccessClose: () => {
      if (pendingTokensRef.current) {
        login(pendingTokensRef.current);
      }
      navigate(redirectPath, { replace: true });
    },
    footerLink: {
      text: "New researcher on the team?",
      label: "Create an institutional account",
      to: "/register",
    },
  };

  return (
    <section className="relative px-8 py-20 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Left — Editorial copy */}
      <div className="lg:col-span-7 space-y-8">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
          Live Sequencing Active
        </div>

        {/* Heading — tracking-tighter per Typography rule */}
        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-on-surface leading-[0.9]">
          Decipher the{" "}
          <span className="text-primary">Human</span>{" "}
          Blueprint.
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
          A high-precision clinical lens for genomic researchers. Streamline
          multi-omics analysis with AI-driven pattern recognition and real-time
          sequencing pipelines.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <Button variant="primary" size="lg" className="shadow-lg hover:shadow-primary-glow">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="surface" size="lg">
            View Documentation
          </Button>
        </div>
      </div>

      {/* Right — Login form glassmorphism card */}
      <div className="lg:col-span-5">
        <DataForm config={loginConfig} />
      </div>
    </section>
  );
};

export { HeroSection };
