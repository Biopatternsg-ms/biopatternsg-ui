# NavLink (Atom)

The **NavLink** component is an atomic navigation link styled for header menus and navigation bars, supporting active route indicators and smooth hover transitions.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/NavLink.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/NavLink.tsx)

## Dependencies

- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

Extends `React.AnchorHTMLAttributes<HTMLAnchorElement>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `active` | `boolean` | No | `false` | Highlights the link when corresponding to the active route. |
| `children` | `React.ReactNode` | Yes | - | Link content. |

## Usage Example

```tsx
import { NavLink } from "@/components/atoms/NavLink";

export function NavigationItems() {
  return (
    <nav className="flex gap-4">
      <NavLink href="#features" active>Features</NavLink>
      <NavLink href="#workflow">Workflow</NavLink>
      <NavLink href="#contact">Contact</NavLink>
    </nav>
  );
}
```
