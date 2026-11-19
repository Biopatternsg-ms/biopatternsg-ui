# FormField (Molecule)

The **FormField** component is a molecule assembling a `Label`, an input control (`Input`, `Select`, `Textarea`, or custom child), and an inline validation error message.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/FormField.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/FormField.tsx)

## Dependencies

- `@/components/atoms/Label`: Accessible label atom with required indicators.
- `@/components/atoms/Input`: Standard text input.
- `@/components/atoms/Select`: Option selector atom.
- `@/components/atoms/Textarea`: Multiline textarea atom.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `label` | `string` | No | `undefined` | Field label text. |
| `required` | `boolean` | No | `false` | Displays mandatory indicator. |
| `error` | `string` | No | `undefined` | Validation error message displayed below the input. |
| `helperText` | `string` | No | `undefined` | Contextual hint or instruction text. |
| `type` | `"text" \| "password" \| "email" \| "number" \| "select" \| "textarea"` | No | `"text"` | Input control type to render. |
| `options` | `SelectOption[]` | No | `undefined` | Options list when `type === "select"`. |
| `children` | `React.ReactNode` | No | `undefined` | Custom control override. |

## Usage Example

```tsx
import { FormField } from "@/components/molecules/FormField";

export function FormFields() {
  return (
    <div className="space-y-4">
      <FormField
        label="Institutional Email"
        required
        type="email"
        placeholder="researcher@institute.org"
      />
      <FormField
        label="Confidence Threshold"
        type="select"
        options={[
          { value: "high", label: "High (> 0.85)" },
          { value: "medium", label: "Medium (0.50 - 0.85)" }
        ]}
      />
    </div>
  );
}
```
