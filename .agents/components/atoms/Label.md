# Label (Atom)

The **Label** component is an accessible form label atom designed for input controls (`Input`, `Select`, `Textarea`), featuring mandatory field indicators and error color states.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Label.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Label.tsx)
- **Accessibility:** Maps to form inputs via the `htmlFor` attribute.

## Dependencies

- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

Extends `React.LabelHTMLAttributes<HTMLLabelElement>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `required` | `boolean` | No | `false` | Displays a red asterisk (`*`) indicating a mandatory field. |
| `error` | `boolean` | No | `false` | Applies error text color styling. |
| `children` | `React.ReactNode` | Yes | - | Label text or inline elements. |

## Usage Example

```tsx
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

export function FormFieldExample() {
  return (
    <div className="space-y-1">
      <Label htmlFor="experiment-name" required>
        Experiment Name
      </Label>
      <Input id="experiment-name" placeholder="e.g. Exp-2026-Bio" />
    </div>
  );
}
```
