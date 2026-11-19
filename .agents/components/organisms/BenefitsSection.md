# BenefitsSection (Organism)

The **BenefitsSection** is a structural organism for the public landing page, assembling a responsive grid of `BenefitCard` molecules highlighting key clinical and technical capabilities.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/BenefitsSection.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/BenefitsSection.tsx)

## Dependencies

- `lucide-react`: Thematic icons (`ShieldCheck`, `Cpu`, `Database`, `Activity`).
- `@/components/molecules/BenefitCard`: Molecule representing each key differentiator.

## Usage Example

```tsx
import { BenefitsSection } from "@/components/organisms/BenefitsSection";

export function LandingPage() {
  return (
    <main>
      <BenefitsSection />
    </main>
  );
}
```
