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
import { BenefitCard } from "@/components/molecules/BenefitCard";

const benefits = [
  {
    title: "Automated Knowledge Mining",
    description:
      "From thousands of scattered papers to structured regulatory models, with zero manual intervention required.",
  },
  {
    title: "Full Traceability",
    description:
      "Every node and edge in the network points back to its original source publication for expert validation.",
  },
  {
    title: "AI + Logic Reasoning",
    description:
      "Combines the rapid discovery of Large Language Models with the strict validation of Prolog logic programming.",
  },
];

/**
 * BenefitsSection Organism.
 *
 * Highlights the key value propositions of the platform.
 */
const BenefitsSection = () => (
  <section className="py-24 px-8 max-w-screen-2xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="font-headline text-3xl font-black text-on-surface tracking-tighter">
        Why Biopatternsg
      </h2>
      <p className="mt-3 text-on-surface-variant font-body text-sm max-w-xl mx-auto leading-relaxed">
        Built for precision, transparency, and speed in genomic research.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {benefits.map((benefit) => (
        <BenefitCard key={benefit.title} {...benefit} />
      ))}
    </div>
  </section>
);

export { BenefitsSection };
