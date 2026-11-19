# NodeSearchSelect (Molecule)

The **NodeSearchSelect** component is a molecule featuring a real-time search input and autocomplete dropdown to locate and select specific nodes within dense biological networks.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/NodeSearchSelect.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeSearchSelect.tsx)
- **Domain Modeling:** Consumes `GraphNodeInput` from `@/domain/models/Graph`.

## Dependencies

- `lucide-react`: `Search`, `X` icons.
- `@/domain/models/Graph`: `GraphNodeInput`, `colorForType`, `buildTypeColorMap`.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `nodes` | `GraphNodeInput[]` | Yes | - | Candidate nodes array available in the graph. |
| `value` | `string \| null` | No | `null` | Currently selected node name. |
| `onChange` | `(nodeName: string \| null) => void` | Yes | - | Selection change callback. |
| `placeholder` | `string` | No | `"Search node by name..."` | Search field placeholder. |
| `typeColorMap` | `Record<string, string>` | No | `undefined` | Optional external color map for types. |

## Styling & Design System Compliance

- **Design System Tokens**: Input surfaces and dropdown container utilize *The Clinical Lens* surface hierarchy (`bg-surface-card`, `bg-surface-container-high`, `text-on-surface`).
- **Zero Static Inline Styles**: All layout, positioning, dropdown shadows, and typography use Tailwind CSS utility classes. The `style` attribute is strictly delimited to the runtime dynamic node swatch indicator dot (`backgroundColor: colorForType(...)`).

## Usage Example

```tsx
import { NodeSearchSelect } from "@/components/molecules/NodeSearchSelect";
import type { GraphNodeInput } from "@/domain/models/Graph";

export function GraphToolbar({
  nodes,
  selectedNode,
  onSelect,
}: {
  nodes: GraphNodeInput[];
  selectedNode: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <div className="w-72">
      <NodeSearchSelect
        nodes={nodes}
        value={selectedNode}
        onChange={onSelect}
      />
    </div>
  );
}
```
