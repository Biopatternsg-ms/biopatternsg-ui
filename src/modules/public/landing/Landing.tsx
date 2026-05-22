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
import { Header } from "@/components/organisms/Header";
import { HeroSection } from "@/components/organisms/HeroSection";
import { BentoSection } from "@/components/organisms/BentoSection";
import { StatsSection } from "@/components/organisms/StatsSection";
import { CTASection } from "@/components/organisms/CTASection";
import { Footer } from "@/components/organisms/Footer";

/**
 * Landing Page — Public module
 * Assembles all organisms into the full page layout.
 *
 * Atomic Design hierarchy used:
 *   Atoms   → Button, Input, Label, Badge, NavLink
 *   Molecules → FormField, StatCard, BentoFeatureCard, BentoSideCard, BenefitCard
 *   Organisms → Header, LoginForm, HeroSection, BentoSection, StatsSection, CTASection, Footer
 */
const Landing = () => (
  <div className="bg-background text-on-background font-body min-h-screen">
    {/* Fixed TopNavBar */}
    <Header />

    {/* Page content — offset for fixed nav */}
    <main className="pt-24">
      {/* 1. Hero: asymmetric layout + glassmorphic login */}
      <HeroSection />

      {/* 2. Bento Grid: Analytics Suite preview */}
      <BentoSection />

      {/* 3. Stats + Benefits */}
      <StatsSection />

      {/* 4. CTA: gradient full-bleed block */}
      <CTASection />
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

export default Landing;
