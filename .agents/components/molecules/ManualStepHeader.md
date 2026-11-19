# ManualStepHeader (Molecule)

The **ManualStepHeader** is a guided step header molecule designed for multi-stage experiment wizards, displaying stage titles, descriptions, back navigation, embedded breadcrumb trails, and contextual action buttons.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/ManualStepHeader.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/ManualStepHeader.tsx)
- **Architecture:** Decoupled from `react-router-dom`; delegates back and breadcrumb navigation via props (`onBack`, `onNavigate`).

## Dependencies

- `lucide-react`: `ArrowLeft` icon and `LucideIcon` support.
- `@/components/atoms/Button`: Back button atom.
- `@/components/atoms/Badge`: Step status badges.
- `@/components/molecules/Breadcrumb`: Embedded navigation breadcrumb molecule.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `stepTitle` | `string` | Yes | - | Primary step title. |
| `stepDescription` | `string` | Yes | - | Detailed description or guidance. |
| `icon` | `LucideIcon` | Yes | - | Thematic step icon. |
| `networkId` | `string` | No | `undefined` | Network ID for breadcrumb path resolution. |
| `experimentId` | `string` | No | `undefined` | Experiment ID for breadcrumb path resolution. |
| `experimentName` | `string` | No | `"Experiment"` | Human-readable experiment name. |
| `badgeLabel` | `string` | No | `"Manual Execution Step"` | Badge label text. |
| `badgeVariant` | `"inProgress" \| "pending" \| "completed" \| "primary"` | No | `"inProgress"` | Badge color variant. |
| `onBack` | `() => void` | No | `undefined` | Back button click handler. |
| `onNavigate` | `(href: string) => void` | No | `undefined` | Callback for step and breadcrumb navigation. |
| `actions` | `React.ReactNode` | No | `undefined` | Trailing action controls. |

## Usage Example

```tsx
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { useNavigate } from "react-router-dom";
import { GitBranch } from "lucide-react";

export function StepView() {
  const navigate = useNavigate();

  return (
    <ManualStepHeader
      stepTitle="Biological Pathway Graph"
      stepDescription="Interactive force-directed causal network."
      icon={GitBranch}
      onNavigate={navigate}
      onBack={() => navigate(-1)}
    />
  );
}
```
