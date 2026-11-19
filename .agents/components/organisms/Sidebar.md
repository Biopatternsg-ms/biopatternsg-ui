# Sidebar (Organism)

The **Sidebar** component is a collapsible lateral navigation organism for the researcher dashboard. It groups links to key sections (Dashboard, Experiments, Ontologies, Graphs, Settings) with icons.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/Sidebar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Sidebar.tsx)

## Dependencies

- `lucide-react`: Section icons (`LayoutDashboard`, `Network`, `FlaskConical`, `Database`, `Settings`, `ChevronLeft`).
- `react-router-dom`: `Link` component and `useLocation` hook.
- `@/lib/utils`: `cn` utility.

## Usage Example

```tsx
import { Sidebar } from "@/components/organisms/Sidebar";

export function DashboardWrapper() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">Content Area</div>
    </div>
  );
}
```
