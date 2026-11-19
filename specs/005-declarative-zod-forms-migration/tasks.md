# Tasks: Declarative Zod & React Hook Form Migration for Experiments

**Input**: Design documents from `/specs/005-declarative-zod-forms-migration/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification and schema folder setup.

- [x] T001 Verify baseline repository status, branch `feature/05-declarative-zod-forms-migration`, and clean compilation (`npm run build`) in `services/biopatternsg-ui`
- [x] T002 [P] Create directory structure `src/schemas/experiments/` for modular validation schemas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core Zod schemas and inferred types required across wizard steps and interactive forms.

**⚠️ CRITICAL**: Must be completed before refactoring wizard steps or view components.

- [x] T003 [P] Implement `src/schemas/experiments/createExperimentSchema.ts` with `generalConfigSchema`, `modelParametersSchema`, `expertObjectsSchema`, `searchConfigSchema`, combined `createExperimentSchema`, and exported inferred types
- [x] T004 [P] Implement `src/schemas/experiments/inferenceConfigSchema.ts` with `inferenceConfigSchema` and `InferenceConfigFormValues` type
- [x] T005 [P] Implement `src/schemas/experiments/objectUpdateSchemas.ts` with `updateBiologicalObjectsSchema`, `updateAlignedObjectsSchema`, `synonymInputSchema`, `selectClosingObjectsSchema`, and exported inferred types

**Checkpoint**: Core Zod validation schemas are implemented and exported with full type inference.

---

## Phase 3: User Story 1 - Declarative Type-Safe Experiment Creation Wizard (Priority: P1) 🎯 MVP

**Goal**: Replace manual `useState` inputs in `CreateExperiment.tsx` and its 4 steps with a unified `FormProvider` architecture backed by Zod validation schemas.

**Independent Test**: Navigate to `/dashboard/networks/:networkId/experiments/create` and edit mode. Attempt to advance through the `Stepper` with invalid values; verify inline errors block progression and valid inputs allow progression and successful creation/update.

### Implementation for User Story 1

- [x] T006 [US1] Refactor `src/modules/dashboard/experiments/CreateExperiment.tsx` to initialize `useForm<CreateExperimentFormValues>` with `zodResolver(createExperimentSchema)`, wrap steps in `<FormProvider>`, gate stepper progression with `form.trigger()`, and handle edit mode with `form.reset()`
- [x] T007 [P] [US1] Refactor `src/modules/dashboard/experiments/createExperiment/StepGeneralConfig.tsx` to consume `useFormContext` and bind `name` and `description` to `FormField` with inline error feedback
- [x] T008 [P] [US1] Refactor `src/modules/dashboard/experiments/createExperiment/StepModelParameters.tsx` to consume `useFormContext` and bind inputs (`sourceSelection`, `genome`, `track`, `identity`, `chromosome`, `strand`, `start`, `end`, `reliability`, `promoterRegion`) with inline error feedback
- [x] T009 [P] [US1] Refactor `src/modules/dashboard/experiments/createExperiment/StepExpertObjects.tsx` to consume `useFormContext` and manage `expertObjectsFile` and `expertObjectsList` via form state
- [x] T010 [P] [US1] Refactor `src/modules/dashboard/experiments/createExperiment/StepSearchConfig.tsx` to consume `useFormContext` and bind search parameters (`searchLevel`, `retMax`, `maxComplexes`, `useOnlyPrincipalName`) with inline error feedback

**Checkpoint**: User Story 1 is fully functional as an MVP increment. The entire experiment creation wizard uses declarative Zod validation.

---

## Phase 4: User Story 2 - Type-Safe Inference & Object Management Forms (Priority: P1)

**Goal**: Migrate inference configuration and object management views to declarative `useForm` + `zodResolver` validation while preserving custom interactive controls.

**Independent Test**: Navigate to inference configuration and biological object updates, input invalid thresholds or empty values, verify immediate schema validation feedback, and confirm successful persistence of valid configurations.

### Implementation for User Story 2

- [x] T011 [US2] Refactor `src/modules/dashboard/experiments/ConfigureInferences.tsx` to use `useForm<InferenceConfigFormValues>` with `zodResolver(inferenceConfigSchema)`, validating parameters and category selections
- [x] T012 [P] [US2] Refactor `src/modules/dashboard/experiments/UpdateBiologicalObjects.tsx` to integrate `updateBiologicalObjectsSchema` for validating biological role updates
- [x] T013 [P] [US2] Refactor `src/modules/dashboard/experiments/UpdateAlignedObjects.tsx` to integrate `synonymInputSchema` and `updateAlignedObjectsSchema` for validating symbol and synonym additions
- [x] T014 [P] [US2] Refactor `src/modules/dashboard/experiments/SelectClosingObjects.tsx` to integrate `selectClosingObjectsSchema` for validating closing object selections

**Checkpoint**: User Story 2 is fully functional. All experiment configuration and object update views use type-safe Zod validation.

---

## Phase 5: User Story 3 - Enforce Schema Type Inference in Network Creation (Priority: P2)

**Goal**: Remove manual interface duplication in `CreateNetwork.tsx` and enforce `z.infer<typeof createNetworkSchema>`.

**Independent Test**: Verify `CreateNetwork.tsx` compiles with `DataFormConfig<CreateNetworkFormValues>` and form submission behaves identically.

### Implementation for User Story 3

- [x] T015 [US3] Update `src/modules/dashboard/networks/CreateNetwork.tsx` line 36 to derive form values via `type CreateNetworkFormValues = z.infer<typeof createNetworkSchema>` and type `networkConfig: DataFormConfig<CreateNetworkFormValues>`

**Checkpoint**: User Story 3 is complete. Network creation derives form values directly from its Zod schema.

---

## Phase 6: User Story 4 - Zero Manual Form State Boundary Enforcement (Priority: P2)

**Goal**: Validate architectural boundaries across the entire codebase to confirm zero manual form input state.

**Independent Test**: Static analysis confirms all experiment form inputs are managed via React Hook Form and all schemas export inferred types.

### Implementation for User Story 4

- [x] T016 [P] [US4] Execute static check verifying zero manual form input `useState` hooks remain in `CreateExperiment.tsx` and wizard step components
- [x] T017 [P] [US4] Execute static check verifying zero manual form interfaces exist in `CreateNetwork.tsx` and all experiment schemas use `z.infer`

**Checkpoint**: Boundary enforcement passes with 100% compliance across all architectural rules.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, quality gates, and constitutional verification.

- [x] T018 Run production build gate (`npm run build`) in `services/biopatternsg-ui` and confirm 0 TypeScript errors
- [x] T019 Run linting gate (`npm run lint`) in `services/biopatternsg-ui` and confirm 0 ESLint errors/warnings
- [x] T020 Execute end-to-end quickstart validation scenarios defined in `specs/005-declarative-zod-forms-migration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1); blocks US1 and US2.
- **User Stories (Phases 3-6)**:
  - US1 (Phase 3) depends on `createExperimentSchema.ts` (Phase 2).
  - US2 (Phase 4) depends on `inferenceConfigSchema.ts` and `objectUpdateSchemas.ts` (Phase 2).
  - US3 (Phase 5) is independent and can proceed in parallel.
  - US4 (Phase 6) runs after US1, US2, and US3 are implemented.
- **Polish (Phase 7)**: Depends on all user story tasks being completed.

### Parallel Opportunities

- `T003`, `T004`, and `T005` in Phase 2 can run in parallel (separate schema files).
- `T007`, `T008`, `T009`, and `T010` in Phase 3 can run in parallel once `CreateExperiment.tsx` is updated.
- `T012`, `T013`, and `T014` in Phase 4 can run in parallel.
- `T015` (US3 CreateNetwork) can run concurrently with Phase 3 or Phase 4.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`, `T002`).
2. Complete Phase 2: Foundational schemas (`T003`).
3. Complete Phase 3: User Story 1 (`T006` - `T010`).
4. **VALIDATE**: Verify 4-step wizard with step-by-step Zod validation and edit mode.

### Incremental Delivery

1. Foundation + US1 (MVP) → Wizard fully migrated to React Hook Form + Zod.
2. Add US2 → Inference configuration & object views migrated.
3. Add US3 → `z.infer` enforced in `CreateNetwork.tsx`.
4. Add US4 + Polish → Automated boundary verification, clean lint, clean production build.
