# LoadingSpinner (Atom)

The **LoadingSpinner** component is an animated feedback atom used to communicate ongoing asynchronous processes such as data loading, pipeline execution, or API queries.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/LoadingSpinner.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/LoadingSpinner.tsx)
- **Animation:** Continuous SVG CSS spin animation (`animate-spin`).

## Dependencies

- `class-variance-authority`: Sizing and color variants with `cva`.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

Extends `React.HTMLAttributes<HTMLDivElement>` and `VariantProps<typeof spinnerVariants>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | No | `"md"` | Spinner diameter (`sm`: 16px, `md`: 24px, `lg`: 32px, `xl`: 48px). |
| `color` | `"primary" \| "secondary" \| "white" \| "neutral"` | No | `"primary"` | Color of the spinning stroke. |
| `text` | `string` | No | `undefined` | Optional loading message displayed next to or below the spinner. |

## Usage Example

```tsx
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

export function LoadingCard() {
  return (
    <div className="p-8 flex justify-center items-center">
      <LoadingSpinner size="lg" text="Computing inferences..." />
    </div>
  );
}
```
