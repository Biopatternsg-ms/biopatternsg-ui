# Sidebar (Organism)

The **Sidebar** component is a collapsible lateral navigation organism for the researcher dashboard. It groups links to key sections (Dashboard, Experiments, Ontologies, Graphs, Settings) with icons.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/Sidebar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Sidebar.tsx)

## Dependencies

- `lucide-react`: Section icons (`LayoutDashboard`, `Network`, `FlaskConical`, `Database`, `Settings`, `ChevronLeft`).
- `react-router-dom`: `Link` component and `useLocation` hook.
- `@/lib/utils`: `cn` utility.

## Styling & Design System Compliance

- **Surface Tokens**: Nav container uses semantic token `bg-surface-sidebar` (resolved to `#eef3ff` in `tailwind.config.ts`), eliminating hardcoded hex background values.
- **Zero Inline Styles**: 100% of positioning, transitions, widths, and collapsible states use Tailwind CSS utility classes and `cn()`.

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
