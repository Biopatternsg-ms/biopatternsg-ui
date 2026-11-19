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
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/organisms/Header";
import { HeroSection, loginSchema } from "@/components/organisms/HeroSection";
import { WorkflowSection } from "@/components/organisms/WorkflowSection";
import { BenefitsSection } from "@/components/organisms/BenefitsSection";
import { TrustBadges } from "@/components/organisms/TrustBadges";
import { Footer } from "@/components/organisms/Footer";
import { useAuth } from "@/context/AuthContext";
import { toLoginPayload, type LoginFormValues } from "@/adapters/authAdapter";
import { loginUser } from "@/services/authService";
import type { TokenPair } from "@/domain/models/Auth";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";
import { extractAppRole, getRoleConfig } from "@/config/roles";

function parseJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Landing Page — Public module
 * Assembles all organisms into the full page layout and orchestrates authentication.
 */
const Landing = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const pendingTokensRef = useRef<TokenPair | null>(null);
  const pendingHomePathRef = useRef<string>("/dashboard/network");

  const loginConfig: DataFormConfig<LoginFormValues> = {
    schema: loginSchema,
    fields: [
      {
        name: "username",
        label: "Email address",
        type: "email",
        placeholder: "name@institute.edu",
        helperText: "Enter your email address",
        colSpan: "full",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        helperText: "Enter your account password",
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
    subtitle: "Secure Access Portal",
    submitLabel: "Sign in",
    submittingLabel: "Signing in...",
    onSubmit: async (values) => {
      const payload = toLoginPayload(values);
      return loginUser(payload);
    },
    successStatus: 200,
    successModal: {
      title: "Welcome!",
      message: "Sign in successful. Redirecting...",
    },
    errorModal: {
      defaultMessage: "An error occurred while signing in.",
      parseResponseMessage: true,
    },
    onSuccessResponse: async (response) => {
      const data = (await response.json()) as TokenPair;

      const jwtPayload = parseJwtPayload(data.access_token);
      const realmAccess = jwtPayload?.realm_access as { roles?: string[] } | undefined;
      const appRole = extractAppRole(realmAccess?.roles);

      if (!appRole) {
        throw new Error("User does not have an assigned role to access the platform.");
      }

      pendingTokensRef.current = data;
      pendingHomePathRef.current = getRoleConfig(appRole).homePath;
    },
    onSuccessClose: () => {
      if (pendingTokensRef.current) {
        login(pendingTokensRef.current);
      }
      navigate(pendingHomePathRef.current, { replace: true });
    },
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen">
      {/* Fixed TopNavBar */}
      <Header />

      {/* Page content — offset for fixed nav */}
      <main className="pt-24">
        {/* 1. Hero: asymmetric layout + glassmorphic login */}
        <HeroSection loginConfig={loginConfig} />

        {/* 2. Benefits */}
        <WorkflowSection />

        {/* 3. Workflow: Automated pipeline overview */}
        <BenefitsSection />

        {/* 4. Trusted Data Sources */}
        <TrustBadges />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
