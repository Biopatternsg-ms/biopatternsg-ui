# Implementation Plan: Declarative Zod & React Hook Form Migration for Experiments

**Branch**: `feature/05-declarative-zod-forms-migration` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-declarative-zod-forms-migration/spec.md`

---

## Summary

Migrate all form state management in the Experiments module (`src/modules/dashboard/experiments/`) to declarative React Hook Form backed by Zod validation schemas (`zodResolver`), and enforce single-source-of-truth type inference (`z.infer`) in `CreateNetwork.tsx`, achieving 100% compliance with Principle VI (*Declarative, Type-Safe Forms — React Hook Form + Zod*):
1. **Dedicated Zod Schemas**: Create `src/schemas/experiments/` with modular schemas (`createExperimentSchema.ts`, `inferenceConfigSchema.ts`, `objectUpdateSchemas.ts`) exporting inferred TypeScript types.
2. **Experiment Creation Wizard Refactor**: Replace 15+ ad-hoc `useState` hooks in `CreateExperiment.tsx` and its 4 steps with a unified `FormProvider` / `useFormContext` architecture, validating step progression via `trigger([currentStepFields])` and supporting edit mode via `reset(defaultValues)`.
3. **Inference & Object Update Form Migration**: Refactor `ConfigureInferences.tsx`, `UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, and `SelectClosingObjects.tsx` to use `useForm` + `zodResolver` without degrading custom chips and table UX.
4. **Schema Type Inference in Network Creation**: Replace manual interface typing in `src/modules/dashboard/networks/CreateNetwork.tsx` with `type CreateNetworkFormValues = z.infer<typeof createNetworkSchema>`.

---

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 22+, React 19.2 (Vite SPA)  
**Primary Dependencies**: React 19, React Hook Form 7+, `@hookform/resolvers/zod`, Zod 4, Tailwind CSS 3.4, Lucide React  
**Storage**: Client-side form state (`useForm`), API persistence via `experimentService` and `networkService`  
**Testing**: TypeScript strict compilation (`npm run build`), ESLint (`npm run lint`), manual & automated verification scenarios  
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page Web application frontend (Vite SPA)  
**Performance Goals**: Instant field-level touch/blur validation feedback (<50ms), zero lag on multi-row object updates  
**Constraints**:
- Strict compliance with Principle VI (*Declarative, Type-Safe Forms*) and Principle III (*Pure Domain Modeling*).
- Zod schemas isolated in `src/schemas/experiments/` to preserve domain purity in `src/domain/models/`.
- 100% of form input types inferred via `z.infer<typeof schema>`.
- Zero change to visual layout or number of steps in `CreateExperiment`.

**Scale/Scope**:
- 3 new schema modules in `src/schemas/experiments/`
- 1 refactored wizard orchestrator (`CreateExperiment.tsx`)
- 4 refactored wizard step components (`StepGeneralConfig`, `StepModelParameters`, `StepExpertObjects`, `StepSearchConfig`)
- 4 refactored interactive views (`ConfigureInferences`, `UpdateAlignedObjects`, `UpdateBiologicalObjects`, `SelectClosingObjects`)
- 1 updated form view (`CreateNetwork.tsx`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation & Evidence |
|:---|:---:|:---|
| **I. Strict Atomic Design Hierarchy** | **PASS** | Form inputs utilize existing atoms (`Input`, `Textarea`, `Select`, `Button`) and molecules (`FormField`, `Stepper`), keeping modules cleanly structured in `src/modules/`. |
| **II. Continuous Documentation Synchronization** | **PASS** | Atomic components are reused without prop signature modifications; component catalog remains synchronized. |
| **III. Pure Domain Modeling in `domain/models/`** | **PASS** | Validation schemas are placed in `src/schemas/experiments/`, keeping `src/domain/models/` purely TypeScript interfaces without Zod dependencies. |
| **IV. Mandatory Adapter Pattern** | **PASS** | Validated form values map to API payloads and domain models using existing adapters (`experimentAdapter.ts`, `networkAdapter.ts`). |
| **V. Encapsulated Service Layer & Centralized HTTP** | **PASS** | Form submissions invoke service methods (`experimentService`, `networkService`), preserving centralized HTTP transport. |
| **VI. Declarative, Type-Safe Forms** | **PASS** | **Direct Target**. Replaces all ad-hoc `useState` input management with React Hook Form + Zod resolvers and `z.infer`. |
| **VII. Robust Security & RBAC** | **PASS** | Client-side input validation and sanitized payloads enhance defense-in-depth across dashboard forms. |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-declarative-zod-forms-migration/
├── plan.md              # This implementation plan
├── spec.md              # Feature specification with recorded clarifications
├── research.md          # Architectural research & decisions (Phase 0)
├── data-model.md        # Form schemas & inferred types (Phase 1)
├── quickstart.md        # Verification and quality gate guide (Phase 1)
├── checklists/
│   └── requirements.md  # Specification quality checklist
├── contracts/           # Interface contracts (Phase 1)
│   ├── create-experiment-schema-contract.md
│   └── inference-forms-contract.md
└── tasks.md             # Execution task list (Phase 2 - generated by /speckit-tasks)
```

### Source Code Layout

```text
src/
├── schemas/
│   └── experiments/
│       ├── createExperimentSchema.ts   # NEW: Schemas for 4-step wizard + combined
│       ├── inferenceConfigSchema.ts    # NEW: Schema for inference parameters
│       └── objectUpdateSchemas.ts      # NEW: Schemas for biological/aligned/closing objects
├── modules/
│   └── dashboard/
│       ├── experiments/
│       │   ├── CreateExperiment.tsx          # Updated: FormProvider + useForm + trigger()
│       │   ├── createExperiment/
│       │   │   ├── StepGeneralConfig.tsx      # Updated: useFormContext() + FormField
│       │   │   ├── StepModelParameters.tsx    # Updated: useFormContext() + FormField
│       │   │   ├── StepExpertObjects.tsx      # Updated: useFormContext() + FormField
│       │   │   └── StepSearchConfig.tsx       # Updated: useFormContext() + FormField
│       │   ├── ConfigureInferences.tsx       # Updated: useForm + zodResolver
│       │   ├── UpdateAlignedObjects.tsx       # Updated: useForm + zodResolver
│       │   ├── UpdateBiologicalObjects.tsx    # Updated: useForm + zodResolver
│       │   └── SelectClosingObjects.tsx       # Updated: useForm + zodResolver
│       └── networks/
│           └── CreateNetwork.tsx              # Updated: z.infer type inference
```

**Structure Decision**: Validation schemas are housed in a dedicated `src/schemas/experiments/` folder. This establishes a clean architectural separation between domain models (`src/domain/models/`), form schemas (`src/schemas/`), and views (`src/modules/`).

---

## Complexity Tracking

> *No constitutional violations exist. All changes directly restore constitutional compliance with Principle VI.*

| Principle / Rule | Compliance Status | Resolution Mechanism |
|---|---|---|
| Principle VI (Declarative Forms) | COMPLIANT | React Hook Form (`useForm`, `FormProvider`) + Zod resolver in all experiment forms |
| Principle VI (`z.infer` typing) | COMPLIANT | `z.infer<typeof createNetworkSchema>` in `CreateNetwork.tsx` |
| Principle III (Pure Domain) | COMPLIANT | Schemas isolated in `src/schemas/experiments/`, keeping `domain/models/` pure |
