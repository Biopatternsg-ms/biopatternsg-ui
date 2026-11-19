# PathwayDetailModal (Molecule)

The **PathwayDetailModal** component is an inspection dialog molecule presenting deep biological information regarding a signaling or metabolic pathway (`GroupedPathway`), breaking down participant genes and PubMed references.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/PathwayDetailModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PathwayDetailModal.tsx)

## Dependencies

- `lucide-react`: `GitFork`, `ExternalLink`, `FileText`, `X` icons.
- `@/components/atoms/Button`: Close and explore buttons.
- `@/components/atoms/Badge`: Relevance and significance badges.
- `@/services/models/Pathway`: `GroupedPathway` type.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `isOpen` | `boolean` | Yes | - | Modal open state. |
| `onClose` | `() => void` | Yes | - | Modal close callback. |
| `pathway` | `GroupedPathway \| null` | Yes | - | Pathway data object. |
| `onExploreGraph` | `(pathwayId: string) => void` | No | `undefined` | Action exploring this pathway's subgraph. |

## Usage Example

```tsx
import { PathwayDetailModal } from "@/components/molecules/PathwayDetailModal";

export function PathwaysList({ activePathway, close }) {
  return (
    <PathwayDetailModal
      isOpen={Boolean(activePathway)}
      onClose={close}
      pathway={activePathway}
      onExploreGraph={(id) => console.log("Explore pathway:", id)}
    />
  );
}
```
