# SynonymChip (Atom)

The **SynonymChip** component is an interactive atom representing synonyms, aliases, or alternate identifiers for biological entities (e.g., HGNC symbols, UniProt IDs), with count badges and removal handlers.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/SynonymChip.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/SynonymChip.tsx)

## Dependencies

- `lucide-react`: `SlidersHorizontal` and `X` icons.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `synonym` | `string` | Yes | - | Synonym or alias term text. |
| `onClick` | `() => void` | No | `undefined` | Chip selection click handler. |
| `onRemove` | `() => void` | No | `undefined` | Removal click callback. |
| `isSelected` | `boolean` | No | `false` | Active selection state. |
| `count` | `number` | No | `undefined` | Occurrence count in scientific literature. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { SynonymChip } from "@/components/atoms/SynonymChip";

export function GeneSynonyms() {
  return (
    <div className="flex flex-wrap gap-2">
      <SynonymChip synonym="TP53" count={142} isSelected />
      <SynonymChip synonym="p53" count={89} />
      <SynonymChip synonym="LFS1" count={12} onRemove={() => {}} />
    </div>
  );
}
```
