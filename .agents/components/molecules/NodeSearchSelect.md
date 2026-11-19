# NodeSearchSelect (Molecule)

The **NodeSearchSelect** component is a molecule featuring a real-time search input and autocomplete dropdown to locate and select specific nodes within dense biological networks.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/NodeSearchSelect.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeSearchSelect.tsx)

## Dependencies

- `lucide-react`: `Search`, `X`, `Check` icons.
- `@/components/atoms/Input`: Search input atom.
- Graph types from `forceGraphTypes.ts`.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `nodes` | `GraphNodeInput[]` | Yes | - | Candidate nodes array available in the graph. |
| `selectedNodeId` | `string \| null` | No | `null` | Currently selected node identifier. |
| `onSelectNode` | `(node: GraphNodeInput \| null) => void` | Yes | - | Selection change callback. |
| `placeholder` | `string` | No | `"Search node by ID or label..."` | Search field placeholder. |
| `colorMap` | `Record<string, string>` | No | `{}` | Color map for category pills. |

## Usage Example

```tsx
import { NodeSearchSelect } from "@/components/molecules/NodeSearchSelect";

export function GraphToolbar({ nodes, onSelect }) {
  return (
    <div className="w-72">
      <NodeSearchSelect
        nodes={nodes}
        onSelectNode={onSelect}
      />
    </div>
  );
}
```
