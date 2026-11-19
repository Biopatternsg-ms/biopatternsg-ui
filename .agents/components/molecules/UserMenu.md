# UserMenu (Molecule)

The **UserMenu** component is a presentational molecule combining the `Avatar` atom, the active researcher's credentials, and a dropdown menu with logout options.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/UserMenu.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/UserMenu.tsx)
- **Architecture:** Decoupled from `AuthContext`; accepts user details and `onLogout` callback purely via props from the parent layout or organism (`TopBar`).

## Dependencies

- `lucide-react`: `LogOut` icon.
- `@/components/atoms/Avatar`: Initials avatar rendering.
- `@/components/atoms/DropdownMenu`: Floating dropdown container.

## Component Properties (Props)

### `UserProfileDisplay` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | `string` | No | Full name or preferred username. |
| `email` | `string` | No | User email address. |
| `initials` | `string` | No | Initials fallback. |
| `avatarUrl` | `string` | No | Optional image URL. |

### `UserMenuProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `user` | `UserProfileDisplay \| null` | No | `undefined` | User display credentials. |
| `onLogout` | `() => void` | No | `undefined` | Callback invoked when user selects "Log out". |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { UserMenu } from "@/components/molecules/UserMenu";

export function HeaderBar() {
  return (
    <header className="flex justify-between items-center px-6 py-4">
      <h1 className="text-xl font-bold">BioPatternSG</h1>
      <UserMenu
        user={{ name: "Dr. Jane Doe", email: "j.doe@institute.edu" }}
        onLogout={() => console.log("Logout triggered")}
      />
    </header>
  );
}
```
