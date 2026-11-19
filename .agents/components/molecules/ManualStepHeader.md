# ManualStepHeader (Molecule)

The **ManualStepHeader** is a guided step header molecule designed for multi-stage experiment wizards, displaying stage titles, descriptions, back navigation, and contextual action buttons.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/ManualStepHeader.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/ManualStepHeader.tsx)

## Dependencies

- `lucide-react`: `ArrowLeft` icon and `LucideIcon` support.
- `@/components/atoms/Button`: Back button atom.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `title` | `string` | Yes | - | Primary step title. |
| `subtitle` | `string` | No | `undefined` | Secondary description or instructions. |
| `icon` | `LucideIcon` | No | `undefined` | Thematic step icon. |
| `onBack` | `() => void` | No | `undefined` | Back button click handler. |
| `backLabel` | `string` | No | `"Back"` | Back button label text. |
| `actions` | `React.ReactNode` | No | `undefined` | Trailing action controls. |

## Usage Example

```tsx
import { ManualStepHeader } from "@/components/molecules/ManualStepHeader";
import { Button } from "@/components/atoms/Button";
import { GitBranch, Save } from "lucide-react";

export function StepView() {
  return (
    <ManualStepHeader
      title="Step 2: Ontology Selection"
      subtitle="Select biomedical ontologies to cross-reference with the dataset."
      icon={GitBranch}
      onBack={() => console.log("Back")}
      actions={<Button icon={Save}>Save Progress</Button>}
    />
  );
}
```
