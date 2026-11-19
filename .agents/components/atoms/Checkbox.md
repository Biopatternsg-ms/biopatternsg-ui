# Checkbox (Atom)

The **Checkbox** component is an accessible atomic control for binary or multiple selection across clinical configuration forms and data table filtering.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Checkbox.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Checkbox.tsx)
- **Form Integration:** Fully compatible with React Hook Form using `React.forwardRef`.

## Dependencies

- `lucide-react`: `Check` icon for the checked state.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

Extends `Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `label` | `string` | No | `undefined` | Descriptive label text displayed next to the checkbox. |
| `error` | `string` | No | `undefined` | Validation error message displayed below the input. |
| `checked` | `boolean` | No | `undefined` | Controlled checked state. |
| `disabled` | `boolean` | No | `false` | Disables interaction and reduces opacity. |

## Usage Example

```tsx
import { Checkbox } from "@/components/atoms/Checkbox";
import { useState } from "react";

export function FilterSection() {
  const [includeProteins, setIncludeProteins] = useState(true);

  return (
    <Checkbox
      label="Include protein nodes"
      checked={includeProteins}
      onChange={(e) => setIncludeProteins(e.target.checked)}
    />
  );
}
```
