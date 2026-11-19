# HeroSection (Organism)

The **HeroSection** is the primary welcome organism on the landing page. It introduces the clinical value proposition (*"The Clinical Lens for Biological Networks"*) and embeds the authentication form via `DataForm`.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/HeroSection.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/HeroSection.tsx)

## Dependencies

- `zod`: Validation schema `loginSchema`.
- `@/components/organisms/DataForm`: Dynamic form organism.
- `@/adapters/authAdapter`: Adapter transforming credentials to login payloads.
- `lucide-react`: Security and clinical icons.

## Usage Example

```tsx
import { HeroSection } from "@/components/organisms/HeroSection";

export function HomePage() {
  return (
    <section>
      <HeroSection />
    </section>
  );
}
```
