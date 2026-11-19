# Research & Architectural Decisions: Declarative Zod & React Hook Form Migration for Experiments

**Feature Branch**: `feature/05-declarative-zod-forms-migration`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Schema Organization & Modularization

### Context
`src/modules/dashboard/experiments/` contains multiple data-entry screens (`CreateExperiment.tsx` and 4 sub-steps, `ConfigureInferences.tsx`, `UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, `SelectClosingObjects.tsx`). None of these currently use Zod schemas, managing form input values manually via ad-hoc `useState` hooks. Placing schemas inline in view components causes circular dependencies, limits schema reusability, and bloats presentation files. On the other hand, placing them in `src/domain/models/` violates Principle III, which requires `domain/models/` to be pure TypeScript interfaces without third-party validation libraries.

### Decision
Create a dedicated validation schema directory `src/schemas/experiments/` containing:
- `createExperimentSchema.ts`: Exports per-step schemas (`generalConfigSchema`, `modelParametersSchema`, `expertObjectsSchema`, `searchConfigSchema`) and the combined `createExperimentSchema`.
- `inferenceConfigSchema.ts`: Exports `inferenceConfigSchema` for inference parameters.
- `objectUpdateSchemas.ts`: Exports schemas for biological roles, aligned objects, and closing object selections.

Each schema exports both the Zod schema object and its inferred TypeScript type (`export type SchemaType = z.infer<typeof schema>`).

### Rationale
- Completely isolates form validation rules from presentational rendering.
- Preserves the purity of `src/domain/models/` (satisfying Principle III).
- Allows wizard steps, submit handlers, adapters, and unit tests to import schemas independently.

### Alternatives Considered
- *Inline schemas in component files*: Rejected. Causes tight coupling and prevents per-step schema validation triggering in multi-step wizard orchestrations.
- *Placing Zod schemas directly in `src/domain/models/`*: Rejected. Directly violates Principle III (*Pure Domain Modeling*).

---

## 2. Multi-Step Wizard State Management in `CreateExperiment.tsx`

### Context
`CreateExperiment.tsx` features a 4-step `Stepper`:
1. General Configuration (`StepGeneralConfig.tsx`)
2. Model Parameters (`StepModelParameters.tsx`)
3. Expert Objects (`StepExpertObjects.tsx`)
4. Search Configuration (`StepSearchConfig.tsx`)

Currently, `CreateExperiment.tsx` holds more than 15 separate `useState` hooks and passes values and setters down to child components via prop drilling. There is no automated field-level validation or error display on blur/change.

### Decision
Use React Hook Form's `FormProvider` pattern:
1. Initialize a single `useForm<CreateExperimentFormValues>` in `CreateExperiment.tsx` configured with `zodResolver(createExperimentSchema)` and `mode: "onTouched"`.
2. Wrap the step views in `<FormProvider {...methods}>`.
3. In child step components (`StepGeneralConfig.tsx`, etc.), consume form state using `useFormContext<CreateExperimentFormValues>()`.
4. When clicking "Next" in the `Stepper`, trigger validation only for the fields of the active step:
   - Step 1: `await trigger(["name", "description"])`
   - Step 2: `await trigger(["sourceSelection", "genome", "track", "identity", "chromosome", "strand", "start", "end", "reliability", "promoterRegion"])`
   - Step 3: `await trigger(["expertObjectsFile", "expertObjectsList"])`
   - Step 4: Final submission validates all fields via `handleSubmit(onSubmit)`.
5. In edit mode (`isEditMode`), when pipeline data is fetched by `experimentService.getPipelineById`, populate the form cleanly using `reset(defaultValues)`.

### Rationale
- Standard React Hook Form pattern for multi-step forms.
- Eliminates manual prop drilling of 15+ state setters.
- Inline validation errors display automatically through `FormField` using `errors[fieldName]?.message`.
- Step navigation is gated: if validation fails, the stepper does not advance, and field errors guide the user.

### Alternatives Considered
- *Separate `useForm` instance in each step component*: Rejected during clarification. Requires manual state lifting, duplicate synchronization logic, and complicates edit mode initialization.
- *Global Zustand store for form draft*: Rejected as unnecessary state complexity for a localized wizard flow.

---

## 3. Interactive Views Form Integration (`ConfigureInferences`, `UpdateBiologicalObjects`, etc.)

### Context
`ConfigureInferences.tsx`, `UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, and `SelectClosingObjects.tsx` feature rich interactive UI:
- Dynamic chip lists (`SynonymChip`) with add/remove actions.
- Interactive role pills (`RolePillBadge`) and category filter grids.
- Paginated table selections with search inputs.

The generic `DataForm` component is designed for static linear field layouts (`text`, `textarea`, `select`) and cannot natively render complex interactive tables or chip managers.

### Decision
Implement `useForm` + `zodResolver` directly within each of these 4 views:
- For `ConfigureInferences.tsx`: Bind form fields (`restriction`, `minConfidence`, `maxInferenceIterations`, `categories`) to `useForm<InferenceConfigFormValues>({ resolver: zodResolver(inferenceConfigSchema) })`.
- For `UpdateBiologicalObjects.tsx` & `UpdateAlignedObjects.tsx`: Bind input fields and array mutations to dedicated update schemas, validating items before mutating or submitting.
- For `SelectClosingObjects.tsx`: Validate object selections against `selectClosingObjectsSchema`.

### Rationale
- Retains 100% of the rich domain-specific UX (chips, badges, tables, search filters).
- Guarantees that all inputs and selections are validated by Zod schemas prior to dispatching API calls through services and adapters.
- Satisfies Principle VI (*Declarative, Type-Safe Forms*).

### Alternatives Considered
- *Forcing all views into `DataForm`*: Rejected. Would break the user experience by stripping custom tables, dynamic chips, and multi-faceted search filters.
- *Validation-only on submission with `safeParse` without React Hook Form*: Rejected. Does not provide real-time field-level touch/dirty states or standardized form lifecycle hooks.

---

## 4. Single Source of Truth Type Inference in `CreateNetwork.tsx`

### Context
In `src/modules/dashboard/networks/CreateNetwork.tsx` line 36:
```ts
const createNetworkSchema = z.object({
  name: z.string().min(1, "Network name is required."),
  description: z.string().min(1, "Description is required."),
});

const networkConfig: DataFormConfig<{ name: string; description: string }> = { ... };
```
The type `{ name: string; description: string }` is written manually instead of using `z.infer`.

### Decision
Derive the type directly from the schema:
```ts
export type CreateNetworkFormValues = z.infer<typeof createNetworkSchema>;

const networkConfig: DataFormConfig<CreateNetworkFormValues> = { ... };
```

### Rationale
- Ensures single source of truth for form data structure.
- Prevents schema-type drift when fields or constraints change.
- Satisfies Principle VI compliance requirement.
