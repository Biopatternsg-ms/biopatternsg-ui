# NodeDetailPanel (Molecule)

The **NodeDetailPanel** is a collapsible side-panel molecule displaying comprehensive attributes for the selected biological node in the network view (ID, name, type, connections, and metadata).

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/NodeDetailPanel.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeDetailPanel.tsx)
- **Domain Modeling:** Consumes `GraphNode` and `GraphLink` from `@/domain/models/Graph`.

## Dependencies

- `lucide-react`: Icons for close, link, and node visualization.
- `@/domain/models/Graph`: `GraphNode`, `GraphLink`, `getNodeId`, `linkKey`, `DEFAULT_NODE_COLOR`.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `node` | `GraphNode` | Yes | - | Selected node whose attributes and connections are rendered. |
| `connections` | `GraphLink[]` | Yes | - | Links where this node participates. |
| `allNodes` | `GraphNode[]` | Yes | - | All nodes in the graph to resolve counterpart labels. |
| `highlightedLinkKey` | `string \| null` | No | `null` | Key of the currently highlighted link. |
| `onConnectionClick` | `(link: GraphLink) => void` | Yes | - | Callback when a connection item is clicked. |
| `onClose` | `() => void` | Yes | - | Panel close callback. |
| `isOpen` | `boolean` | No | `true` | Visibility state. |

## Usage Example

```tsx
import { NodeDetailPanel } from "@/components/molecules/NodeDetailPanel";
import type { GraphNode, GraphLink } from "@/domain/models/Graph";

export function GraphCanvasWrapper({
  selectedNode,
  connections,
  allNodes,
  onClose,
}: {
  selectedNode: GraphNode;
  connections: GraphLink[];
  allNodes: GraphNode[];
  onClose: () => void;
}) {
  return (
    <NodeDetailPanel
      node={selectedNode}
      connections={connections}
      allNodes={allNodes}
      highlightedLinkKey={null}
      onConnectionClick={(link) => console.log("Clicked link:", link)}
      onClose={onClose}
      isOpen={true}
    />
  );
}
```
