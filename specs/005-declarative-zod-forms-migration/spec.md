# Feature Specification: Declarative Zod & React Hook Form Migration for Experiments

**Feature Branch**: `feature/05-declarative-zod-forms-migration`  
**Created**: 2026-11-19  
**Status**: Draft  
**Input**: SDD Requirement `REQ-UI-ARCH-05` from `/home/yacson/Proyectos/biopatternsg-ms/SDD/UI/05-declarative-zod-forms-migration/requirement.md`

---

## Clarifications

### Session 2026-11-19

- Q: ¿Dónde deben ubicarse y estructurarse los nuevos esquemas de validación Zod para los flujos de experimentos? → A: Crear un directorio dedicado `src/schemas/experiments/` con módulos específicos (`createExperimentSchema.ts`, `inferenceConfigSchema.ts`, etc.) para desacoplar validaciones de las vistas y mantener `src/domain/models/` como tipos puros de TypeScript.
- Q: ¿Cómo deben compartir el estado del formulario y orquestar la validación los 4 pasos del wizard en `CreateExperiment.tsx`? → A: Utilizar una única instancia `useForm` en `CreateExperiment.tsx` envuelta en `<FormProvider>`, permitiendo que cada sub-paso acceda mediante `useFormContext()` y validando el avance paso a paso con `form.trigger([camposDelPaso])`.
- Q: ¿Qué estrategia de integración de formularios debe aplicarse en las vistas interactivas complejas (`ConfigureInferences.tsx`, `UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, `SelectClosingObjects.tsx`)? → A: Implementar `useForm` + `zodResolver` directamente en cada vista con esquemas Zod modulares, vinculando los controles interactivos (chips, badges, selecciones) sin degradar los componentes especializados.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Declarative Type-Safe Experiment Creation Wizard (Priority: P1)

As a researcher setting up a new gene regulatory experiment or editing an existing one, when I navigate through the 4-step experiment creation wizard, the system must validate my configuration on each step using declarative Zod schemas and React Hook Form, displaying immediate inline field errors if data is invalid and preventing step progression until all step requirements are satisfied.

**Why this priority**: The experiment creation wizard (`CreateExperiment.tsx` and its 4 sub-steps) is the primary entry point for scientific pipeline execution in BioPatternSG. Currently, more than 15 fields manage state via disparate `useState` hooks with manual validation, leading to brittle transitions, lack of field-level accessibility, and direct violation of Principle VI (*Declarative, Type-Safe Forms*).

**Independent Test**: Navigate to `/dashboard/networks/:networkId/experiments/create` (or edit mode). For each wizard step:
1. Attempt to advance with empty/invalid inputs; verify inline error feedback is displayed and step progression is blocked.
2. Provide valid inputs; verify smooth transition to the next step via the `Stepper`.
3. In Step 3, attach/validate expert objects via CSV upload or manual entry.
4. On Step 4, submit the experiment; verify payload adapts accurately and saves without errors.

**Acceptance Scenarios**:
1. **Given** the user is on Step 1 (*General Configuration*), **When** the user leaves `name` or `description` empty and clicks "Next", **Then** inline field errors are shown and the wizard remains on Step 1.
2. **Given** the user is on Step 2 (*Model Parameters*), **When** numeric hyperparameters (such as `identity`, `start`, `end`, `reliability`) contain non-numeric characters or out-of-range values, **Then** Zod validation displays specific constraint errors.
3. **Given** the user is on Step 3 (*Expert Objects*), **When** an expert objects file or manual inputs are provided, **Then** the form state encapsulates the object data and validates structure prior to Step 4.
4. **Given** the user is on Step 4 (*Search Configuration*), **When** all search settings (`searchLevel`, `retMax`, `maxComplexes`) satisfy schema bounds, **Then** form submission constructs the pipeline payload cleanly and dispatches creation/update.
5. **Given** an existing experiment is loaded in edit mode (`/experiments/:experimentId/edit`), **When** data arrives from the backend service, **Then** the form resets its default values synchronously and populates all 4 steps accurately.

---

### User Story 2 - Type-Safe Inference & Object Management Forms (Priority: P1)

As an analyst configuring inference parameters or reviewing aligned, biological, and closing objects, I want all parameter inputs and editable lists to be managed and validated declaratively through Zod schemas and React Hook Form so that invalid configurations are caught client-side before API dispatch.

**Why this priority**: `ConfigureInferences.tsx`, `UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, and `SelectClosingObjects.tsx` manage complex biological settings and manual overrides. Manual state management makes validating nested constraints error-prone and violates Principle VI.

**Independent Test**: Navigate to each inference configuration and object review screen, enter invalid thresholds, empty labels, or malformed filters, and verify that schema validation provides immediate feedback, preventing invalid submission.

**Acceptance Scenarios**:
1. **Given** `ConfigureInferences.tsx`, **When** the analyst sets parameters (e.g. restriction levels, minimum confidence, iteration thresholds), **Then** all inputs validate against an explicit `inferenceConfigSchema` before triggering pipeline inference.
2. **Given** `UpdateBiologicalObjects.tsx` and `UpdateAlignedObjects.tsx`, **When** the user edits biological roles, symbols, or synonyms, **Then** entries are validated against object update schemas prior to persistence.
3. **Given** `SelectClosingObjects.tsx`, **When** closing objects are selected or filtered, **Then** selections validate against the closing selection schema before saving.

---

### User Story 3 - Enforce Schema Type Inference in Network Creation (Priority: P2)

As a frontend developer maintaining network management forms, I want `CreateNetwork.tsx` to infer its form values directly using `z.infer<typeof createNetworkSchema>` rather than manually writing a redundant TypeScript interface.

**Why this priority**: Eliminates redundant type definitions, ensures single source of truth for form data shapes, and satisfies Principle VI compliance.

**Independent Test**: Inspect `src/modules/dashboard/networks/CreateNetwork.tsx`; verify `networkConfig` is typed using `type CreateNetworkFormValues = z.infer<typeof createNetworkSchema>` and `npm run build` succeeds without type mismatch.

**Acceptance Scenarios**:
1. **Given** `src/modules/dashboard/networks/CreateNetwork.tsx`, **When** declaring `networkConfig`, **Then** the configuration uses `DataFormConfig<z.infer<typeof createNetworkSchema>>` without manual interface duplication.
2. **Given** changes to `createNetworkSchema`, **When** the code compiles, **Then** TypeScript automatically reflects changes in `CreateNetworkFormValues`.

---

### User Story 4 - Zero Manual Form State Boundary Enforcement (Priority: P2)

As a software architect, I want automated verification confirming that all form flows across `src/modules/dashboard/experiments/` and `src/modules/dashboard/networks/` use React Hook Form and Zod schemas, with zero ad-hoc `useState` variables representing form field inputs.

**Why this priority**: Ensures long-term maintainability, prevents regression back to manual input state tracking, and verifies 100% adherence to Principle VI.

**Independent Test**: Conduct static analysis across form modules verifying that all form inputs are bound via React Hook Form (`register`, `Controller`, or `DataForm`) and validated with Zod schemas.

**Acceptance Scenarios**:
1. **Given** all form views in `src/modules/dashboard/experiments/`, **When** inspecting input handlers and state, **Then** form fields are registered with React Hook Form and validated with Zod resolvers.
2. **Given** the entire codebase, **When** running `npm run build` and `npm run lint`, **Then** zero errors and zero warnings are reported.

---

### Edge Cases

- **Step Navigation with Incomplete Data**: If a user attempts to jump to Step 3 or 4 directly via the Stepper header without completing preceding steps, the form must enforce validation of intermediate steps and prevent premature step jumps.
- **Asynchronous Default Values (Edit Mode)**: In edit mode, when pipeline data loads asynchronously from the backend, React Hook Form's `reset()` must update all form fields without triggering premature validation errors on pristine loaded data.
- **Optional vs Required Hyperparameters in Step 2**: Transcription factor hyperparameters have source-dependent requirements (e.g. `JASPAR` vs `TFBIND` vs `BOTH`); the Zod schema must conditionally validate fields based on `sourceSelection` using `z.discriminatedUnion` or `.superRefine()`.
- **Large Lists of Biological Objects**: Array fields in `UpdateBiologicalObjects.tsx` and `UpdateAlignedObjects.tsx` with hundreds of rows must validate efficiently without causing UI frame drops during typing or selection.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The experiment creation flow MUST use React Hook Form (`useForm` / `FormProvider`) coupled with Zod validation schemas in `src/schemas/experiments/createExperimentSchema.ts` via `zodResolver` across `CreateExperiment.tsx` and its 4 step components (`StepGeneralConfig`, `StepModelParameters`, `StepExpertObjects`, `StepSearchConfig`).
- **FR-002**: Moving forward in the `CreateExperiment` wizard MUST validate the current step's schema fields (using `trigger()` or step schemas) and display inline error messages via `FormField` before allowing step advance.
- **FR-003**: The transcription factor configuration in Step 2 MUST validate required fields according to the selected source (`JASPAR`, `TFBIND`, or `BOTH`), enforcing numeric ranges on `identity` (0–100), `reliability` (0–100), and integer boundaries on `start` and `end`.
- **FR-004**: Edit mode in `CreateExperiment.tsx` MUST seamlessly populate form state from `experimentService.getPipelineById` using React Hook Form `reset()`.
- **FR-005**: `src/modules/dashboard/experiments/ConfigureInferences.tsx` MUST validate inference parameters through a dedicated Zod schema (`src/schemas/experiments/inferenceConfigSchema.ts`) and React Hook Form instead of manual input state.
- **FR-006**: `src/modules/dashboard/experiments/UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, and `SelectClosingObjects.tsx` MUST validate user inputs and updates using Zod schemas in `src/schemas/experiments/` before persisting changes.
- **FR-007**: `src/modules/dashboard/networks/CreateNetwork.tsx` MUST derive its form values type exclusively via `z.infer<typeof createNetworkSchema>` instead of declaring a duplicate manual interface.
- **FR-008**: All form schemas in `src/schemas/experiments/` MUST export their inferred TypeScript types (`export type SchemaType = z.infer<typeof schema>`).

---

### Key Entities *(include if feature involves data)*

- **GeneralConfigFormValues**: Form values for wizard Step 1:
  - `name`: `string` (min 1, max 120)
  - `description`: `string` (min 1, max 500)
- **ModelParametersFormValues**: Form values for wizard Step 2:
  - `sourceSelection`: `"JASPAR" | "TFBIND" | "BOTH"`
  - `genome`: `string`
  - `track`: `string`
  - `identity`: `number` (0 to 100)
  - `chromosome`: `string`
  - `strand`: `"POSITIVE" | "NEGATIVE"`
  - `start`: `number` (positive integer)
  - `end`: `number` (positive integer > start)
  - `reliability`: `number` (0 to 100)
  - `promoterRegion`: `string` (optional sequence)
- **ExpertObjectsFormValues**: Form values for wizard Step 3:
  - `expertObjectsFile`: `File | null` (optional CSV upload)
  - `expertObjectsList`: `ExpertObject[]`
- **SearchConfigFormValues**: Form values for wizard Step 4:
  - `searchLevel`: `string`
  - `retMax`: `number` (positive integer)
  - `maxComplexes`: `number` (positive integer)
  - `useOnlyPrincipalName`: `boolean`
- **InferenceConfigFormValues**: Parameters for inference pipeline configuration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **100% Zod Form Adoption**: 100% of data-entry forms in `src/modules/dashboard/experiments/` validate input via explicit Zod schemas and React Hook Form.
- **SC-002**: **100% Type Inference**: Exactly 0 duplicated manual TypeScript form interfaces exist in `CreateExperiment.tsx` and `CreateNetwork.tsx`; all derive from `z.infer`.
- **SC-003**: **Inline Error Feedback**: 100% of invalid user inputs display contextual inline error messages via `FormField` before submission or step progression.
- **SC-004**: **Full Production Build Integrity**: Production build (`npm run build`) and linting (`npm run lint`) pass with 0 errors and 0 warnings.

---

## Assumptions

- The visual appearance, stepper design, and 4-step wizard sequence in `CreateExperiment` remain identical to the existing UI.
- React Hook Form version 7+ and `@hookform/resolvers/zod` are already present in `package.json` dependencies.
- CSV parsing in Step 3 continues to utilize `expertObjectsToCsvFile` and existing parsing utilities in `src/utils/csvParser.ts`.
