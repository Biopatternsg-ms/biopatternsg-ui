# ErrorModal (Molecule)

The **ErrorModal** component is an alert dialog molecule used to notify users of critical execution failures, network exceptions, or validation errors during bioinformatics workflows.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/ErrorModal.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/ErrorModal.tsx)

## Dependencies

- `lucide-react`: `AlertTriangle`, `X` icons.
- `@/components/atoms/Button`: Primary and secondary action buttons.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `isOpen` | `boolean` | Yes | - | Modal open state. |
| `title` | `string` | No | `"An error occurred"` | Dialog heading title. |
| `message` | `string` | Yes | - | Detailed error description. |
| `onClose` | `() => void` | Yes | - | Modal dismissal handler. |
| `retryAction` | `() => void` | No | `undefined` | Optional retry action callback. |
| `retryLabel` | `string` | No | `"Retry"` | Retry button label. |

## Usage Example

```tsx
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { useState } from "react";

export function NetworkSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorModal
      isOpen={Boolean(error)}
      message={error || ""}
      onClose={() => setError(null)}
      retryAction={() => window.location.reload()}
    />
  );
}
```
