# Footer (Organism)

The **Footer** component is an institutional organism located at the bottom of public and documentation pages, organizing links into columns (Product, Resources, BioPatternSG, Legal) with Apache 2.0 copyright notices.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/Footer.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Footer.tsx)

## Dependencies

- `lucide-react`: Social and informational icons.
- `@/components/atoms/NavLink`: Styled navigation links.

## Usage Example

```tsx
import { Footer } from "@/components/organisms/Footer";

export function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```
