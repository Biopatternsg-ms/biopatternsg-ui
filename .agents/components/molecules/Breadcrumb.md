# Breadcrumb (Molecule)

The **Breadcrumb** component is a hierarchical navigation molecule that indicates the current location within the BioPatternSG application and enables navigation through previous steps and routes via decoupled callbacks.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/Breadcrumb.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/Breadcrumb.tsx)
- **Architecture:** Pure presentational molecule composing the `Button` atom and Lucide icons. Decoupled from `react-router-dom`.

## Dependencies

- `lucide-react`: `ChevronRight` and generic `LucideIcon` support.
- `@/components/atoms/Button`: Button atom for interactive navigation items.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

### `BreadcrumbItem` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Yes | Human-readable label text. |
| `href` | `string` | No | Destination route URL or step identifier. |
| `icon` | `LucideIcon` | No | Optional leading icon. |

### `BreadcrumbProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `items` | `BreadcrumbItem[]` | Yes | - | Ordered array of hierarchical path items. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |
| `onNavigate` | `(href: string) => void` | No | `undefined` | Callback invoked when a link item is clicked. |

## Usage Example

```tsx
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { Database, Network } from "lucide-react";

export function ExperimentHeader() {
  const navigate = useNavigate();

  return (
    <Breadcrumb
      onNavigate={navigate}
      items={[
        { label: "Experiments", href: "/dashboard/experiments", icon: Database },
        { label: "Inference Graph #42", icon: Network }
      ]}
    />
  );
}
```
