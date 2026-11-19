# TopBar (Organism)

The **TopBar** component is a top navigation header organism complementing the `DashboardLayout`. It embeds `Breadcrumb` navigation, mobile sidebar toggles, and the `UserMenu` for profile management.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/TopBar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/TopBar.tsx)

## Dependencies

- `lucide-react`: `Menu` icon for mobile viewports.
- `@/components/atoms/Breadcrumb`: Hierarchical navigation breadcrumb.
- `@/components/molecules/UserMenu`: User session dropdown menu.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `onToggleSidebar` | `() => void` | No | `undefined` | Callback invoked when clicking the mobile hamburger toggle. |

## Usage Example

```tsx
import { TopBar } from "@/components/organisms/TopBar";

export function CustomHeader({ toggleNav }) {
  return <TopBar onToggleSidebar={toggleNav} />;
}
```
