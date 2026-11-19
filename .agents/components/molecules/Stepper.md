# Stepper (Molecule)

The **Stepper** component is a multi-stage sequential progress molecule guiding users through structured workflows (wizards) with interactive step navigation.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/Stepper.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/Stepper.tsx)

## Dependencies

- `lucide-react`: `Check` icon for completed steps.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

### `Step` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Yes | Unique step identifier. |
| `title` | `string` | Yes | Visible step title. |
| `description` | `string` | No | Secondary description. |

### `StepperProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `steps` | `Step[]` | Yes | - | Ordered array of workflow steps. |
| `currentStep` | `number` | Yes | - | Active step index (0-based). |
| `onStepClick` | `(stepIndex: number) => void` | No | `undefined` | Step navigation callback. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { Stepper } from "@/components/molecules/Stepper";
import { useState } from "react";

const steps = [
  { id: "1", title: "Data Ingestion" },
  { id: "2", title: "Model Training & Inference" },
  { id: "3", title: "Results Visualization" }
];

export function WizardFlow() {
  const [current, setCurrent] = useState(1);

  return (
    <Stepper
      steps={steps}
      currentStep={current}
      onStepClick={(i) => setCurrent(i)}
    />
  );
}
```
