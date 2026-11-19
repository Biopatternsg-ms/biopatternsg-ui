# BenefitCard (Molecule)

The **BenefitCard** component is a molecule that presents a core capability or feature of BioPatternSG within informational landing sections.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/BenefitCard.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/BenefitCard.tsx)
- **Design:** Card container with smooth hover elevation and leading thematic icon container.

## Dependencies

- `lucide-react`: `LucideIcon` for the featured icon.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `title` | `string` | Yes | - | Feature title. |
| `description` | `string` | Yes | - | Explanatory description text. |
| `icon` | `LucideIcon` | Yes | - | Thematic icon component. |
| `highlight` | `boolean` | No | `false` | Applies a prominent accent outline. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { BenefitCard } from "@/components/molecules/BenefitCard";
import { Network } from "lucide-react";

export function Highlights() {
  return (
    <BenefitCard
      icon={Network}
      title="Knowledge Graphs"
      description="Construction and inference of complex biological relations backed by standard biomedical ontologies."
      highlight
    />
  );
}
```
