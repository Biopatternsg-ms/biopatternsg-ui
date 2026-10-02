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
 * Type definitions and constants for the Force-Directed Graph visualization.
 *
 * These types are shared across ForceGraphCanvas (atom),
 * NodeDetailPanel (molecule), and ForceGraphViewer (organism).
 */

/* ─────────────────────────────────────────────────────────────────────────────
   CONSUMER INPUT TYPES — What the view page provides
   ───────────────────────────────────────────────────────────────────────────── */

/** A node as provided by the consumer. Only `name` and `type` are required. */
export interface GraphNodeInput {
  name: string;
  type: string;
}

/** A connection as provided by the consumer. */
export interface GraphLinkInput {
  object1: string;
  interaction: string;
  object2: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERNAL TYPES — What ForceGraph2D consumes
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * Internal node representation consumed by ForceGraph2D.
 *
 * `x`, `y`, `vx`, `vy` are injected at runtime by d3-force.
 */
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  color: string;
  // d3-force runtime
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

/** Internal link representation consumed by ForceGraph2D. */
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  interaction: string;
  index?: number;
}

/** The graphData shape expected by ForceGraph2D. */
export interface ForceGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   COLOR PALETTE — Biological type → color mapping
   ───────────────────────────────────────────────────────────────────────────── */

/** Map from biological node type to display color. */
export const TYPE_COLOR_MAP: Record<string, string> = {
  "Protein":          "#0066ff",
  "Small Molecule":   "#ff6b35",
  "Second Messenger": "#10b981",
  "Gene":             "#f59e0b",
  "RNA":              "#ec4899",
  "Lipid":            "#8b5cf6",
  "Protein Complex":  "#06b6d4",
};

/** Fallback color for unknown types. */
export const DEFAULT_NODE_COLOR = "#94a3b8";

/** Highlight color for selected/active elements. */
export const HIGHLIGHT_COLOR = "#ffffff";

/** Opacity for non-connected elements when a node is selected. */
export const DIMMED_OPACITY = 0.12;

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */

/** Extract the string ID from a link endpoint (which d3-force mutates to a node object). */
export function getNodeId(ref: string | GraphNode): string {
  return typeof ref === "string" ? ref : ref.id;
}

/** Build a unique key for a link. */
export function linkKey(link: GraphLink): string {
  return `${getNodeId(link.source)}__${getNodeId(link.target)}__${link.interaction}`;
}

/** Resolve node color from type. */
export function colorForType(type: string): string {
  return TYPE_COLOR_MAP[type] ?? DEFAULT_NODE_COLOR;
}
