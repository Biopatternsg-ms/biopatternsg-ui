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
- `@/config/biologicalCategories`: `getRoleColor`, `formatRoleName` for standardized role palettes.

## Styling & Design System Compliance

- **Biological Color Token Centralization**: Uses `getRoleColor` and `formatRoleName` imported from `src/config/biologicalCategories.ts`, eliminating all local duplicated color arrays.
- **Zero Static Inline Styles**: All layout, borders, dialog containers, and typography use Tailwind CSS utility classes. The `style` attribute is strictly delimited to runtime dynamic data role colors (`backgroundColor: roleColor`, `color: roleColor`).

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
