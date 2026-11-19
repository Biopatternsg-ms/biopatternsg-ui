# Data Model & Schema Specifications: Declarative Zod & React Hook Form Migration

**Feature Branch**: `feature/05-declarative-zod-forms-migration`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Experiment Wizard Schemas (`src/schemas/experiments/createExperimentSchema.ts`)

### Step 1: General Configuration Schema
```typescript
export const generalConfigSchema = z.object({
  name: z.string().trim().min(1, "Experiment name is required.").max(120, "Name must not exceed 120 characters."),
  description: z.string().trim().min(1, "Description is required.").max(500, "Description must not exceed 500 characters."),
});

export type GeneralConfigFormValues = z.infer<typeof generalConfigSchema>;
```

### Step 2: Model Parameters Schema
```typescript
export const modelParametersSchema = z.object({
  sourceSelection: z.enum(["JASPAR", "TFBIND", "BOTH"]),
  genome: z.string().trim().min(1, "Genome is required (e.g. HG38)."),
  track: z.string().trim().min(1, "Track is required (e.g. jaspar2022)."),
  identity: z.coerce.number().min(0, "Identity must be at least 0.").max(100, "Identity cannot exceed 100."),
  chromosome: z.string().trim().min(1, "Chromosome is required (e.g. chr8)."),
  strand: z.string().trim().min(1, "Strand is required (e.g. NEGATIVE or POSITIVE)."),
  start: z.coerce.number().int("Start must be an integer.").min(0, "Start must be positive."),
  end: z.coerce.number().int("End must be an integer.").min(0, "End must be positive."),
  reliability: z.coerce.number().min(0, "Reliability must be at least 0.").max(100, "Reliability cannot exceed 100."),
  promoterRegion: z.string().optional().default(""),
}).refine((data) => data.end >= data.start, {
  message: "End position must be greater than or equal to start position.",
  path: ["end"],
});

export type ModelParametersFormValues = z.infer<typeof modelParametersSchema>;
```

### Step 3: Expert Objects Schema
```typescript
export const expertObjectsSchema = z.object({
  expertObjectsFile: z.custom<File | null>().optional().nullable(),
  expertObjectsList: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Object name is required."),
      type: z.string().min(1, "Object type is required."),
    })
  ).default([]),
});

export type ExpertObjectsFormValues = z.infer<typeof expertObjectsSchema>;
```

### Step 4: Search Configuration Schema
```typescript
export const searchConfigSchema = z.object({
  searchLevel: z.string().trim().min(1, "Search level is required."),
  retMax: z.coerce.number().int("Max results must be an integer.").min(1, "Must be at least 1.").max(10000, "Max limit is 10,000."),
  maxComplexes: z.coerce.number().int("Max complexes must be an integer.").min(1, "Must be at least 1.").max(1000, "Max limit is 1,000."),
  useOnlyPrincipalName: z.boolean().default(true),
});

export type SearchConfigFormValues = z.infer<typeof searchConfigSchema>;
```

### Combined Wizard Schema
```typescript
export const createExperimentSchema = generalConfigSchema
  .merge(modelParametersSchema)
  .merge(expertObjectsSchema)
  .merge(searchConfigSchema);

export type CreateExperimentFormValues = z.infer<typeof createExperimentSchema>;
```

---

## 2. Inference Configuration Schema (`src/schemas/experiments/inferenceConfigSchema.ts`)

```typescript
export const inferenceConfigSchema = z.object({
  restriction: z.string().min(1, "Restriction level is required."),
  minConfidence: z.coerce.number().min(0, "Confidence must be at least 0.").max(1, "Confidence cannot exceed 1.0.").optional(),
  maxInferenceIterations: z.coerce.number().int().min(1, "Iterations must be at least 1.").max(100, "Max 100 iterations.").optional(),
  categories: z.array(z.string()).min(1, "At least one category must be selected."),
});

export type InferenceConfigFormValues = z.infer<typeof inferenceConfigSchema>;
```

---

## 3. Object Update Schemas (`src/schemas/experiments/objectUpdateSchemas.ts`)

```typescript
export const updateBiologicalRoleSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1, "Biological role is required."),
  confidence: z.coerce.number().min(0).max(1).optional(),
});

export const updateBiologicalObjectsSchema = z.object({
  items: z.array(updateBiologicalRoleSchema),
});

export type UpdateBiologicalObjectsFormValues = z.infer<typeof updateBiologicalObjectsSchema>;

export const synonymInputSchema = z.string().trim().min(1, "Synonym cannot be empty.").max(100, "Synonym too long.");

export const updateAlignedObjectsSchema = z.object({
  alignedObjects: z.array(
    z.object({
      id: z.string().min(1),
      symbol: z.string().min(1, "Symbol is required."),
      synonyms: z.array(z.string()),
    })
  ),
});

export type UpdateAlignedObjectsFormValues = z.infer<typeof updateAlignedObjectsSchema>;

export const selectClosingObjectsSchema = z.object({
  selectedObjectIds: z.array(z.string()).min(1, "Select at least one closing object."),
});

export type SelectClosingObjectsFormValues = z.infer<typeof selectClosingObjectsSchema>;
```

---

## 4. Network Creation Form Schema (`src/modules/dashboard/networks/CreateNetwork.tsx`)

```typescript
export const createNetworkSchema = z.object({
  name: z.string().trim().min(1, "Network name is required.").max(100, "Name must not exceed 100 characters."),
  description: z.string().trim().min(1, "Description is required.").max(500, "Description must not exceed 500 characters."),
});

export type CreateNetworkFormValues = z.infer<typeof createNetworkSchema>;
```
