# Contract: Inference & Object Management Form Schemas

**Modules**:
- `src/schemas/experiments/inferenceConfigSchema.ts`
- `src/schemas/experiments/objectUpdateSchemas.ts`

**Consumers**:
- `src/modules/dashboard/experiments/ConfigureInferences.tsx`
- `src/modules/dashboard/experiments/UpdateAlignedObjects.tsx`
- `src/modules/dashboard/experiments/UpdateBiologicalObjects.tsx`
- `src/modules/dashboard/experiments/SelectClosingObjects.tsx`

---

## 1. Exports

```typescript
import * as z from "zod";

// Inference Configuration
export const inferenceConfigSchema: z.ZodObject<...>;
export type InferenceConfigFormValues = z.infer<typeof inferenceConfigSchema>;

// Object Updates
export const updateBiologicalRoleSchema: z.ZodObject<...>;
export const updateBiologicalObjectsSchema: z.ZodObject<...>;
export type UpdateBiologicalObjectsFormValues = z.infer<typeof updateBiologicalObjectsSchema>;

export const synonymInputSchema: z.ZodString;
export const updateAlignedObjectsSchema: z.ZodObject<...>;
export type UpdateAlignedObjectsFormValues = z.infer<typeof updateAlignedObjectsSchema>;

export const selectClosingObjectsSchema: z.ZodObject<...>;
export type SelectClosingObjectsFormValues = z.infer<typeof selectClosingObjectsSchema>;
```

---

## 2. Behavioral Contract

1. **Inference Configuration**:
   - `ConfigureInferences.tsx` uses `useForm<InferenceConfigFormValues>({ resolver: zodResolver(inferenceConfigSchema) })`.
   - Category selections and numeric thresholds are validated before calling `experimentService.saveInferenceConfig`.
2. **Object Management**:
   - New synonyms added via `SynonymChip` are validated using `synonymInputSchema.safeParse(newSynonym)` before insertion into form state.
   - Bulk role updates are validated prior to invoking `experimentService.saveBiologicalRoles`.
