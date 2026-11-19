# Feature Specification: Mandatory Adapter Pattern Implementation

**Feature Branch**: `feature/03-mandatory-adapter-pattern-implementation`

**Created**: 2026-11-19

**Status**: Ready for Planning

**Input**: User description: "speckit-specify basado en /home/yacson/Proyectos/biopatternsg-ms/SDD/UI/03-mandatory-adapter-pattern-implementation"

## Clarifications

### Session 2026-11-19

- Q: ¿Debería cada adaptador en `src/adapters/` ofrecer tanto exportaciones nombradas individuales como un objeto consolidado de espacio de nombres (*namespace*)? → A: Exportación dual: exportar tanto funciones nombradas individuales (ej. `toNetworkDomain`) como el objeto consolidado del adaptador (ej. `networkAdapter`).
- Q: ¿Deberían las funciones de formateo de presentación específicas de cada entidad (como el formateo de fecha o el parseo de métricas) residir directamente dentro de sus adaptadores respectivos o en utilidades generales en `src/utils/`? → A: Separar en `src/utils/`: los adaptadores se enfocan estrictamente en la transformación bidireccional DTO / Dominio / Payload (Principio IV), mientras que las funciones de formateo visual y parseo de presentación residen en `src/utils/`.
- Q: ¿Deberían los métodos de los servicios (`networkService.ts`, `experimentService.ts`) integrar internamente los adaptadores para retornar directamente modelos puros de dominio a las vistas, o deben las vistas recibir DTOs e invocar manualmente el adaptador? → A: Los servicios encapsulan la adaptación: los métodos de la capa de servicios integran los adaptadores y entregan directamente modelos de dominio a las vistas y componentes, blindando a la interfaz de usuario de los DTOs de red.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type-Safe Network Boundary Mediation (Priority: P1) 🎯 MVP

As a clinical researcher managing biological networks, I want network creation and network listing data to be mediated through a dedicated `networkAdapter`, so that timestamp normalization and network registration payload mapping happen cleanly at the boundary without UI components handling raw serialization or ad-hoc timestamp math.

**Why this priority**: Network management is the entry point for all downstream experiment workflows. Decoupling network views from backend transport representations establishes a solid architectural foundation and eliminates runtime date rendering errors.

**Independent Test**: Can be tested independently by creating and querying gene regulatory networks in the dashboard, verifying that network list dates display properly formatted and new networks register without UI views manipulating raw DTOs.

**Acceptance Scenarios**:

1. **Given** a network list returned from the backend service, **When** rendered in the networks dashboard (`Network.tsx`), **Then** data is mediated through `networkAdapter`, displaying properly formatted dates (`DD/MM/YYYY`) without component-level epoch arithmetic.
2. **Given** a user submitting the network registration form (`CreateNetwork.tsx`), **When** the creation request is dispatched, **Then** form input values are sanitized and transformed into the backend payload via `networkAdapter.toCreateNetworkPayload`.

---

### User Story 2 - Comprehensive Experiment & Pipeline Boundary Mediation (Priority: P1)

As a researcher running bio-reasoning experiments and inspecting execution pipelines, I want all experiment lifecycle operations (experiment creation, pipeline step monitoring, biological object curation, aligned objects review, and inference configuration) to be mediated through `experimentAdapter`, so that pipeline execution metrics and payload structures are decoupled from backend wire quirks.

**Why this priority**: Experiment execution and configuration involve multiple manual steps (biological roles, aligned objects, inference parameters). Having UI views directly ingest raw backend DTOs creates breaking changes whenever backend contracts evolve.

**Independent Test**: Can be tested independently by loading an experiment execution pipeline, editing biological roles and aligned objects, and configuring inferences, verifying that all data displays clearly and saves successfully without view-level DTO transformations.

**Acceptance Scenarios**:

1. **Given** pipeline step execution metrics in `ExperimentExecution.tsx`, **When** displayed within step execution cards, **Then** metric parsing and human-readable label formatting are executed by `experimentAdapter.parseExperimentMetrics`, with zero inline metric parsing logic in the view component.
2. **Given** a user creating or updating an experiment in `CreateExperiment.tsx`, **When** transitioning between configuration steps, **Then** all API responses and configuration payloads are mediated by `experimentAdapter`.
3. **Given** biological objects and aligned objects management views (`UpdateBiologicalObjects.tsx`, `UpdateAlignedObjects.tsx`, `SelectClosingObjects.tsx`), **When** saved by the researcher, **Then** outgoing updates map cleanly to API payloads via `experimentAdapter`.

---

### User Story 3 - High-Fidelity Pathway Graph Adaptation (Priority: P1)

As a researcher visualizing biological pathways in 2D force-directed graphs, I want pathway graph responses from backend inference microservices to be adapted into graph visualization models by `pathwayAdapter`, so that `PathwayGraphView.tsx` does not perform inline node filtering, role labeling, or edge sanitization.

**Why this priority**: Complex graph visualizations depend on stable node and edge structures. Isolating raw pathway graph payloads behind `pathwayAdapter` ensures robust rendering and prevents graph crashes due to missing or unformatted node roles.

**Independent Test**: Can be tested independently by navigating to the pathway graph visualization for an experiment, verifying that nodes, edges, and biological roles render accurately on the force graph canvas.

**Acceptance Scenarios**:

