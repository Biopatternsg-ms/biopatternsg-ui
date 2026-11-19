# Badge (Atom)

The **Badge** component is an atomic UI element used to highlight statuses, numerical counts, clinical categories, or pipeline alerts in a compact pill shape. It leverages `class-variance-authority` (CVA) for standardized semantic variants and sizes.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Badge.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Badge.tsx)
- **Typography:** Uses `font-label font-bold uppercase` with tight letter spacing.

## Dependencies

- `class-variance-authority`: Modular variant management (`cva`, `VariantProps`).
- `@/lib/utils`: `cn` utility for Tailwind class composition.

## Component Properties (Props)

Extends `React.HTMLAttributes<HTMLDivElement>` and `VariantProps<typeof badgeVariants>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline" \| "success" \| "warning" \| "info" \| "ghost" \| "accent"` | No | `"default"` | Semantic visual variant. |
| `size` | `"default" \| "sm" \| "lg"` | No | `"default"` | Sizing and internal padding scale. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |
| `children` | `React.ReactNode` | Yes | - | Label text or inline elements. |

## Available Variants

- `default`: Clinical primary tone (`bg-primary text-primary-foreground`).
- `secondary`: Neutral secondary tone (`bg-secondary text-secondary-foreground`).
- `destructive`: Error, critical failure, or cancellation (`bg-destructive text-destructive-foreground`).
- `outline`: Subtle transparent outline (`text-foreground border border-input`).
- `success`: Successful operations and completed pipelines (`bg-emerald-500/10 text-emerald-600 border border-emerald-500/20`).
- `warning`: In-progress and pending steps (`bg-amber-500/10 text-amber-600 border border-amber-500/20`).
- `info`: Contextual information and literature links (`bg-sky-500/10 text-sky-600 border border-sky-500/20`).
- `ghost`: Borderless, transparent badge (`hover:bg-accent hover:text-accent-foreground`).
- `accent`: Prominent highlighted accent (`bg-accent text-accent-foreground`).

## Usage Example

```tsx
import { Badge } from "@/components/atoms/Badge";

export function StatusIndicator() {
  return (
    <div className="flex gap-2">
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning" size="sm">Running</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  );
}
```
