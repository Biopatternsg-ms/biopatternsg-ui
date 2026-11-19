# GraphDataUploadModal (Molecule)

The **GraphDataUploadModal** component is a molecule that facilitates uploading structured biological files (`.txt` nodes and links) with format validation, error banners, and loading indicators.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/GraphDataUploadModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/GraphDataUploadModal.tsx)
- **Domain Modeling:** Consumes `GraphNodeInput` and `GraphLinkInput` from `@/domain/models/Graph`.

## Dependencies

- `lucide-react`: `X` icon.
- `@/components/atoms/Button`: Action buttons.
- `@/components/molecules/FormField`: File input form fields.
- `@/domain/models/Graph`: `GraphNodeInput`, `GraphLinkInput`.
- `@/utils/graphDataParser`: Validation and parsing utilities.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `open` | `boolean` | Yes | - | Controls modal open state. |
| `onLoaded` | `(data: { nodes: GraphNodeInput[]; links: GraphLinkInput[] }) => void` | Yes | - | Callback receiving parsed and validated nodes and links. |
| `onCancel` | `() => void` | Yes | - | Modal cancellation callback. |

## Usage Example

```tsx
import { GraphDataUploadModal } from "@/components/molecules/GraphDataUploadModal";
import { useState } from "react";

export function NetworkUploadView() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GraphDataUploadModal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      onLoaded={({ nodes, links }) => {
        console.log("Loaded graph dataset:", nodes.length, links.length);
        setIsOpen(false);
      }}
    />
  );
}
```
