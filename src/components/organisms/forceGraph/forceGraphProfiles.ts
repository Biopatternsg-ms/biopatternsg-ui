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
 * Visual profiles for the Force-Directed Graph.
 *
 * The background selected in ForceGraphViewer (`background` prop) picks one
 * of these profiles, which defines: background color, node size, node
 * spacing, link colors and link widths.
 *
 * The "black" profile is based on the original hardcoded values (links now white, widths +50%).
 */

/** Backgrounds supported by ForceGraphViewer. */
export type GraphBackground = "black" | "white" | "skyblue";

export interface GraphVisualProfile {
  /** Canvas background color. */
  backgroundColor: string;

  /** Nodes. */
  node: {
    /** Sphere size (ForceGraph3D `nodeRelSize`). */
    relSize: number;
    /** Label color (normal). */
    labelColor: string;
    /** Label color when dimmed (node not connected to selection). */
    labelDimmedColor: string;
    /** Label text height. */
    labelTextHeight: number;
    /** Label vertical offset from node center. */
    labelOffsetY: number;
    /** Color for selected / highlighted nodes. */
    highlightColor: string;
  };

  /** Node spacing (d3-force physics). */
  spacing: {
    linkDistance: number;
    chargeStrength: number;
  };

  /** Link colors. */
  linkColor: {
    default: string;
    connected: string;
    dimmed: string;
    highlighted: string;
  };

  /** Link widths. */
  linkWidth: {
    default: number;
    connected: number;
    highlighted: number;
    arrowLength: number;
    /** Arrow/cone opacity (0.0 to 1.0). */
    arrowOpacity: number;
  };
}

export const GRAPH_PROFILES: Record<GraphBackground, GraphVisualProfile> = {
  /* ── Black: original values, unchanged ── */
  black: {
    backgroundColor: "rgba(10,10,20,1)",
    node: {
      relSize: 5,
      labelColor: "rgba(255,255,255,0.92)",
      labelDimmedColor: "rgba(255,255,255,0.2)",
      labelTextHeight: 3.5,
      labelOffsetY: -10,
      highlightColor: "#ffffff",
    },
    spacing: { linkDistance: 45, chargeStrength: -120 },
    linkColor: {
      default: "#ffffff",
      connected: "#ffffff",
      dimmed: "rgba(255, 255, 255, 0.15)",
      highlighted: "#ffffff",
    },
    linkWidth: { default: 0.9, connected: 1.8, highlighted: 3.75, arrowLength: 4, arrowOpacity: 0.3 },
  },

  /* ── White: same sizes, inverted palette (dark slate / black) ── */
  white: {
    backgroundColor: "#ffffff",
    node: {
      relSize: 5,
      labelColor: "rgba(15,23,42,0.92)",
      labelDimmedColor: "rgba(15,23,42,0.2)",
      labelTextHeight: 3.5,
      labelOffsetY: -10,
      highlightColor: "#0f172a",
    },
    spacing: { linkDistance: 45, chargeStrength: -120 },
    linkColor: {
      default: "#000000",
      connected: "#000000",
      dimmed: "rgba(0, 0, 0, 0.15)",
      highlighted: "#000000",
    },
    linkWidth: { default: 0.9, connected: 1.8, highlighted: 3.75, arrowLength: 4, arrowOpacity: 0.30 },
  },

  /* ── Sky blue: #87CEEB background, black links and labels ── */
  skyblue: {
    backgroundColor: "#87ceeb",
    node: {
      relSize: 5,
      labelColor: "rgba(12,30,60,0.92)",
      labelDimmedColor: "rgba(12,30,60,0.25)",
      labelTextHeight: 3.5,
      labelOffsetY: -10,
      highlightColor: "#ffffff",
    },
    spacing: { linkDistance: 45, chargeStrength: -120 },
    linkColor: {
      default: "#1E3A8A",
      connected: "#1E3A8A",
      dimmed: "rgba(0, 0, 0, 0.15)",
      highlighted: "#1E3A8A",
    },
    linkWidth: { default: 0.9, connected: 1.8, highlighted: 3.75, arrowLength: 4, arrowOpacity: 0.6 },
  },
};

/** Default background when none is provided. */
export const DEFAULT_GRAPH_BACKGROUND: GraphBackground = "black";

/** Resolve the visual profile for a given background. */
export function getGraphProfile(
  bg: GraphBackground = DEFAULT_GRAPH_BACKGROUND,
): GraphVisualProfile {
  return GRAPH_PROFILES[bg] ?? GRAPH_PROFILES[DEFAULT_GRAPH_BACKGROUND];
}
