# DataForm (Organism)

The **DataForm** is a dynamic, strongly typed form generator organism. It interprets a declarative configuration (`DataFormConfig`), binds `react-hook-form` with Zod validation, and renders `FormField` molecules automatically.

## Overview

- **Level:** Organism
- **Source Code:**
  - [`src/components/organisms/DataForm.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DataForm.tsx)
  - [`src/components/organisms/DataFormConfig.ts`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DataFormConfig.ts)

## Dependencies

- `react-hook-form`: Form state management (`useForm`).
- `zod`: Schema validation.
- `@hookform/resolvers/zod`: Zod schema resolver bridge.
- `@/components/molecules/FormField`: Field molecule for each rendered item.
- `@/components/atoms/Button`: Form submission button.

## Key Interfaces (`DataFormConfig.ts`)

```typescript
export interface FieldDescriptor {
  name: string;
  label?: string;
  type?: "text" | "password" | "email" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  helperText?: string;
}

export interface DataFormConfig<T extends FieldValues> {
  schema: ZodType<T>;
  fields: FieldDescriptor[];
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}
```

## Usage Example

```tsx
import { DataForm } from "@/components/organisms/DataForm";
import { z } from "zod";

const experimentSchema = z.object({
  title: z.string().min(3, "At least 3 characters required"),
  modelType: z.string().min(1, "Please select an inference model"),
  description: z.string().optional()
});

export function CreateExperimentForm() {
  return (
    <DataForm
      config={{
        schema: experimentSchema,
        fields: [
          { name: "title", label: "Experiment Title", required: true },
          {
            name: "modelType",
            label: "Inference Model",
            type: "select",
            options: [
              { value: "transE", label: "TransE" },
              { value: "rotate", label: "RotatE" }
            ]
          },
          { name: "description", label: "Description", type: "textarea" }
        ],
        submitLabel: "Create Experiment",
        onSubmit: async (values) => {
          console.log("Validated form values:", values);
        }
      }}
    />
  );
}
```
