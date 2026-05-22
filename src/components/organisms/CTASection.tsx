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
import { Button } from "@/components/atoms/Button";

/**
 * CTASection Organism.
 * Full-bleed gradient CTA block.
 * "Glass & Gradient" rule applied to the container.
 */
const CTASection = () => (
  <section className="px-8 pb-24">
    <div className="max-w-screen-xl mx-auto pulse-gradient p-16 rounded-[2rem] text-center text-white relative overflow-hidden">
      {/* Dot-grid decorative overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 space-y-8">
        <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">
          Ready to accelerate your research?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Join the world's most advanced clinical network. Deploy your first
          pipeline in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="primary"
            size="xl"
            className="bg-white text-primary hover:translate-y-[-2px] transition-all shadow-xl"
          >
            Register Institutional Lab
          </Button>
          <Button variant="outline" size="xl">
            Request Demo
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export { CTASection };
