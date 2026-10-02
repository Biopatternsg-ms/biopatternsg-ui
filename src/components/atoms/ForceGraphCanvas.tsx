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

import { useCallback, useRef, useEffect } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import type {
  GraphNode,
  GraphLink,
  ForceGraphData,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import {
  getNodeId,
  linkKey,
  HIGHLIGHT_COLOR,
  DIMMED_OPACITY,
} from "@/components/organisms/forceGraph/forceGraphTypes";

/* ─────────────────────────────────────────────────────────────────────────────
   PROPS
   ───────────────────────────────────────────────────────────────────────────── */

export interface ForceGraphCanvasProps {
  /** Graph data — nodes + links. */
  graphData: ForceGraphData;
  /** ID of the currently selected node. */
  selectedNodeId: string | null;
  /** Key of the link currently highlighted (from panel click). */
  highlightedLinkKey: string | null;
  /** Set of node IDs connected to the selected node. */
  connectedNodeIds: Set<string>;
  /** Set of link keys connected to the selected node. */
  connectedLinkKeys: Set<string>;
  /** Callbacks. */
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
  onBackgroundClick: () => void;
  /** Canvas dimensions. */
  width: number;
  height: number;
  /** Link distance for d3-force physics simulation (default: 45, +50% over standard 30). */
  linkDistance?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * ForceGraphCanvas — Atom
 *
 * Presentational wrapper around `<ForceGraph2D>` with:
 * - Directional arrows on every link (based on the react-force-graph
 *   "directional-links-arrows" example)
 * - Custom canvas rendering for nodes (circles colored by biological type)
 * - Link labels showing the `interaction` description at the midpoint
 * - Highlight / dim logic controlled entirely by the parent organism
 */
const ForceGraphCanvas: React.FC<ForceGraphCanvasProps> = ({
  graphData,
  selectedNodeId,
  highlightedLinkKey,
  connectedNodeIds,
  connectedLinkKeys,
  onNodeClick,
  onLinkClick,
  onBackgroundClick,
  width,
  height,
  linkDistance = 45,
}) => {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasSelection = selectedNodeId != null;

  // Initialize forces and zoom to fit after the physics settle
  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      // Configure link distance (+50% default = 45)
      const linkForce = fg.d3Force("link") as any;
      if (typeof linkForce?.distance === "function") {
        linkForce.distance(linkDistance);
      }

      // Repulsion force to complement increased link distance
      const chargeForce = fg.d3Force("charge") as any;
      if (typeof chargeForce?.strength === "function") {
        chargeForce.strength(-120);
      }

      fg.d3ReheatSimulation?.();
    }

    const timer = setTimeout(() => {
      fgRef.current?.zoomToFit(400, 60);
    }, 600);
    return () => clearTimeout(timer);
  }, [linkDistance]);

  /* ── Curvature for parallel links between the same node pair ────────────── */
  const getLinkCurvature = useCallback(
    (link: GraphLink) => {
      const s = getNodeId(link.source);
      const t = getNodeId(link.target);
      const pairKey = [s, t].sort().join("||");

      const siblings = graphData.links.filter((l) => {
        const ls = getNodeId(l.source);
        const lt = getNodeId(l.target);
        return [ls, lt].sort().join("||") === pairKey;
      });

      if (siblings.length <= 1) return 0;

      const idx = siblings.indexOf(link);
      const spread = 0.2;
      const center = (siblings.length - 1) / 2;
      return (idx - center) * spread;
    },
    [graphData.links],
  );

  /* ── Node canvas rendering ─────────────────────────────────────────────── */
  const drawNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = 4.5;
      const fontSize = Math.min(12 / globalScale, 5);

      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      const isHighlightedViaLink =
        highlightedLinkKey != null &&
        graphData.links.some(
          (l) =>
            linkKey(l) === highlightedLinkKey &&
            (getNodeId(l.source) === node.id || getNodeId(l.target) === node.id),
        );

      // Opacity
      let alpha = 1;
      if (hasSelection && !isSelected && !isConnected) {
        alpha = DIMMED_OPACITY;
      }

      // Color
      let color = node.color;
      if (isSelected || isHighlightedViaLink) {
        color = HIGHLIGHT_COLOR;
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      // Glow
      if (isSelected || isHighlightedViaLink) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 18;
      }

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Border
      ctx.strokeStyle =
        isSelected || isHighlightedViaLink
          ? node.color
          : "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `600 ${fontSize}px "Space Grotesk", "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle =
        hasSelection && !isSelected && !isConnected
          ? `rgba(255,255,255,${DIMMED_OPACITY})`
          : "rgba(255,255,255,0.92)";
      ctx.fillText(node.name, x, y + r + 3 / globalScale);

      ctx.restore();
    },
    [selectedNodeId, connectedNodeIds, highlightedLinkKey, hasSelection, graphData.links],
  );

  /* ── Link color ─────────────────────────────────────────────────────────── */
  const getLinkColor = useCallback(
    (link: GraphLink) => {
      const key = linkKey(link);

      if (highlightedLinkKey === key) return HIGHLIGHT_COLOR;

      if (hasSelection) {
        return connectedLinkKeys.has(key)
          ? "rgba(153,194,255,0.7)"
          : `rgba(80,80,100,${DIMMED_OPACITY})`;
      }

      return "rgba(153,194,255,0.35)";
    },
    [highlightedLinkKey, hasSelection, connectedLinkKeys],
  );

  /* ── Link width ─────────────────────────────────────────────────────────── */
  const getLinkWidth = useCallback(
    (link: GraphLink) => {
      const key = linkKey(link);
      if (highlightedLinkKey === key) return 2.5;
      if (hasSelection && connectedLinkKeys.has(key)) return 1.2;
      return 0.6;
    },
    [highlightedLinkKey, hasSelection, connectedLinkKeys],
  );

  /* ── Link label (interaction text at midpoint) ──────────────────────────── */
  const drawLinkLabel = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const source = link.source as GraphNode;
      const target = link.target as GraphNode;
      if (source.x == null || source.y == null || target.x == null || target.y == null) return;

      const key = linkKey(link);
      const isHighlighted = highlightedLinkKey === key;
      const isConnected = connectedLinkKeys.has(key);

      // Only show labels when relevant
      if (hasSelection && !isConnected && !isHighlighted) return;

      // If too many links visible without selection, reduce clutter
      if (!hasSelection && globalScale < 0.9) return;

      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const fontSize = Math.min(9 / globalScale, 4);

      ctx.save();
      ctx.font = `500 ${fontSize}px "Space Grotesk", "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Background pill
      const text = link.interaction;
      const textW = ctx.measureText(text).width;
      const pad = 2.5 / globalScale;

      ctx.fillStyle = isHighlighted
        ? "rgba(255,255,255,0.85)"
        : "rgba(20,20,40,0.8)";

      const rx = midX - textW / 2 - pad;
      const ry = midY - fontSize / 2 - pad;
      const rw = textW + pad * 2;
      const rh = fontSize + pad * 2;
      const corner = 2 / globalScale;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, corner);
      ctx.fill();

      // Text
      ctx.fillStyle = isHighlighted ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";
      ctx.fillText(text, midX, midY);

      ctx.restore();
    },
    [highlightedLinkKey, hasSelection, connectedLinkKeys],
  );

  /* ── Arrow color (matches link color) ──────────────────────────────────── */
  const getArrowColor = useCallback(
    (link: GraphLink) => getLinkColor(link),
    [getLinkColor],
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="rgba(10,10,20,1)"
      /* ── Node ID accessor ── */
      nodeId="id"
      /* ── Nodes ── */
      nodeCanvasObject={drawNode as (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => void}
      nodeCanvasObjectMode={() => "replace"}
      onNodeClick={onNodeClick as (node: object) => void}
      /* ── Links — Directional Arrows (base example) ── */
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      linkDirectionalArrowColor={getArrowColor as (link: object) => string}
      linkColor={getLinkColor as (link: object) => string}
      linkWidth={getLinkWidth as (link: object) => number}
      linkCurvature={getLinkCurvature as (link: object) => number}
      linkCanvasObjectMode={() => "after"}
      linkCanvasObject={drawLinkLabel as (link: object, ctx: CanvasRenderingContext2D, globalScale: number) => void}
      onLinkClick={onLinkClick as (link: object) => void}
      /* ── Background ── */
      onBackgroundClick={onBackgroundClick}
      /* ── Physics ── */
      cooldownTicks={100}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
    />
  );
};

ForceGraphCanvas.displayName = "ForceGraphCanvas";

export { ForceGraphCanvas };
