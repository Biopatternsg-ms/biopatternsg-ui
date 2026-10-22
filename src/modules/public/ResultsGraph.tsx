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
 * - Los nodos se colorean según su `type`: los tipos únicos se ordenan alfabéticamente y reciben un color de TYPE_COLOR_PALETTE (ver buildTypeColorMap en forceGraphTypes.ts). Opcionalmente puede pasarse `typeColorMap` para compartir el mismo mapa con otros componentes.
 * - Nodos con el mismo `name` se deduplicatan automáticamente.
 * - d3-force asigna posiciones automáticamente (sin coordenadas).
 * - Cada enlace tiene una flecha direccional en el extremo destino.
 * - Clic en nodo → resalta conexiones + abre panel lateral (30% ancho).
 * - Clic en espacio vacío → cierra panel.
 * - Clic en conexión (panel) → resalta los 2 nodos participantes.
 *
 * ## Color de fondo / perfiles visuales
 *
 * La prop opcional `background` acepta `"black"` (por defecto), `"white"` o
 * `"skyblue"`. Cada valor selecciona un perfil (ver forceGraphProfiles.ts) que
 * define: color de fondo, tamaño de nodos, separación de nodos, color de las
 * conexiones y grosor de las conexiones.
 *
 * ```tsx
 * <ForceGraphViewer nodes={nodes} links={links} background="skyblue" />
 * ```
 *
 * Si se pasa `linkDistance`, sobrescribe la separación definida por el perfil.
 *
 * ## Selección controlada / buscador de nodos
 *
 * `ForceGraphViewer` permite controlar la selección desde el componente padre:
 * - `selectedNodeName`: Nombre del nodo seleccionado (`string | null`).
 * - `onSelectedNodeChange`: Notificación cuando la selección cambia internamente (clic en nodo, clic en fondo, o cerrar panel).
 *
 * Esto permite sincronizarlo bidireccionalmente con componentes como `NodeSearchSelect`:
 *
 * ```tsx
 * const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
 *
 * <NodeSearchSelect
 *   nodes={nodes}
 *   value={selectedNodeName}
 *   onChange={setSelectedNodeName}
 * />
 * <ForceGraphViewer
 *   nodes={nodes}
 *   links={links}
 *   selectedNodeName={selectedNodeName}
 *   onSelectedNodeChange={setSelectedNodeName}
 * />
 * ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import { ForceGraphViewer } from "@/components/organisms/forceGraph/ForceGraphViewer";
import { NodeSearchSelect } from "@/components/molecules/NodeSearchSelect";
import { GraphDataUploadModal } from "@/components/molecules/GraphDataUploadModal";
import type {
  GraphNodeInput,
  GraphLinkInput,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import { buildTypeColorMap } from "@/components/organisms/forceGraph/forceGraphTypes";
import type { GraphBackground } from "@/components/organisms/forceGraph/forceGraphProfiles";
import { filterLinksByValidNodes } from "@/utils/graphDataParser";

export interface ResultsGraphLocationState {
  title?: string;
  description?: string;
  nodes?: GraphNodeInput[];
  links?: GraphLinkInput[];
}

const DEFAULT_TITLE = "Experiment title";
const DEFAULT_DESCRIPTION =
  "Description or relevant information you would like to share about the experiment.";

/** Background selector options. */
const BACKGROUND_OPTIONS: { value: GraphBackground; label: string; swatch: string }[] = [
  { value: "black", label: "Black", swatch: "rgba(10,10,20,1)" },
  { value: "white", label: "White", swatch: "#ffffff" },
  { value: "skyblue", label: "Sky blue", swatch: "#87ceeb" },
];

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE VIEW
   ═════════════════════════════════════════════════════════════════════════════ */

const ResultsGraph = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = (location.state as ResultsGraphLocationState | null) ?? null;
  const title = routeState?.title?.trim() ? routeState.title : DEFAULT_TITLE;
  const description = routeState?.description?.trim()
    ? routeState.description
    : DEFAULT_DESCRIPTION;

  const hasInitialData =
    Array.isArray(routeState?.nodes) &&
    routeState.nodes.length > 0 &&
    Array.isArray(routeState?.links);

  const [arrayNodes, setArrayNodes] = useState<GraphNodeInput[]>(() =>
    hasInitialData && routeState?.nodes ? routeState.nodes : []
  );
  const [arrayLinks, setArrayLinks] = useState<GraphLinkInput[]>(() =>
    hasInitialData && routeState?.nodes && routeState?.links
      ? filterLinksByValidNodes(routeState.nodes, routeState.links)
      : []
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(!hasInitialData);

  const [background, setBackground] = useState<GraphBackground>("black");
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);

  const typeColorMap = useMemo(() => buildTypeColorMap(arrayNodes), [arrayNodes]);
  const legendEntries = useMemo(() => Object.entries(typeColorMap), [typeColorMap]);

  return (
    <div className="bg-background text-on-background font-body min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        {/* ── Page heading ────────────────────────────────────────────────────── */}
        <section className="px-8 pt-10 pb-6 max-w-screen-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/15 text-primary rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            EXPERIMENT GRAPH
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-4">
            {description}
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
          {/* ── Controls: Background selector & Node search ─────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold uppercase tracking-wide mr-1">Background:</span>
              {BACKGROUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBackground(opt.value)}
                  aria-pressed={background === opt.value}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    background === opt.value
                      ? "border-primary text-primary bg-primary-container/15"
                      : "border-outline-variant/30 hover:border-outline-variant"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-outline-variant/40 flex-shrink-0"
                    style={{ backgroundColor: opt.swatch }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-80">
              <span className="font-semibold uppercase tracking-wide shrink-0">Node:</span>
              <NodeSearchSelect
                nodes={arrayNodes}
                typeColorMap={typeColorMap}
                value={selectedNodeName}
                onChange={setSelectedNodeName}
                className="flex-1"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/15 shadow-ambient overflow-hidden">
            <ForceGraphViewer
              nodes={arrayNodes}
              links={arrayLinks}
              typeColorMap={typeColorMap}
              height={700}
              background={background}
              selectedNodeName={selectedNodeName}
              onSelectedNodeChange={setSelectedNodeName}
            />
          </div>
        </section>
      </main>

      <Footer />

      <GraphDataUploadModal
        open={isUploadModalOpen}
        onLoaded={({ nodes, links }) => {
          setArrayNodes(nodes);
          setArrayLinks(links);
          setSelectedNodeName(null);
          setIsUploadModalOpen(false);
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default ResultsGraph;
