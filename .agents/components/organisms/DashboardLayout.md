# DashboardLayout (Organism)

The **DashboardLayout** is the master structural layout organism for authenticated views. It assembles the collapsible `Sidebar`, the top navigation `TopBar`, and the dynamic main content outlet (`<Outlet />`).

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/DashboardLayout.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DashboardLayout.tsx)
- **Responsive:** Adaptable for mobile devices with overlay side navigation and persistent desktop drawers.

## Dependencies

- `react-router-dom`: `<Outlet />` component rendering nested routes.
- `@/components/organisms/Sidebar`: Lateral navigation organism.
- `@/components/organisms/TopBar`: Top navigation header organism.

## Usage Example

```tsx
import { DashboardLayout } from "@/components/organisms/DashboardLayout";
import { Route, Routes } from "react-router-dom";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/graph" element={<GraphViewer />} />
      </Route>
    </Routes>
  );
}
```
