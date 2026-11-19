# GraphDataUploadModal (Molecule)

The **GraphDataUploadModal** component is a molecule that facilitates uploading structured biological files (`.txt` edge lists or adjacency matrices) with drag-and-drop support, format validation, and loading indicators.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/GraphDataUploadModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/GraphDataUploadModal.tsx)

## Dependencies

- `lucide-react`: `UploadCloud`, `FileText`, `X`, `AlertCircle` icons.
- `@/components/atoms/Button`: Action buttons.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `isOpen` | `boolean` | Yes | - | Controls modal open state. |
| `onClose` | `() => void` | Yes | - | Modal close callback. |
| `onUpload` | `(content: string, fileName: string) => void` | Yes | - | Callback receiving parsed file content and filename. |
| `isLoading` | `boolean` | No | `false` | Displays upload processing spinner. |

## Usage Example

```tsx
import { GraphDataUploadModal } from "@/components/molecules/GraphDataUploadModal";
import { useState } from "react";

export function KnowledgeBaseUploader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GraphDataUploadModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onUpload={(content, name) => {
        console.log("Uploaded file:", name, content.length);
        setIsOpen(false);
      }}
    />
  );
}
```
