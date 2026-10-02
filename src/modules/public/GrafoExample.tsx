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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DOCUMENTACIÓN DE USO — ForceGraphViewer
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `ForceGraphViewer` renderiza un grafo interactivo basado en fuerzas físicas
 * con flechas direccionales, usando `react-force-graph-2d`.
 *
 * Solo necesitas 2 arreglos: nodos y conexiones.
 *
 * ## Uso mínimo
 *
 * ```tsx
 * import { ForceGraphViewer } from "@/components/organisms/forceGraph/ForceGraphViewer";
 * import type {
 *   GraphNodeInput,
 *   GraphLinkInput,
 * } from "@/components/organisms/forceGraph/forceGraphTypes";
 *
 * const nodes: GraphNodeInput[] = [
 *   { name: "TP53",    type: "Protein" },
 *   { name: "MDM2",    type: "Protein" },
 *   { name: "CDKN1A",  type: "Gene" },
 * ];
 *
 * const links: GraphLinkInput[] = [
 *   { object1: "TP53", interaction: "inhibit",  object2: "MDM2" },
 *   { object1: "TP53", interaction: "regulate", object2: "CDKN1A" },
 * ];
 *
 * <ForceGraphViewer nodes={nodes} links={links} />
 * ```
 *
 * ## Comportamiento automático
 *
 * - Los nodos se colorean según su `type` (ver TYPE_COLOR_MAP en forceGraphTypes.ts).
 * - Nodos con el mismo `name` se deduplicatan automáticamente.
 * - d3-force asigna posiciones automáticamente (sin coordenadas).
 * - Cada enlace tiene una flecha direccional en el extremo destino.
 * - Clic en nodo → resalta conexiones + abre panel lateral (30% ancho).
 * - Clic en espacio vacío → cierra panel.
 * - Clic en conexión (panel) → resalta los 2 nodos participantes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { ForceGraphViewer } from "@/components/organisms/forceGraph/ForceGraphViewer";
