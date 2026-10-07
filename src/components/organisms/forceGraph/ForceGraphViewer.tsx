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

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ForceGraphCanvas } from "@/components/atoms/ForceGraphCanvas";
import { NodeDetailPanel } from "@/components/molecules/NodeDetailPanel";
import type {
  GraphNode,
  GraphLink,
  GraphNodeInput,
  GraphLinkInput,
  ForceGraphData,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import {
  getNodeId,
  linkKey,
  colorForType,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import {
  getGraphProfile,
  DEFAULT_GRAPH_BACKGROUND,
  type GraphBackground,
  type GraphVisualProfile,
} from "@/components/organisms/forceGraph/forceGraphProfiles";

/* ─────────────────────────────────────────────────────────────────────────────
   PROPS
   ───────────────────────────────────────────────────────────────────────────── */

export interface ForceGraphViewerProps {
  /** Node definitions — name + type. Duplicates are deduplicated by name. */
  nodes: GraphNodeInput[];
  /** Connection definitions — object1, interaction, object2. */
  links: GraphLinkInput[];
  /** Height of the canvas area in px. Default: 650. */
  height?: number;
  /**
   * Link distance for d3-force physics simulation.
   * When provided, overrides the value defined by the background profile (45).
   */
  linkDistance?: number;
  /**
   * Background color. Selects the visual profile (background, node size,
   * node spacing, link color and link width). Default: "black".
   */
  background?: GraphBackground;
  /** Name of the selected node (controlled mode). `null` = none. Omit for uncontrolled. */
  selectedNodeName?: string | null;
  /** Fired whenever selection changes from inside the graph (node click → name, background click / panel close → null). */
  onSelectedNodeChange?: (name: string | null) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * ForceGraphViewer — Organism
 *
 * Orchestrates the full interactive graph experience:
 *   1. Transforms consumer inputs (GraphNodeInput/GraphLinkInput)
 *      into internal types with colors assigned by biological type.
 *   2. Deduplicates nodes by `name`.
 *   3. Manages all interaction state (selected node, highlighted link).
 *   4. Computes connected node/link sets for visual feedback.
 *   5. Resolves the visual profile from the `background` prop.
 *   6. Renders ForceGraphCanvas + NodeDetailPanel.
 *
 * Usage (uncontrolled):
 * ```tsx
 * <ForceGraphViewer
 *   nodes={[{ name: "TP53", type: "Protein" }]}
 *   links={[{ object1: "TP53", interaction: "bind", object2: "MDM2" }]}
 *   background="white"
 * />
 * ```
 *
 * Usage (controlled selection):
 * ```tsx
 * const [selected, setSelected] = useState<string | null>(null);
 * <ForceGraphViewer
 *   nodes={nodes}
 *   links={links}
 *   selectedNodeName={selected}
 *   onSelectedNodeChange={setSelected}
 * />
 * ```
 */
const ForceGraphViewer: React.FC<ForceGraphViewerProps> = ({
  nodes: inputNodes,
  links: inputLinks,
  height = 650,
  linkDistance,
  background = DEFAULT_GRAPH_BACKGROUND,
  selectedNodeName,
  onSelectedNodeChange,
}) => {
  /* ── Visual profile (background → parameters) ───────────────────────────── */
  const profile: GraphVisualProfile = useMemo(() => {
    const base = getGraphProfile(background);
    return linkDistance == null
      ? base
      : { ...base, spacing: { ...base.spacing, linkDistance } };
  }, [background, linkDistance]);

  /* ── Transform & deduplicate input → internal data ─────────────────────── */
  const graphData: ForceGraphData = useMemo(() => {
    // Deduplicate nodes by name
    const nodeMap = new Map<string, GraphNode>();
    for (const n of inputNodes) {
      if (!nodeMap.has(n.name)) {
        nodeMap.set(n.name, {
          id: n.name,
          name: n.name,
          type: n.type,
          color: colorForType(n.type),
        });
      }
    }

    const nodes = Array.from(nodeMap.values());

    const links: GraphLink[] = inputLinks.map((l) => ({
      source: l.object1,
      target: l.object2,
      interaction: l.interaction,
    }));

    return { nodes, links };
  }, [inputNodes, inputLinks]);

  /* ── Interaction state ──────────────────────────────────────────────────── */
  const [internalSelectedName, setInternalSelectedName] = useState<string | null>(null);
  const isControlled = selectedNodeName !== undefined;
  const selectedName = isControlled ? selectedNodeName : internalSelectedName;

  const selectedNode = useMemo(() => {
    if (!selectedName) return null;
    return graphData.nodes.find((n) => n.id === selectedName) ?? null;
  }, [graphData.nodes, selectedName]);

  const [highlightedLink, setHighlightedLink] = useState<GraphLink | null>(null);

  const changeSelection = useCallback(
    (name: string | null) => {
      if (!isControlled) {
        setInternalSelectedName(name);
      }
      onSelectedNodeChange?.(name);
    },
    [isControlled, onSelectedNodeChange]
  );

  // Reset highlighted link whenever selectedName changes (adjusting state during render)
  const [prevSelectedName, setPrevSelectedName] = useState(selectedName);
  if (prevSelectedName !== selectedName) {
    setPrevSelectedName(selectedName);
    setHighlightedLink(null);
  }

  const highlightedLinkKey = highlightedLink ? linkKey(highlightedLink) : null;

  /* ── Connected sets ─────────────────────────────────────────────────────── */
  const { connectedNodeIds, connectedLinkKeys, nodeConnections } = useMemo(() => {
    if (!selectedNode) {
      return {
        connectedNodeIds: new Set<string>(),
        connectedLinkKeys: new Set<string>(),
        nodeConnections: [] as GraphLink[],
      };
    }

    const nodeIds = new Set<string>([selectedNode.id]);
    const lKeys = new Set<string>();
    const connections: GraphLink[] = [];

    for (const link of graphData.links) {
      const srcId = getNodeId(link.source);
      const tgtId = getNodeId(link.target);

      if (srcId === selectedNode.id || tgtId === selectedNode.id) {
        nodeIds.add(srcId);
        nodeIds.add(tgtId);
        lKeys.add(linkKey(link));
        connections.push(link);
      }
    }

    return {
      connectedNodeIds: nodeIds,
      connectedLinkKeys: lKeys,
      nodeConnections: connections,
    };
  }, [selectedNode, graphData.links]);

  /* ── Event handlers ─────────────────────────────────────────────────────── */
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      changeSelection(node.id);
      setHighlightedLink(null);
    },
    [changeSelection]
  );

  const handleLinkClick = useCallback((link: GraphLink) => {
    setHighlightedLink(link);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    changeSelection(null);
    setHighlightedLink(null);
  }, [changeSelection]);

  const handleConnectionClick = useCallback((link: GraphLink) => {
    setHighlightedLink(link);
  }, []);

  const handlePanelClose = useCallback(() => {
    changeSelection(null);
    setHighlightedLink(null);
  }, [changeSelection]);

  /* ── Responsive width ───────────────────────────────────────────────────── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shrink canvas when panel is open
  const canvasWidth = selectedNode
    ? Math.max(containerWidth * 0.7, 400)
    : containerWidth;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {containerWidth > 0 && (
        <ForceGraphCanvas
          graphData={graphData}
          selectedNodeId={selectedNode?.id ?? null}
          highlightedLinkKey={highlightedLinkKey}
          connectedNodeIds={connectedNodeIds}
          connectedLinkKeys={connectedLinkKeys}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onBackgroundClick={handleBackgroundClick}
          width={canvasWidth}
          height={height}
          profile={profile}
        />
      )}

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          connections={nodeConnections}
          allNodes={graphData.nodes}
          highlightedLinkKey={highlightedLinkKey}
          onConnectionClick={handleConnectionClick}
          onClose={handlePanelClose}
          isOpen={selectedNode != null}
        />
      )}
    </div>
  );
};

ForceGraphViewer.displayName = "ForceGraphViewer";

export { ForceGraphViewer };
