# Input (Atom)

The **Input** component is an accessible text input atom styled with *The Clinical Lens* tokens, supporting error states, embedded icons, and focus rings.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Input.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Input.tsx)
- **Form Integration:** Implements `React.forwardRef` for React Hook Form integration.

## Dependencies

- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

Extends `React.InputHTMLAttributes<HTMLInputElement>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `error` | `boolean` | No | `false` | Enables error border and destructive focus rings. |
| `icon` | `React.ReactNode` | No | `undefined` | Leading or trailing decorative/action icon. |
| `iconPosition` | `"left" \| "right"` | No | `"left"` | Placement of the embedded icon. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { Input } from "@/components/atoms/Input";
import { Search } from "lucide-react";

export function SearchBox() {
  return (
    <Input
      placeholder="Search gene or protein..."
      icon={<Search className="w-4 h-4 text-muted-foreground" />}
      iconPosition="left"
    />
  );
}
```
