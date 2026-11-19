# DropdownMenu (Atom)

The **DropdownMenu** component is an atomic floating contextual menu toggled by an activator (`trigger`). It includes outside click detection and keyboard dismissal (`Escape`).

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/DropdownMenu.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/DropdownMenu.tsx)
- **Interaction:** Automatically closes on outside click and `Escape` key press.

## Dependencies

- `lucide-react`: Typed icon support using `LucideIcon`.
- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

### `DropdownMenuItem` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Yes | Menu item label text. |
| `icon` | `LucideIcon` | No | Leading item icon. |
| `onClick` | `() => void` | Yes | Callback invoked when the item is clicked. |
| `danger` | `boolean` | No | Applies a destructive red accent for critical actions. |
| `disabled` | `boolean` | No | Disables item interaction. |
| `divider` | `boolean` | No | Renders a horizontal divider separator before this item. |

### `DropdownMenuProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `trigger` | `React.ReactNode` | Yes | - | Element that triggers the dropdown when clicked. |
| `items` | `DropdownMenuItem[]` | Yes | - | Array of menu action items. |
| `align` | `"left" \| "right"` | No | `"right"` | Horizontal alignment relative to the trigger. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { DropdownMenu } from "@/components/atoms/DropdownMenu";
import { Button } from "@/components/atoms/Button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export function TableActions() {
  return (
    <DropdownMenu
      trigger={<Button variant="ghost" size="icon" icon={MoreVertical} />}
      items={[
        { label: "Edit", icon: Edit, onClick: () => console.log("Edit") },
        { label: "Delete", icon: Trash2, danger: true, onClick: () => console.log("Delete") }
      ]}
    />
  );
}
```
