# BiologicalRolesModal (Molecule)

The **BiologicalRolesModal** is an interactive molecule allowing researchers to inspect, filter, and manage inferred biological roles across experiment entities.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/BiologicalRolesModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/BiologicalRolesModal.tsx)
- **Composition:** Combines `RolePillBadge`, `Button`, `Input` search, and backdrop modal containers.

## Dependencies

- `lucide-react`: `Search`, `X`, `CheckCircle2`, `Filter` icons.
- `@/components/atoms/Button`: Action buttons (Confirm, Cancel).
- `@/components/atoms/Input`: Entity search input.
- `@/components/atoms/RolePillBadge`: Interactive biological role tags.
- `@/services/models/Experiment`: `InferenceResponse` type.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `isOpen` | `boolean` | Yes | - | Controls modal visibility. |
| `onClose` | `() => void` | Yes | - | Modal dismissal handler. |
| `inferenceData` | `InferenceResponse \| null` | No | `null` | Experiment inference response with entities and roles. |
| `onConfirm` | `(selectedRoles: Record<string, string[]>) => void` | No | `undefined` | Callback invoked with confirmed selected roles. |

## Usage Example

```tsx
import { BiologicalRolesModal } from "@/components/molecules/BiologicalRolesModal";
import { useState } from "react";

export function ExperimentManager() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BiologicalRolesModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onConfirm={(roles) => console.log("Confirmed roles:", roles)}
    />
  );
}
```
