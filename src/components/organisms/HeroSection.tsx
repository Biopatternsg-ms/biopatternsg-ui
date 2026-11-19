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

import { DataForm } from "@/components/organisms/DataForm";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";
import type { LoginFormValues } from "@/domain/models/Auth";
import * as z from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export interface HeroSectionProps {
  loginConfig: DataFormConfig<LoginFormValues>;
}

/**
 * HeroSection Organism.
 * Editorial asymmetric layout: 7/5 column split.
 * Purely presentational organism — receives configured login contract from parent module.
 */
const HeroSection = ({ loginConfig }: HeroSectionProps) => {
  return (
    <section className="relative px-8 pt-20 pb-10 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Left — Editorial copy */}
      <div className="lg:col-span-7 space-y-8">
        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-on-surface leading-[0.9]">
          Build Gene Regulatory <span className="text-primary">Networks</span> with AI.
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
          Combine Generative AI and Logic AI to transform scientific literature into validated regulatory models.
        </p>
      </div>

      {/* Right — Login form glassmorphism card */}
      <div className="lg:col-span-5">
        <DataForm config={loginConfig} />
      </div>
    </section>
  );
};

export { HeroSection };
