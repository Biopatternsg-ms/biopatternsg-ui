# Avatar (Atom)

The **Avatar** component is an atomic element representing a user, researcher, or clinical profile within the user interface. It renders user initials or a generic Lucide fallback user icon when no initials are provided.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Avatar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Avatar.tsx)
- **Design System:** Circular container (`rounded-full`) with subtle borders and surface tokens tailored for *The Clinical Lens*.

## Dependencies

- `lucide-react`: `User` icon for the fallback state.
- `@/lib/utils`: `cn` utility function for conditional Tailwind class merging.

## Component Properties (Props)

Extends `AvatarProps`:

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `initials` | `string` | No | `undefined` | User initials to display (automatically normalized and truncated to 2 uppercase characters). |
| `size` | `"sm" \| "md" \| "lg"` | No | `"md"` | Avatar dimensions (`sm`: 32x32px, `md`: 40x40px, `lg`: 48x48px). |

## Usage Example

```tsx
import { Avatar } from "@/components/atoms/Avatar";

export function UserHeader() {
  return (
    <div className="flex items-center gap-3">
      {/* Avatar with initials */}
      <Avatar initials="JD" size="md" />

      {/* Fallback avatar with generic icon */}
      <Avatar size="sm" />
    </div>
  );
}
```

## Behavior & Styling Details

- **Initials Sanitization:** Truncated and converted to uppercase via `initials.slice(0, 2).toUpperCase()`.
- **Fallback Rendering:** If `initials` is omitted or empty, the Lucide `<User />` icon is rendered with `text-on-surface-variant`.
