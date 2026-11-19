# RolePillBadge (Atom)

The **RolePillBadge** component is a specialized atom for displaying biological roles (e.g., PROTEIN, GENE, PATHWAY, CHEMICAL, DISEASE) with semantic color coding and optional removal buttons.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/RolePillBadge.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/RolePillBadge.tsx)
- **Style Mapping:** Standardized colors sourced from `@/config/biologicalCategories`.

## Dependencies

- `lucide-react`: `X` icon for removal button.
- `@/config/biologicalCategories`: Category styles and color tokens.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `role` | `string` | Yes | - | Biological role name (e.g. "PROTEIN", "GENE"). |
| `onRemove` | `() => void` | No | `undefined` | Removal click callback. |
| `isSelected` | `boolean` | No | `false` | Enables highlighted selection outline. |
| `onClick` | `() => void` | No | `undefined` | Pill click handler. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { RolePillBadge } from "@/components/atoms/RolePillBadge";

export function RoleList() {
  return (
    <div className="flex gap-2">
      <RolePillBadge role="PROTEIN" isSelected />
      <RolePillBadge role="GENE" onRemove={() => console.log("Removed")} />
      <RolePillBadge role="DISEASE" />
    </div>
  );
}
```
