# ForceGraphViewer (Organism)

The **ForceGraphViewer** is an advanced organism orchestrating full-scale biological network visualization. It integrates the `ForceGraphCanvas` atom, background profile selectors (`black`, `white`, `skyblue`), zoom and reset controls, real-time node search (`NodeSearchSelect`), node attribute inspection (`NodeDetailPanel`), and data upload dialogs (`GraphDataUploadModal`).

## Overview

- **Level:** Organism
- **Source Code:**
  - Component: [`src/components/organisms/forceGraph/ForceGraphViewer.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/forceGraph/ForceGraphViewer.tsx)
  - Domain Types: [`src/domain/models/Graph.ts`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/domain/models/Graph.ts)
  - Contrast Profiles: [`src/config/forceGraphProfiles.ts`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/config/forceGraphProfiles.ts)

## Dependencies

- `@/components/atoms/ForceGraphCanvas`: Canvas rendering engine.
- `@/components/molecules/NodeDetailPanel`: Node inspection side panel.
- `@/domain/models/Graph`: Pure domain models (`GraphNode`, `GraphLink`, `ForceGraphData`).
- `@/config/forceGraphProfiles`: Clinical contrast profiles (`GraphVisualProfile`, `GRAPH_PROFILES`).

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `data` | `ForceGraphData \| { nodes: GraphNodeInput[]; links: GraphLinkInput[] }` | Yes | - | Nodes and links graph data set. |
| `height` | `number \| string` | No | `"100%"` | Container height. |
| `onNodeSelect` | `(node: GraphNode \| null) => void` | No | `undefined` | Callback invoked upon node selection or deselection. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Visual Profiles (`forceGraphProfiles.ts`)

Supports three clinical background profiles:
1. `black`: High-contrast dark background for fluorescent biological entity highlighting.
2. `white`: Crisp light background for exportable figures in scientific publications.
3. `skyblue`: Subtle blue hue calibrated to minimize eye strain during long analysis sessions.

## Usage Example

```tsx
import { ForceGraphViewer } from "@/components/organisms/forceGraph/ForceGraphViewer";

const mockData = {
  nodes: [
    { id: "TP53", label: "TP53", type: "GENE" },
    { id: "MDM2", label: "MDM2", type: "PROTEIN" }
  ],
  links: [
    { source: "TP53", target: "MDM2", label: "regulates" }
  ]
};

export function BiologicalNetworkPage() {
  return (
    <div className="h-[800px] w-full">
      <ForceGraphViewer
        data={mockData}
        onNodeSelect={(node) => console.log("Active node:", node?.label)}
      />
    </div>
  );
}
```
