# Tasks: Mandatory Adapter Pattern Implementation

**Input**: Design documents from `/specs/003-mandatory-adapter-pattern-implementation/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification and initial utility setup.

- [x] T001 Verify baseline repository status and TypeScript compilation (`npm run build`) in `services/biopatternsg-ui`
- [x] T002 [P] Create presentation date formatting utility in `src/utils/dateUtils.ts` providing `formatDateToDisplay(dateString?: string): string`
- [x] T003 [P] Create presentation pipeline metric parsing utility in `src/utils/metricUtils.ts` providing `parseExperimentMetrics(rawMetrics?: RawMetricInput): ParsedMetricItem[]`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core bidirectional mappers with dual exports across all adapters.

**⚠️ CRITICAL**: All user stories depend on these adapter contracts.

- [x] T004 Implement pure boundary transformations and dual exports in `src/adapters/networkAdapter.ts` (`toNetworkDomain`, `toPaginatedNetworksDomain`, `toCreateNetworkPayload`, and `networkAdapter` namespace object)
- [x] T005 [P] Implement pure boundary transformations and dual exports in `src/adapters/experimentAdapter.ts` (`toExperimentDomain`, `toPipelineStatus`, `toBiologicalObjectDomain`, `toAlignedObjectDomain`, `toInferenceRolesDomain`, `toBiologicalRoleList`, `toCreateExperimentPayload`, `toSaveBiologicalRolesPayload`, `toSaveAlignedObjectsPayload`, `toInferenceConfigPayload`, and `experimentAdapter` namespace object)
- [x] T006 [P] Implement pure boundary transformations and dual exports in `src/adapters/pathwayAdapter.ts` (`toGroupedPathway`, `toGroupedPathwayList`, `toPathwayGraphNode`, `toPathwayGraphEdge`, `toBiologicalPathway`, `toGroupedPathwaysResult`, `toPathwayGraphForceData`, and `pathwayAdapter` namespace object)

**Checkpoint**: Base adapters ready with dual exports. User story implementation can now proceed.

---

## Phase 3: User Story 1 - Type-Safe Network Boundary Mediation (Priority: P1) 🎯 MVP

**Goal**: Mediate network creation and listing through `networkAdapter` and encapsulate adaptation in `networkService.ts`.

**Independent Test**: Verify gene regulatory networks load and display formatted dates (`DD/MM/YYYY`) using `dateUtils.ts` in `Network.tsx`, and new networks register via `CreateNetwork.tsx` with zero inline DTO manipulations.

### Implementation for User Story 1

- [x] T007 [US1] Encapsulate `networkAdapter` calls within `src/services/networkService.ts` for `getNetworks` and `createNetwork`, returning `PaginatedResult<Network>`
- [x] T008 [P] [US1] Refactor `src/modules/dashboard/networks/CreateNetwork.tsx` to dispatch `CreateNetworkInput` via `networkService.createNetwork` with `networkAdapter.toCreateNetworkPayload`
- [x] T009 [P] [US1] Refactor `src/modules/dashboard/networks/Network.tsx` to consume `formatDateToDisplay` from `src/utils/dateUtils.ts` and verify pure `Network` domain model usage

**Checkpoint**: User Story 1 is fully functional and testable as an MVP increment.

---

## Phase 4: User Story 2 - Comprehensive Experiment & Pipeline Boundary Mediation (Priority: P1)

**Goal**: Decouple all experiment lifecycle views from backend wire quirks and inline transformations.

**Independent Test**: Run and monitor an experiment execution, edit biological roles and aligned objects, and configure inferences, confirming all screens render and mutate data cleanly using pure domain models and adapters.

### Implementation for User Story 2

- [x] T010 [US2] Update `src/services/experimentService.ts` to mediate `getPipelines`, `getBiologicalObjects`, and `saveInferenceConfig` via `experimentAdapter`
- [x] T011 [P] [US2] Refactor `src/modules/dashboard/experiments/ExperimentExecution.tsx` to consume `parseExperimentMetrics` from `src/utils/metricUtils.ts`, removing all local inline metric parsing functions
- [x] T012 [P] [US2] Refactor `src/modules/dashboard/experiments/CreateExperiment.tsx` to adapt created/updated pipeline responses using `toExperimentDomain` and `toCreateExperimentPayload`
- [x] T013 [P] [US2] Refactor `src/modules/dashboard/experiments/UpdateBiologicalObjects.tsx` to map outgoing roles using `toSaveBiologicalRolesPayload` from `src/adapters/experimentAdapter.ts`
- [x] T014 [P] [US2] Refactor `src/modules/dashboard/experiments/UpdateAlignedObjects.tsx` to map outgoing symbols using `toSaveAlignedObjectsPayload` from `src/adapters/experimentAdapter.ts`
- [x] T015 [P] [US2] Refactor `src/modules/dashboard/experiments/ConfigureInferences.tsx` to prepare inference parameter payloads using `toInferenceConfigPayload` from `src/adapters/experimentAdapter.ts`

**Checkpoint**: User Story 2 is fully functional and all experiment modules consume pure domain models.

---

## Phase 5: User Story 3 - High-Fidelity Pathway Graph Adaptation (Priority: P1)

**Goal**: Ingest 2D force-directed pathway graph data exclusively through `pathwayAdapter.toPathwayGraphForceData`.

**Independent Test**: Load the pathway graph viewer for an experiment, verifying nodes and links render with correct clinical role styles on the force-directed canvas without view-level graph filtering.

### Implementation for User Story 3

- [x] T016 [US3] Refactor `src/modules/dashboard/experiments/PathwayGraphView.tsx` to replace inline node/edge mapping with `pathwayAdapter.toPathwayGraphForceData` in both initial load and refresh handlers

**Checkpoint**: User Story 3 is fully functional with zero inline graph transformations in views.

---

## Phase 6: User Story 4 - Zero Service Model Leakage & Architecture Boundary Enforcement (Priority: P2)

**Goal**: Verify strict constitutional boundary enforcement (Principle IV) across the entire application.

**Independent Test**: Run static analysis grep asserting zero direct imports of `@/services/models/*` across `src/modules/` and `src/components/`, followed by clean TypeScript compilation and lint checks.

### Implementation for User Story 4

- [x] T017 [US4] Execute static analysis grep verification ensuring zero occurrences of `from ['"].*services/models` in `src/modules/` and `src/components/`
- [x] T018 [US4] Execute TypeScript strict compilation (`npm run build`) ensuring zero type errors
- [x] T019 [US4] Execute ESLint validation (`npm run lint`) ensuring zero architectural boundary warnings

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation synchronization and quickstart scenario validation.

- [x] T020 [P] Execute all verification scenarios in `specs/003-mandatory-adapter-pattern-implementation/quickstart.md`
- [x] T021 Synchronize constitutional compliance notes in `.specify/memory/constitution.md` for Principle IV

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all User Stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2; independent MVP increment.
- **User Story 2 (Phase 4)**: Depends on Phase 2; runs in parallel or sequentially after US1.
- **User Story 3 (Phase 5)**: Depends on Phase 2; runs in parallel or sequentially after US2.
- **User Story 4 (Phase 6)**: Depends on completion of all User Stories (US1, US2, US3).
- **Polish (Phase 7)**: Final verification step.

---

## Parallel Opportunities

```bash
# Phase 1 Parallel Setup
Task T002: "Create presentation date formatting utility in src/utils/dateUtils.ts"
Task T003: "Create presentation pipeline metric parsing utility in src/utils/metricUtils.ts"

# Phase 2 Parallel Adapters
Task T005: "Implement pure boundary transformations in src/adapters/experimentAdapter.ts"
Task T006: "Implement pure boundary transformations in src/adapters/pathwayAdapter.ts"

# Phase 4 Parallel View Refactoring
Task T011: "Refactor ExperimentExecution.tsx in src/modules/dashboard/experiments/"
Task T012: "Refactor CreateExperiment.tsx in src/modules/dashboard/experiments/"
Task T013: "Refactor UpdateBiologicalObjects.tsx in src/modules/dashboard/experiments/"
Task T014: "Refactor UpdateAlignedObjects.tsx in src/modules/dashboard/experiments/"
Task T015: "Refactor ConfigureInferences.tsx in src/modules/dashboard/experiments/"
```

---

## Implementation Strategy

### MVP Scope (User Story 1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational Adapters).
2. Complete Phase 3 (User Story 1): Network adapter mediation, `networkService.ts` encapsulation, and `Network.tsx` / `CreateNetwork.tsx` refactoring.
3. Validate User Story 1 independently.

### Incremental Delivery

1. Foundation + US1 → Network MVP delivered.
2. US2 added → Full experiment and biological curation pipeline mediated.
3. US3 added → Pathway graph visualizer decoupled.
4. US4 added → Architectural boundaries locked and certified.
