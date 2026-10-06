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

import { useCallback, useRef, useEffect, type MutableRefObject } from "react";
import ForceGraph3D, { type ForceGraphMethods } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import type { Object3D } from "three";
import type {
  GraphNode,
  GraphLink,
  ForceGraphData,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import {
  getNodeId,
  linkKey,
  DIMMED_OPACITY,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import type { GraphVisualProfile } from "@/components/organisms/forceGraph/forceGraphProfiles";

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
  /** Visual profile (background, node size, spacing, link colors/widths). */
  profile: GraphVisualProfile;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS & TYPES
   ───────────────────────────────────────────────────────────────────────────── */

interface D3LinkForce {
  distance?: (distance: number) => void;
}

interface D3ChargeForce {
  strength?: (strength: number) => void;
}

/**
 * Apply alpha transparency to hex or rgb/rgba color strings.
 */
function applyAlpha(colorStr: string, alpha: number): string {
  if (colorStr.startsWith("#")) {
    const raw = colorStr.replace("#", "");
    const full =
      raw.length === 3
        ? raw
          .split("")
          .map((c) => c + c)
          .join("")
        : raw;
    const num = parseInt(full, 16);
    if (!isNaN(num)) {
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (colorStr.startsWith("rgb")) {
    return colorStr.replace(/rgba?\(([^)]+)\)/, (_, vals) => {
      const parts = vals.split(",").slice(0, 3).map((s: string) => s.trim());
      return `rgba(${parts.join(", ")}, ${alpha})`;
    });
  }
  return colorStr;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * ForceGraphCanvas — Atom
 *
 * Presentational wrapper around `<ForceGraph3D>` with:
 * - 360-degree orbital rotation and zoom controls (OrbitControls)
 * - Directional arrows on every link (matching the directional-links-arrows example)
 * - 3D spheres colored by biological type with SpriteText labels
 * - Link labels showing the `interaction` description on hover
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
  profile,
}) => {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const hasSelection = selectedNodeId != null;
  const { linkDistance, chargeStrength } = profile.spacing;

  // Initialize forces and zoom to fit after the physics settle
  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      // Configure link distance (from profile)
      const linkForce = fg.d3Force("link") as unknown as D3LinkForce | undefined;
      linkForce?.distance?.(linkDistance);

      // Repulsion force to complement link distance (from profile)
      const chargeForce = fg.d3Force("charge") as unknown as D3ChargeForce | undefined;
      chargeForce?.strength?.(chargeStrength);

      fg.d3ReheatSimulation?.();
    }

    const timer = setTimeout(() => {
      fgRef.current?.zoomToFit(400, 60);
    }, 600);
    return () => clearTimeout(timer);
  }, [linkDistance, chargeStrength]);

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
      const spread = 0.25;
      const center = (siblings.length - 1) / 2;
      return (idx - center) * spread;
    },
    [graphData.links],
  );

  /* ── Node Color ─────────────────────────────────────────────────────────── */
  const getNodeColor = useCallback(
    (node: GraphNode) => {
      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      const isHighlightedViaLink =
        highlightedLinkKey != null &&
        graphData.links.some(
          (l) =>
            linkKey(l) === highlightedLinkKey &&
            (getNodeId(l.source) === node.id || getNodeId(l.target) === node.id),
        );

      if (isSelected || isHighlightedViaLink) {
        return profile.node.highlightColor;
      }

      if (hasSelection && !isSelected && !isConnected) {
        return applyAlpha(node.color, DIMMED_OPACITY);
      }

      return node.color;
    },
    [selectedNodeId, connectedNodeIds, highlightedLinkKey, hasSelection, graphData.links, profile],
  );

  /* ── Node 3D Object (Sphere + Text Sprite) ──────────────────────────────── */
  const getNodeThreeObject = useCallback(
    (node: GraphNode) => {
      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      const isHighlightedViaLink =
        highlightedLinkKey != null &&
        graphData.links.some(
          (l) =>
            linkKey(l) === highlightedLinkKey &&
            (getNodeId(l.source) === node.id || getNodeId(l.target) === node.id),
        );

      const sprite = new SpriteText(node.name || node.id);
      sprite.color =
        hasSelection && !isSelected && !isConnected && !isHighlightedViaLink
          ? profile.node.labelDimmedColor
          : profile.node.labelColor;
      sprite.textHeight = profile.node.labelTextHeight;
      sprite.fontFace = '"Space Grotesk", "Inter", sans-serif';
      sprite.fontWeight = "600";
      // Position sprite below node center (offset defined by profile)
      sprite.position.set(0, profile.node.labelOffsetY, 0);
      if (sprite.material) {
        sprite.material.depthWrite = false;
      }
      return sprite;
    },
    [selectedNodeId, connectedNodeIds, highlightedLinkKey, hasSelection, graphData.links, profile],
  );

  /* ── Link color ─────────────────────────────────────────────────────────── */
  const getLinkColor = useCallback(
    (link: GraphLink) => {
      const key = linkKey(link);

      if (highlightedLinkKey === key) return profile.linkColor.highlighted;

      if (hasSelection) {
        return connectedLinkKeys.has(key)
          ? profile.linkColor.connected
          : profile.linkColor.dimmed;
      }

      return profile.linkColor.default;
    },
    [highlightedLinkKey, hasSelection, connectedLinkKeys, profile],
  );

  /* ── Link width ─────────────────────────────────────────────────────────── */
  const getLinkWidth = useCallback(
    (link: GraphLink) => {
      const key = linkKey(link);
      if (highlightedLinkKey === key) return profile.linkWidth.highlighted;
      if (hasSelection && connectedLinkKeys.has(key)) return profile.linkWidth.connected;
      return profile.linkWidth.default;
    },
    [highlightedLinkKey, hasSelection, connectedLinkKeys, profile],
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <ForceGraph3D
      ref={fgRef as unknown as MutableRefObject<ForceGraphMethods | undefined>}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor={profile.backgroundColor}
      showNavInfo={false}
      linkOpacity={0.5}
      /* ── Node ID & Labels ── */
      nodeId="id"
      nodeLabel={(node: object) => {
        const n = node as GraphNode;
        return `${n.name || n.id}${n.type ? ` (${n.type})` : ""}`;
      }}
      /* ── Nodes ── */
      nodeRelSize={profile.node.relSize}
      nodeColor={getNodeColor as (node: object) => string}
      nodeThreeObjectExtend={true}
      nodeThreeObject={getNodeThreeObject as (node: object) => Object3D}
      onNodeClick={(node) => onNodeClick(node as GraphNode)}
      /* ── Links — Directional Arrows ── */
      linkDirectionalArrowLength={profile.linkWidth.arrowLength}
      linkDirectionalArrowRelPos={1}
      linkDirectionalArrowColor={getLinkColor as (link: object) => string}
      linkColor={getLinkColor as (link: object) => string}
      linkWidth={getLinkWidth as (link: object) => number}
      linkCurvature={getLinkCurvature as (link: object) => number}
      linkLabel={(link: object) => (link as GraphLink).interaction || ""}
      onLinkClick={(link) => onLinkClick(link as GraphLink)}
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
