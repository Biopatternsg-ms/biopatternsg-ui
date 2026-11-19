# Breadcrumb (Atom)

The **Breadcrumb** component is a hierarchical navigation atom that indicates the current location within the BioPatternSG application and enables backward navigation through previous routes.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Breadcrumb.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Breadcrumb.tsx)
- **SPA Integration:** Built-in React Router navigation via `useNavigate`.

## Dependencies

- `lucide-react`: `ChevronRight`, `Home`, and generic `LucideIcon` support.
- `react-router-dom`: `useNavigate` hook.
- `@/components/atoms/Button`: Button atom for quick home access.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

### `BreadcrumbItem` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Yes | Human-readable label text. |
| `path` | `string` | No | Destination route URL. If omitted, rendered as a static terminal node. |
| `icon` | `LucideIcon` | No | Optional leading icon. |

### `BreadcrumbProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `items` | `BreadcrumbItem[]` | Yes | - | Ordered array of hierarchical path items. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |
| `showHomeButton` | `boolean` | No | `true` | Toggles the dedicated home button shortcut. |
| `onHomeClick` | `() => void` | No | `undefined` | Custom home button click handler. |

## Usage Example

```tsx
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Database, Network } from "lucide-react";

export function ExperimentHeader() {
  return (
    <Breadcrumb
      items={[
        { label: "Experiments", path: "/experiments", icon: Database },
        { label: "Inference Graph #42", icon: Network }
      ]}
    />
  );
}
```