1. **Given** pathway graph data fetched for an experiment, **When** received in `PathwayGraphView.tsx`, **Then** node extraction, biological role normalization, and edge validation are processed by `pathwayAdapter.toPathwayGraphForceData`.
2. **Given** grouped pathway query results, **When** rendered in `PathwayListView.tsx` and `PathwayDetailModal.tsx`, **Then** all models consumed are pure domain models mediated by `pathwayAdapter`.

---

### User Story 4 - Zero Service Model Leakage & Architecture Boundary Enforcement (Priority: P2)

As a software architect, I want zero direct imports of backend models (`@/services/models/*`) across any view in `src/modules/` or `src/components/`, so that architectural boundaries (Principle IV) are strictly preserved and verified by automated static analysis.

**Why this priority**: Complete boundary decoupling ensures long-term maintainability, prevents accidental coupling, and guarantees compliance with the BioPatternSG UI Constitution.

**Independent Test**: Can be tested independently by executing static analysis checks across `src/modules/` and `src/components/`, verifying 0 occurrences of imports from `services/models`.

**Acceptance Scenarios**:

1. **Given** all view modules and UI components in the codebase, **When** scanning for imports matching `from ["']@?/services/models/.*["']`, **Then** the match count is strictly 0.
2. **Given** the complete build pipeline, **When** running `npm run build` and `npm run lint`, **Then** the application compiles cleanly without errors.

---

### Edge Cases

- How does the system handle networks or experiments with missing or null creation dates?
  - The adapter falls back gracefully to standard defaults (`Date.now()` or undefined) without throwing runtime exceptions.
- How does `parseExperimentMetrics` handle unexpected metric formats (e.g. empty values, non-string primitives, nested dictionaries)?
  - It safely converts keys and values to strings, filters out null/undefined entries, and applies uppercase formatting to unknown keys.
- How does the pathway graph adapter handle disconnected edges or nodes with missing names?
  - It filters out nodes without valid names and removes links that reference nonexistent nodes to prevent visualization canvas crashes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide dedicated adapters in `src/adapters/` (`authAdapter.ts`, `userAdapter.ts`, `networkAdapter.ts`, `experimentAdapter.ts`, `pathwayAdapter.ts`) mediating all external backend DTOs.
- **FR-002**: `networkAdapter.ts` MUST implement `toNetworkDomain`, `toPaginatedNetworksDomain`, and `toCreateNetworkPayload`.
- **FR-003**: `experimentAdapter.ts` MUST implement `toExperimentDomain`, `toPipelineStatus`, `toBiologicalObjectDomain`, `toAlignedObjectDomain`, `toInferenceRolesDomain`, `toBiologicalRoleList`, `toCreateExperimentPayload`, `toSaveBiologicalRolesPayload`, `toSaveAlignedObjectsPayload`, and `toInferenceConfigPayload`.
- **FR-004**: `pathwayAdapter.ts` MUST implement `toGroupedPathway`, `toGroupedPathwayList`, `toPathwayGraphNode`, `toPathwayGraphEdge`, `toBiologicalPathway`, `toGroupedPathwaysResult`, and `toPathwayGraphForceData`.
- **FR-005**: All UI modules in `src/modules/dashboard/networks/` and `src/modules/dashboard/experiments/` MUST consume pure domain models and delegate all wire transformations to adapters.
- **FR-006**: View components MUST NOT perform inline date arithmetic, raw metric parsing, or raw graph node/link transformations.
- **FR-007**: Zero files in `src/modules/` or `src/components/` MUST import directly from `@/services/models/*`.
- **FR-008**: All adapters in `src/adapters/` MUST support dual exports: individual named pure transformation functions and a consolidated namespace object export.
- **FR-009**: Pure presentation formatting utilities (such as date display formatting and view metric parsing) MUST reside in `src/utils/` (e.g. `src/utils/dateUtils.ts`, `src/utils/metricUtils.ts`), keeping adapters strictly focused on boundary transformation between DTOs, Domain models, and API payloads.
- **FR-010**: Service methods in `src/services/` MUST encapsulate boundary adaptation by default, invoking corresponding adapters to accept domain/form inputs and return pure domain models to caller views.

### Key Entities

- **Network**: Pure domain model representing a gene regulatory network, with normalized ISO createdAt timestamp.
- **Experiment & PipelineExecution**: Pure domain model representing an experiment, its configuration hyperparameters, and pipeline execution step metrics.
- **BiologicalObject & AlignedObject**: Domain models representing biological entities, curated roles (Biotypes, MeSH), and synonym alignment status.
- **Pathway & PathwayGraph**: Domain models representing inferred biological pathways, reaction sequences, and force-directed graph node/link structures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero files in `src/modules/` or `src/components/` import from `@/services/models/*` (verified by automated static analysis).
- **SC-002**: 100% of inline DTO transformations (dates, metrics, graph structures) are removed from views and centralized in adapters.
- **SC-003**: All network, experiment, and pathway workflows function identically end-to-end without visual or behavioral regression.
- **SC-004**: Full application passes static type check (`npm run build`) and linter (`npm run lint`) with 0 errors.

## Assumptions

- Backend REST API contracts and KrakenD API Gateway response structures remain unchanged; adapters absorb all transformations.
- Existing pure domain models in `src/domain/models/` remain the single source of truth for domain types.
- Browser local storage handling remains centralized in `tokenStorage.ts`.
- The user interface is a desktop-optimized responsive single-page application.
