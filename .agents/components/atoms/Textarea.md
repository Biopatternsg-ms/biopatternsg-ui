# Textarea (Atom)

The **Textarea** component is an atomic multi-line text input designed for lengthy descriptions, SPARQL queries, entity identifier lists, or clinical notes.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Textarea.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Textarea.tsx)
- **Form Integration:** Built with `React.forwardRef` for React Hook Form integration.

## Dependencies

- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

Extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { Textarea } from "@/components/atoms/Textarea";

export function QueryEditor() {
  return (
    <Textarea
      rows={5}
      placeholder="Paste identifiers or custom queries here..."
    />
  );
}
```
