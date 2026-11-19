# Header (Organism)

The **Header** component is the top navigation bar organism for public views and the landing page, featuring the platform logo, `NavLink` items, and login access buttons.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/Header.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Header.tsx)

## Dependencies

- `@/components/atoms/NavLink`: Navigation links.
- `@/components/atoms/Button`: Call-to-action button to enter the dashboard.

## Usage Example

```tsx
import { Header } from "@/components/organisms/Header";

export function LandingPageHeader() {
  return <Header />;
}
```
