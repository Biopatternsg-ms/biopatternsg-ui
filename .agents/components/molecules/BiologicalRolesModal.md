# BiologicalRolesModal (Molecule)

The **BiologicalRolesModal** is an interactive presentational molecule allowing researchers to inspect, filter, and manage inferred biological roles across experiment entities.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/BiologicalRolesModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/BiologicalRolesModal.tsx)
- **Architecture:** Pure presentational molecule decoupled from concrete backend services and DTOs. Data orchestration handled by parent modules via the `useBiologicalRoles` custom hook.

## Dependencies

- `lucide-react`: `Search`, `X`, `Dna`, `AlertCircle` icons.
- `@/components/atoms/Badge`: Status and ontology restriction pills.
- `@/components/atoms/LoadingSpinner`: Loading state indicators.
- `@/components/atoms/Button`: Action and retry buttons.
- `@/config/biologicalCategories`: Category styles and color tokens.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `open` | `boolean` | Yes | - | Controls modal visibility. |
| `onClose` | `() => void` | Yes | - | Modal dismissal handler. |
| `loading` | `boolean` | No | `false` | Indicates whether role data is currently loading. |
| `error` | `string \| null` | No | `null` | Error message string if data fetching failed. |
| `rolesMap` | `Record<string, string[]>` | No | `{}` | Map of biological entities to their active inferred roles. |
| `pipelineId` | `string` | No | `undefined` | Pipeline identifier for header display. |
| `experimentName` | `string` | No | `undefined` | Experiment name for header context. |
| `restrictionLevel` | `string` | No | `"VERY_RESTRICTED"` | Active ontology restriction level badge. |
| `onRetry` | `() => void` | No | `undefined` | Callback invoked when user clicks retry on error. |

## Usage Example

```tsx
import { BiologicalRolesModal } from "@/components/molecules/BiologicalRolesModal";
import { useBiologicalRoles } from "@/modules/dashboard/experiments/hooks/useBiologicalRoles";
import { useState } from "react";

export function ExperimentExecutionView({ pipelineId }: { pipelineId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { loading, error, inferenceDomain, fetchRoles } = useBiologicalRoles(modalOpen ? pipelineId : undefined);

  return (
    <BiologicalRolesModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      loading={loading}
      error={error}
      rolesMap={inferenceDomain?.roles || {}}
      pipelineId={pipelineId}
      onRetry={() => fetchRoles(pipelineId)}
    />
  );
}
```