import type {
  GraphNodeInput,
  GraphLinkInput,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import { TYPE_COLOR_MAP } from "@/components/organisms/forceGraph/forceGraphTypes";

/* ═════════════════════════════════════════════════════════════════════════════
   DATOS — Red de señalización celular (Epinephrine → ADRB2 → cascada)
   ═════════════════════════════════════════════════════════════════════════════ */

const exampleNodes: GraphNodeInput[] = [
  { name: "Epinephrine", type: "Small Molecule" },
  { name: "ADRB2", type: "Protein" },
  { name: "Gs_alpha", type: "Protein" },
  { name: "Adenylyl_Cyclase", type: "Protein" },
  { name: "cAMP", type: "Second Messenger" },
  { name: "PRKACA", type: "Protein" },
  { name: "CREB1", type: "Protein" },
  { name: "CBP", type: "Protein" },
  { name: "CRE_Element", type: "Gene" },
  { name: "c-Fos_mRNA", type: "RNA" },
  { name: "FOS", type: "Protein" },
  { name: "miR-155", type: "RNA" },
  { name: "Gq_alpha", type: "Protein" },
  { name: "PLCB1", type: "Protein" },
  { name: "PIP2", type: "Lipid" },
  { name: "IP3", type: "Second Messenger" },
  { name: "DAG", type: "Lipid" },
  { name: "ITPR1", type: "Protein" },
  { name: "Calcium_Ion", type: "Small Molecule" },
  { name: "PRKCA", type: "Protein" },
  { name: "CALM1", type: "Protein" },
  { name: "CAMK2A", type: "Protein" },
  { name: "NFKB1", type: "Protein" },
  { name: "RELA", type: "Protein" },
  { name: "NF-kappa-B_Complex", type: "Protein Complex" },
  { name: "NFKBIA", type: "Protein" },
  { name: "EIF4E", type: "Protein" },
  { name: "EIF4G1", type: "Protein" },
  { name: "eIF4F_Complex", type: "Protein Complex" },
  { name: "Cyclin_D1_mRNA", type: "RNA" },
];

const exampleLinks: GraphLinkInput[] = [
  { object1: "Epinephrine", interaction: "agonism / ligand binding", object2: "ADRB2" },
  { object1: "ADRB2", interaction: "GDP/GTP exchange activation", object2: "Gs_alpha" },
  { object1: "Gs_alpha", interaction: "enzymatic activation", object2: "Adenylyl_Cyclase" },
  { object1: "Adenylyl_Cyclase", interaction: "enzymatic synthesis", object2: "cAMP" },
  { object1: "cAMP", interaction: "allosteric activation", object2: "PRKACA" },
  { object1: "PRKACA", interaction: "regulatory phosphorylation", object2: "CREB1" },
  { object1: "CREB1", interaction: "co-activator recruitment", object2: "CBP" },
  { object1: "CREB1", interaction: "sequence-specific binding", object2: "CRE_Element" },
  { object1: "CRE_Element", interaction: "transcriptional induction", object2: "c-Fos_mRNA" },
  { object1: "c-Fos_mRNA", interaction: "translation template", object2: "FOS" },
  { object1: "miR-155", interaction: "mRNA degradation / silencing", object2: "FOS" },
  { object1: "ADRB2", interaction: "heterotrimeric coupling", object2: "Gq_alpha" },
  { object1: "Gq_alpha", interaction: "enzymatic activation", object2: "PLCB1" },
  { object1: "PLCB1", interaction: "enzymatic cleavage", object2: "PIP2" },
  { object1: "PIP2", interaction: "metabolic precursor", object2: "IP3" },
  { object1: "PIP2", interaction: "metabolic precursor", object2: "DAG" },
  { object1: "IP3", interaction: "ligand-gated channel opening", object2: "ITPR1" },
  { object1: "ITPR1", interaction: "intracellular release", object2: "Calcium_Ion" },
  { object1: "Calcium_Ion", interaction: "co-factor activation", object2: "PRKCA" },
  { object1: "DAG", interaction: "allosteric membrane recruitment", object2: "PRKCA" },
  { object1: "Calcium_Ion", interaction: "stoichiometric binding", object2: "CALM1" },
  { object1: "CALM1", interaction: "allosteric activation", object2: "CAMK2A" },
  { object1: "PRKCA", interaction: "phosphorylation / activation", object2: "NFKBIA" },
  { object1: "NFKB1", interaction: "subunit assembly", object2: "NF-kappa-B_Complex" },
  { object1: "RELA", interaction: "subunit assembly", object2: "NF-kappa-B_Complex" },
  { object1: "NFKBIA", interaction: "inhibitory complex binding", object2: "NF-kappa-B_Complex" },
  { object1: "NF-kappa-B_Complex", interaction: "transcriptional induction", object2: "Cyclin_D1_mRNA" },
  { object1: "PRKACA", interaction: "phosphorylation / dissociation", object2: "NFKBIA" },
  { object1: "EIF4E", interaction: "multiprotein assembly", object2: "eIF4F_Complex" },
  { object1: "EIF4G1", interaction: "scaffold assembly", object2: "eIF4F_Complex" },
  { object1: "eIF4F_Complex", interaction: "5-prime cap recognition / translation", object2: "Cyclin_D1_mRNA" },
  { object1: "PRKACA", interaction: "desensitization phosphorylation", object2: "ADRB2" },
  { object1: "PRKCA", interaction: "desensitization phosphorylation", object2: "ADRB2" },
  { object1: "CAMK2A", interaction: "regulatory phosphorylation", object2: "CREB1" },
  { object1: "CBP", interaction: "histone acetyltransferase coactivation", object2: "RELA" },
  { object1: "NF-kappa-B_Complex", interaction: "transcriptional induction", object2: "miR-155" },
  { object1: "NF-kappa-B_Complex", interaction: "transcriptional feedback induction", object2: "NFKBIA" },
  { object1: "Calcium_Ion", interaction: "allosteric regulation", object2: "Adenylyl_Cyclase" },
  { object1: "CAMK2A", interaction: "regulatory phosphorylation", object2: "ITPR1" },
  { object1: "PRKACA", interaction: "inhibitory phosphorylation", object2: "PLCB1" },
  { object1: "PRKCA", interaction: "inhibitory phosphorylation", object2: "PLCB1" },
  { object1: "CALM1", interaction: "allosteric calcium sensor binding", object2: "Adenylyl_Cyclase" },
  { object1: "CALM1", interaction: "functional binding", object2: "ITPR1" },
  { object1: "PRKACA", interaction: "regulatory phosphorylation", object2: "ITPR1" },
  { object1: "FOS", interaction: "transcriptional activation", object2: "Cyclin_D1_mRNA" },
  { object1: "FOS", interaction: "promoter binding", object2: "CRE_Element" },
  { object1: "FOS", interaction: "transcriptional repression", object2: "ADRB2" },
  { object1: "CREB1", interaction: "transcriptional induction", object2: "Cyclin_D1_mRNA" },
  { object1: "PRKCA", interaction: "direct activation", object2: "RELA" },
  { object1: "CAMK2A", interaction: "regulatory phosphorylation", object2: "NFKBIA" },
  { object1: "PRKACA", interaction: "direct phosphorylation / activation", object2: "RELA" },
  { object1: "PIP2", interaction: "membrane anchorage", object2: "ADRB2" },
  { object1: "PIP2", interaction: "actin/membrane crosslinking", object2: "PLCB1" },
  { object1: "eIF4F_Complex", interaction: "translational initiation", object2: "c-Fos_mRNA" },
  { object1: "Calcium_Ion", interaction: "negative feedback inactivation", object2: "ITPR1" },
  { object1: "NFKB1", interaction: "direct physical association", object2: "CBP" },
  { object1: "PRKCA", interaction: "activation phosphorylation", object2: "EIF4G1" },
  { object1: "miR-155", interaction: "translational repression", object2: "NFKB1" },
  { object1: "miR-155", interaction: "post-transcriptional repression", object2: "CREB1" },
  { object1: "Gs_alpha", interaction: "intrinsic GTPase deactivation", object2: "Adenylyl_Cyclase" },
  { object1: "Gq_alpha", interaction: "GTP hydrolysis deactivation", object2: "PLCB1" },
  { object1: "cAMP", interaction: "negative cooperativity dissociation", object2: "PRKACA" },
];

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE VIEW
   ═════════════════════════════════════════════════════════════════════════════ */

const GrafoExample = () => {
  const legendEntries = Object.entries(TYPE_COLOR_MAP);

  return (
    <div className="bg-background text-on-background font-body min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        {/* ── Page heading ────────────────────────────────────────────────────── */}
        <section className="px-8 pt-10 pb-6 max-w-screen-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/15 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            Force-Directed Graph
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">
            Red de Señalización Celular
          </h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-4">
            Cascada de señalización{" "}
            <strong className="text-on-surface">Epinephrine → ADRB2</strong> con
            vías Gs/cAMP/PKA, Gq/PLC/Calcio, y regulación NF-κB.
            Los nodos se distribuyen automáticamente mediante simulación de fuerzas físicas.
          </p>

          {/* ── Color legend ──────────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-surface-variant">
            {legendEntries.map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                {type}
              </span>
            ))}
          </div>
        </section>

        {/* ── Graph ───────────────────────────────────────────────────────────── */}
        <section className="max-w-screen-2xl mx-auto px-8">
          <div className="rounded-2xl border border-outline-variant/15 shadow-ambient overflow-hidden">
            <ForceGraphViewer
              nodes={exampleNodes}
              links={exampleLinks}
              height={700}
              linkDistance={45}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GrafoExample;
