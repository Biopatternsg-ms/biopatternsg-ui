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
import { Database, Brain, GitMerge } from "lucide-react";

export const WorkflowSection = () => {
  return (
    <section className="px-8 py-24 max-w-screen-2xl mx-auto border-t border-outline-variant/15">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">
          Automated Discovery Pipeline
        </h2>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
          From unstructured scientific literature to formal, logical Gene Regulatory Networks in three automated steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connector Line (visible on md+) */}
        <div className="hidden md:block absolute top-1/2 left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent -translate-y-1/2 z-0" />

        {/* Step 1 */}
        <div className="bg-surface-container-low rounded-2xl p-8 relative z-10 border border-outline-variant/10 shadow-ambient-sm hover:shadow-ambient transition-shadow">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-6">
            <Database className="w-7 h-7 text-on-primary-container" />
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-3">1. Data Gathering</h3>
          <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
            Automated retrieval of unstructured text and abstracts from specialized portals.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">PubMed</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">GeneOntology</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">MeSH</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-surface-container-low rounded-2xl p-8 relative z-10 border border-outline-variant/10 shadow-ambient-sm hover:shadow-ambient transition-shadow">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-6">
            <Brain className="w-7 h-7 text-on-primary-container" />
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-3">2. AI Extraction</h3>
          <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
            Generative AI models process text to extract biological entities and causal relationships.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">LLMs</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">PubTator</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">NER</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-surface-container-low rounded-2xl p-8 relative z-10 border border-outline-variant/10 shadow-ambient-sm hover:shadow-ambient transition-shadow">
          <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center mb-6">
            <GitMerge className="w-7 h-7 text-on-primary-container" />
          </div>
          <h3 className="text-xl font-bold font-headline text-on-surface mb-3">3. Logic Analysis</h3>
          <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
            Constraint logic programming formally validates and builds the final regulatory models.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">Prolog</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">CLP</span>
            <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface text-[10px] font-label uppercase tracking-widest font-bold rounded">GRNs</span>
          </div>
        </div>
      </div>
    </section>
  );
};
