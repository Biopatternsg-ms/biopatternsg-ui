# TopBar (Organism)

The **TopBar** component is a top navigation header organism complementing the `DashboardLayout`. It embeds the page/breadcrumb title, sidebar toggles, and the presentational `UserMenu` molecule.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/TopBar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/TopBar.tsx)
- **Architecture:** Organism assembling layout navigation controls. Consumes `SidebarContext` and `AuthContext` to supply presentational props (`user`, `onLogout`) to `UserMenu`.

## Dependencies

- `lucide-react`: `Menu`, `Bell`, `HelpCircle` icons.
- `@/components/molecules/UserMenu`: Presentational user session dropdown menu.
- `@/context/SidebarContext`: Desktop/mobile sidebar state toggles.
- `@/context/AuthContext`: Authentication user and logout action.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `title` | `string` | No | `"Dashboard"` | The breadcrumb/page title shown on the navigation bar. |

## Usage Example

```tsx
import { TopBar } from "@/components/organisms/TopBar";

export function DashboardHeader() {
  return <TopBar title="Gene Networks" />;
}
```
