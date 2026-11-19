# PathwayDetailModal (Molecule)

The **PathwayDetailModal** component is an inspection dialog molecule presenting deep biological information regarding a signaling or metabolic pathway (`GroupedPathway`), breaking down participant genes and PubMed references.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/PathwayDetailModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PathwayDetailModal.tsx)
- **Domain Modeling:** Consumes pure domain model `GroupedPathway` from `@/domain/models/Pathway`.

## Dependencies

- `lucide-react`: `X`, `Route`, `ArrowRight`, `GitBranch`, `Activity`, `Hash`, `BookOpen`, `ExternalLink`, `Star` icons.
- `@/components/atoms/Button`: Action and close buttons.
- `@/components/atoms/Badge`: Categorical and biological badges.
- `@/domain/models/Pathway`: `GroupedPathway` pure domain entity.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `pathway` | `GroupedPathway \| null` | Yes | - | Pathway data object. |
| `onClose` | `() => void` | Yes | - | Modal close callback. |
| `onToggleFavorite` | `(groupId: string) => void` | No | `undefined` | Action toggling favorite status. |

## Usage Example

```tsx
import { PathwayDetailModal } from "@/components/molecules/PathwayDetailModal";
import type { GroupedPathway } from "@/domain/models/Pathway";

export function PathwaysList({
  activePathway,
  close,
}: {
  activePathway: GroupedPathway | null;
  close: () => void;
}) {
  return (
    <PathwayDetailModal
      pathway={activePathway}
      onClose={close}
    />
  );
}
```
