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

import { cn } from "@/lib/utils";
import type {
  GraphNode,
  GraphLink,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import {
  getNodeId,
  linkKey,
  colorForType,
} from "@/components/organisms/forceGraph/forceGraphTypes";

/* ─────────────────────────────────────────────────────────────────────────────
   PROPS
   ───────────────────────────────────────────────────────────────────────────── */

export interface NodeDetailPanelProps {
  /** The selected node. */
  node: GraphNode;
  /** Links where this node participates (as source or target). */
  connections: GraphLink[];
  /** All nodes in the graph (to resolve labels). */
  allNodes: GraphNode[];
  /** Key of the currently highlighted link. */
  highlightedLinkKey: string | null;
  /** Callback when a connection in the list is clicked. */
  onConnectionClick: (link: GraphLink) => void;
  /** Callback to close the panel. */
  onClose: () => void;
  /** Whether the panel is visible. */
  isOpen: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TABLE DATA (Lorem ipsum style, 8 rows × 4 columns)
   ───────────────────────────────────────────────────────────────────────────── */

const TABLE_HEADERS = ["Propiedad", "Valor", "Unidad", "Referencia"];

const TABLE_ROWS = [
  ["Expresión basal", "12.45", "TPM", "PMID:12345678"],
  ["Fold change", "3.2x", "—", "PMID:23456789"],
  ["P-value", "0.0023", "—", "PMID:34567890"],
  ["Localización", "Citoplasma", "—", "UniProt:Q9Y6K9"],
  ["Peso molecular", "48.3", "kDa", "UniProt:Q9Y6K9"],
  ["Interacciones", "14", "count", "STRING:9606"],
  ["Pathway", "JAK-STAT", "—", "KEGG:hsa04630"],
  ["Confianza", "0.92", "score", "IntAct:EBI-123"],
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */

function resolveLabel(ref: string | GraphNode, allNodes: GraphNode[]): string {
  const id = getNodeId(ref);
  return allNodes.find((n) => n.id === id)?.name ?? id;
}

function resolveType(ref: string | GraphNode, allNodes: GraphNode[]): string {
  const id = getNodeId(ref);
  return allNodes.find((n) => n.id === id)?.type ?? "";
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * NodeDetailPanel — Molecule
 *
 * Slide-in panel on the right edge of the viewport:
 *   - 30vw wide, 100vh tall
 *   - Shows the selected node's name and type
 *   - Lists all connections (clickable → highlights both participating nodes)
 *   - Shows a sample 8×4 data table
 */
const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  connections,
  allNodes,
  highlightedLinkKey,
  onConnectionClick,
  onClose,
  isOpen,
}) => {
  const typeColor = colorForType(node.type);

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-screen z-50 transition-transform duration-300 ease-in-out",
        "w-[30vw] min-w-[320px] max-w-[500px]",
        "bg-surface-card border-l border-outline-variant/20 shadow-2xl",
        "flex flex-col overflow-hidden",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15">
        <div className="space-y-1.5 min-w-0">
          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-label font-bold tracking-widest uppercase"
            style={{
              backgroundColor: `${typeColor}20`,
              color: typeColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: typeColor }}
            />
            {node.type}
          </span>

          {/* Node name */}
          <h2 className="text-lg font-headline font-bold text-on-surface tracking-tight truncate">
            {node.name}
          </h2>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer flex-shrink-0"
          aria-label="Cerrar panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
        {/* ── Connections list ───────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Conexiones ({connections.length})
          </h3>

          <ul className="space-y-1.5">
            {connections.map((link, i) => {
              const srcId = getNodeId(link.source);
              const tgtId = getNodeId(link.target);
              const isOutgoing = srcId === node.id;
              const otherLabel = isOutgoing
                ? resolveLabel(link.target, allNodes)
                : resolveLabel(link.source, allNodes);
              const otherType = isOutgoing
                ? resolveType(link.target, allNodes)
                : resolveType(link.source, allNodes);
              const otherColor = colorForType(otherType);
              const isActive = highlightedLinkKey === linkKey(link);

              return (
                <li key={`${srcId}-${tgtId}-${link.interaction}-${i}`}>
                  <button
                    onClick={() => onConnectionClick(link)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer",
                      "hover:bg-surface-container-high/60",
                      isActive
                        ? "bg-primary-container/20 border border-primary/30"
                        : "bg-surface-container-low/40 border border-transparent",
                    )}
                  >
                    {/* Direction arrow */}
                    <span
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold flex-shrink-0",
                      )}
                      style={{
                        backgroundColor: `${otherColor}20`,
                        color: otherColor,
                      }}
                    >
                      {isOutgoing ? "→" : "←"}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {otherLabel}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                        {link.interaction}
                      </p>
                    </div>

                    {/* Active dot */}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Data table (8×4 lorem ipsum) ──────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Datos Asociados
          </h3>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/15">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-container-high/50">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-label font-bold uppercase tracking-widest text-[9px] text-on-surface-variant"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-t border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 text-on-surface whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Footer hint ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-outline-variant/10 text-center">
        <span className="text-[9px] font-label uppercase tracking-[0.3em] text-on-surface-variant/50">
          Clic en una conexión para resaltar ambos nodos
        </span>
      </div>
    </div>
  );
};

NodeDetailPanel.displayName = "NodeDetailPanel";

export { NodeDetailPanel };
