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
  DEFAULT_NODE_COLOR,
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
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */

function resolveLabel(ref: string | GraphNode, allNodes: GraphNode[]): string {
  const id = getNodeId(ref);
  return allNodes.find((n) => n.id === id)?.name ?? id;
}

function resolveColor(ref: string | GraphNode, allNodes: GraphNode[]): string {
  if (typeof ref !== "string" && ref.color) {
    return ref.color;
  }
  const id = getNodeId(ref);
  return allNodes.find((n) => n.id === id)?.color ?? DEFAULT_NODE_COLOR;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * NodeDetailPanel — Molecule
 *
 * Docked side panel alongside the ForceGraphCanvas:
 *   - Shares the same height as the graph canvas without covering it
 *   - Shows the selected node's name and biological role
 *   - Displays topological metrics (outgoing/incoming interactions, pathway occurrences)
 *   - Lists all connections (clickable → highlights both participating nodes)
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
  if (!isOpen) return null;

  const typeColor = node.color ?? DEFAULT_NODE_COLOR;

  const outgoingCount = connections.filter((l) => getNodeId(l.source) === node.id).length;
  const incomingCount = connections.filter((l) => getNodeId(l.target) === node.id).length;
  const totalPathwayOccurrences = connections.reduce(
    (sum, l) => sum + (typeof l.pathwayCount === "number" ? l.pathwayCount : 0),
    0
  );

  return (
    <aside
      className={cn(
        "w-full lg:w-[360px] shrink-0 h-full",
        "bg-surface-card rounded-2xl border border-outline-variant/20 shadow-md",
        "flex flex-col overflow-hidden transition-all duration-200",
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
          aria-label="Close panel"
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
        {/* ── Node Topological Summary ──────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Node Summary
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/15">
              <span className="block text-[9px] font-label font-bold uppercase tracking-wider text-on-surface-variant/75">
                Total Degree
              </span>
              <span className="mt-1 block text-base font-headline font-bold text-on-surface">
                {connections.length} edges
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/15">
              <span className="block text-[9px] font-label font-bold uppercase tracking-wider text-on-surface-variant/75">
                Outgoing / Incoming
              </span>
              <span className="mt-1 block text-base font-headline font-bold text-on-surface">
                {outgoingCount} → / ← {incomingCount}
              </span>
            </div>
            {totalPathwayOccurrences > 0 && (
              <div className="col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <span className="block text-[9px] font-label font-bold uppercase tracking-wider text-primary">
                  Pathway Transitions Frequency
                </span>
                <span className="mt-1 block text-base font-headline font-bold text-primary">
                  {totalPathwayOccurrences.toLocaleString()} pathway transitions
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Connections list ───────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Causal Connections ({connections.length})
          </h3>

          <ul className="space-y-1.5">
            {connections.map((link, i) => {
              const srcId = getNodeId(link.source);
              const tgtId = getNodeId(link.target);
              const isOutgoing = srcId === node.id;
              const otherLabel = isOutgoing
                ? resolveLabel(link.target, allNodes)
                : resolveLabel(link.source, allNodes);
              const otherColor = isOutgoing
                ? resolveColor(link.target, allNodes)
                : resolveColor(link.source, allNodes);
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {otherLabel}
                        </p>
                        {typeof link.pathwayCount === "number" && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant shrink-0">
                            {link.pathwayCount.toLocaleString()}x
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                        {isOutgoing
                          ? `${node.name} —[${link.interaction}]→ ${otherLabel}`
                          : `${otherLabel} —[${link.interaction}]→ ${node.name}`}
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
      </div>

      {/* ── Footer hint ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-outline-variant/10 text-center">
        <span className="text-[9px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60">
          Click on a connection to highlight both participating nodes
        </span>
      </div>
    </aside>
  );
};

NodeDetailPanel.displayName = "NodeDetailPanel";

export { NodeDetailPanel };
