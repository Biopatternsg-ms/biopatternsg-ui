# UserMenu (Molecule)

The **UserMenu** component is a molecule combining the `Avatar` atom, the active researcher's credentials, and a dropdown menu with profile, settings, and logout options.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/UserMenu.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/UserMenu.tsx)

## Dependencies

- `lucide-react`: `User`, `Settings`, `LogOut`, `ChevronDown` icons.
- `@/components/atoms/Avatar`: Initials avatar rendering.
- `@/components/atoms/DropdownMenu`: Floating dropdown container.
- Authentication context.

## Usage Example

```tsx
import { UserMenu } from "@/components/molecules/UserMenu";

export function HeaderBar() {
  return (
    <header className="flex justify-between items-center px-6 py-4">
      <h1 className="text-xl font-bold">BioPatternSG</h1>
      <UserMenu />
    </header>
  );
}
```
