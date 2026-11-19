# SuccessModal (Molecule)

The **SuccessModal** component is a confirmation dialog molecule used to notify researchers that a clinical or computational task has completed successfully.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/SuccessModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/SuccessModal.tsx)

## Dependencies

- `lucide-react`: `CheckCircle`, `X` icons.
- `@/components/atoms/Button`: Action button atom.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `isOpen` | `boolean` | Yes | - | Controls dialog open state. |
| `title` | `string` | No | `"Operation successful"` | Dialog title. |
| `message` | `string` | Yes | - | Explanatory message regarding the outcome. |
| `onClose` | `() => void` | Yes | - | Close callback handler. |
| `primaryActionLabel` | `string` | No | `"Accept"` | Confirmation button label. |
| `onPrimaryAction` | `() => void` | No | `undefined` | Optional primary action callback. |

## Usage Example

```tsx
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { useState } from "react";

export function SaveExperimentSection() {
  const [success, setSuccess] = useState(false);

  return (
    <SuccessModal
      isOpen={success}
      title="Experiment Saved"
      message="The knowledge graph and associated inferences were persisted successfully."
      onClose={() => setSuccess(false)}
    />
  );
}
```
