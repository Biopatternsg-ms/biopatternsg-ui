# Select (Atom)

The **Select** component wraps the standard HTML `<select>` element with a clinical theme, custom dropdown chevron icon, and validation error styling.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/Select.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Select.tsx)

## Dependencies

- `lucide-react`: `ChevronDown` icon.
- `@/lib/utils`: `cn` utility.

## Component Properties (Props)

### `SelectOption` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `value` | `string` | Yes | Internal option value. |
| `label` | `string` | Yes | Human-readable option label. |
| `disabled` | `boolean` | No | Disables this specific option. |

### `SelectProps` Interface
Extends `React.SelectHTMLAttributes<HTMLSelectElement>`.

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `options` | `SelectOption[]` | Yes | - | Array of available options. |
| `error` | `boolean` | No | `false` | Enables error visual styling. |
| `placeholder` | `string` | No | `undefined` | Default disabled option acting as a placeholder. |

## Usage Example

```tsx
import { Select } from "@/components/atoms/Select";

export function ModelSelector() {
  return (
    <Select
      placeholder="Select an inference model..."
      options={[
        { value: "transE", label: "TransE" },
        { value: "complex", label: "ComplEx" },
        { value: "rotate", label: "RotatE" }
      ]}
      onChange={(e) => console.log(e.target.value)}
    />
  );
}
```
