# NodeDetailPanel (Molecule)

The **NodeDetailPanel** is a collapsible side-panel molecule displaying comprehensive attributes for the selected biological node in the network view (ID, label, type, connectivity degree, and metadata).

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/NodeDetailPanel.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeDetailPanel.tsx)

## Dependencies

- `lucide-react`: `X`, `ExternalLink`, `Focus`, `Tag` icons.
- `@/components/atoms/Button`: Action buttons (Center, Close).
- `@/components/atoms/Badge`: Biological category badge.
- Graph types from `forceGraphTypes.ts`.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `node` | `GraphNode \| null` | Yes | - | Active node whose attributes are rendered. |
| `isOpen` | `boolean` | Yes | - | Panel visibility state. |
| `onClose` | `() => void` | Yes | - | Panel close callback. |
| `onFocusNode` | `(nodeId: string) => void` | No | `undefined` | Camera focus callback centering on this node. |
| `colorMap` | `Record<string, string>` | No | `{}` | Biological category color dictionary. |

## Usage Example

```tsx
import { NodeDetailPanel } from "@/components/molecules/NodeDetailPanel";

export function GraphCanvasWrapper({ selectedNode, clearSelection }) {
  return (
    <NodeDetailPanel
      node={selectedNode}
      isOpen={Boolean(selectedNode)}
      onClose={clearSelection}
      onFocusNode={(id) => console.log("Focus node:", id)}
    />
  );
}
```
