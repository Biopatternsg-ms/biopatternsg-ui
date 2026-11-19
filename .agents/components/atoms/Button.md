# Button (Atom)

The **Button** component is the core interactive atom of *The Clinical Lens* design system. It features semantic color variants, sizing scales, loading state spinners, and leading/trailing icon support.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Button.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Button.tsx)
- **Accessibility:** Accessible keyboard focus rings, `aria-busy` during loading, and native `disabled` propagation.

## Dependencies

- `class-variance-authority`: Modular variant definitions with `cva`.
- `lucide-react`: Icon rendering via `LucideIcon`.
- `@/components/atoms/LoadingSpinner`: Integrated spinner for asynchronous operations.
- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>` and `VariantProps<typeof buttonVariants>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "link" \| "danger" \| "success"` | No | `"primary"` | Visual hierarchy and semantic styling. |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | No | `"md"` | Button dimensions and padding. |
| `isLoading` | `boolean` | No | `false` | Displays a loading spinner and disables user interaction. |
| `icon` | `LucideIcon` | No | `undefined` | Lucide icon rendered alongside the button text. |
| `iconPosition` | `"left" \| "right"` | No | `"left"` | Icon placement relative to button children. |
| `children` | `React.ReactNode` | No | `undefined` | Button inner content. |

## Usage Example

```tsx
import { Button } from "@/components/atoms/Button";
import { Play, Download } from "lucide-react";

export function ActionToolbar() {
  return (
    <div className="flex gap-3">
      <Button variant="primary" icon={Play}>
        Run Pipeline
      </Button>

      <Button variant="outline" icon={Download} iconPosition="right">
        Export
      </Button>

      <Button variant="secondary" isLoading>
        Processing...
      </Button>
    </div>
  );
}
```
