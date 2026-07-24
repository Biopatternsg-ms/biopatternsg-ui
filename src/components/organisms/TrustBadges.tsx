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
import { Database, Dna, Activity, BookOpen, type LucideIcon } from "lucide-react";

interface TrustSource {
  name: string;
  url: string;
  icon: LucideIcon;
}

const sources: TrustSource[] = [
  { name: "HGNC", url: "https://rest.genenames.org", icon: Database },
  { name: "Uniprot", url: "https://rest.uniprot.org", icon: Dna },
  { name: "TFBind", url: "https://tfbind.hgc.jp", icon: Activity },
  { name: "Pubmed", url: "https://pubmed.ncbi.nlm.nih.gov/", icon: BookOpen },
];

/**
 * TrustBadges Organism.
 *
 * Displays the external data sources the platform consults.
 * Each badge links to the source URL and opens in a new tab.
 */
const TrustBadges = () => (
  <section className="pt-8 pb-24 px-8 max-w-screen-2xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
        Trusted Data Sources
      </h2>
      <p className="mt-3 text-on-surface-variant font-body text-base max-w-xl mx-auto leading-relaxed">
        We integrate authoritative genomic and literature databases to ensure
        every insight is traceable to its original source.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {sources.map(({ name, url, icon: Icon }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-outline-variant/15 bg-surface-card/50 hover:bg-surface-container-low transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <span className="font-label text-sm font-bold text-on-surface tracking-wide">
            {name}
          </span>
        </a>
      ))}
    </div>
  </section>
);

export { TrustBadges };
