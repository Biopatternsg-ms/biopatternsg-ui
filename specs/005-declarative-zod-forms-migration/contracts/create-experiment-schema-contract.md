# Contract: Create Experiment Wizard Form Schemas

**Module**: `src/schemas/experiments/createExperimentSchema.ts`  
**Consumers**:
- `src/modules/dashboard/experiments/CreateExperiment.tsx`
- `src/modules/dashboard/experiments/createExperiment/StepGeneralConfig.tsx`
- `src/modules/dashboard/experiments/createExperiment/StepModelParameters.tsx`
- `src/modules/dashboard/experiments/createExperiment/StepExpertObjects.tsx`
- `src/modules/dashboard/experiments/createExperiment/StepSearchConfig.tsx`

---

## 1. Exports

```typescript
import * as z from "zod";

export const generalConfigSchema: z.ZodObject<...>;
export type GeneralConfigFormValues = z.infer<typeof generalConfigSchema>;

export const modelParametersSchema: z.ZodEffects<z.ZodObject<...>>;
export type ModelParametersFormValues = z.infer<typeof modelParametersSchema>;

export const expertObjectsSchema: z.ZodObject<...>;
export type ExpertObjectsFormValues = z.infer<typeof expertObjectsSchema>;

export const searchConfigSchema: z.ZodObject<...>;
export type SearchConfigFormValues = z.infer<typeof searchConfigSchema>;

export const createExperimentSchema: z.ZodObject<...>;
export type CreateExperimentFormValues = z.infer<typeof createExperimentSchema>;
```

---

## 2. Validation & Stepper Contract

1. **Step 1 Field Set**: `["name", "description"]`
   - Validated on Step 1 "Next" button click via `trigger(["name", "description"])`.
2. **Step 2 Field Set**: `["sourceSelection", "genome", "track", "identity", "chromosome", "strand", "start", "end", "reliability", "promoterRegion"]`
   - Numeric fields coerced from string inputs (`z.coerce.number()`).
   - `end >= start` refinement checked.
3. **Step 3 Field Set**: `["expertObjectsFile", "expertObjectsList"]`
   - Accepts CSV file or manual object additions.
4. **Step 4 Field Set**: `["searchLevel", "retMax", "maxComplexes", "useOnlyPrincipalName"]`
   - Integer bounds checked before final submit.
5. **Final Submission**:
   - `handleSubmit(onSubmit)` ensures entire combined schema passes.
