# Feature Specification: Pure Domain Models Consolidation

**Feature Branch**: `feature/02-domain-models-consolidation`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "speckit-specify basado en /home/yacson/Proyectos/biopatternsg-ms/SDD/UI/02-domain-models-consolidation"

## Clarifications

### Session 2026-11-18

- Q: ¿Cómo deben representarse los timestamps (ej. `createdAt`) dentro de las entidades puras de dominio (`src/domain/models/Network.ts`, `Experiment.ts`) frente a los números epoch devueltos por el backend? → A: Normalizar a string ISO 8601 (`string`) en los modelos de dominio; los adaptadores transforman los timestamps numéricos del backend a strings ISO estandarizados para consistencia y serializabilidad.
- Q: ¿Cómo deben renombrarse las interfaces de transporte en `src/services/models/` para evitar colisiones de nombres con los modelos de dominio puros en `src/domain/models/`? → A: Aplicar un sufijo explícito `Dto` (ej. `NetworkDto`, `ExperimentDto`, `PathwayDto`) a las interfaces de transporte en `src/services/models/`, distinguiéndolas claramente de los modelos de dominio puros.
- Q: ¿Dónde y cómo deben declararse los estados de interfaz de usuario transitorios (como `isModified: boolean`, `status: "MODIFIED" | "NEW"`, o iconos de Lucide) requeridos en pantallas de edición? → A: Mantener `src/domain/models/` 100% puro y agnóstico a la UI (Principio III), y declarar contratos de vista (View Contracts) locales en el módulo o componente que extiendan las entidades puras de dominio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized & Type-Safe Biological Domain Modeling (Priority: P1)

As a biological researcher and frontend developer, I want all core domain models (Networks, Experiments, Pipelines, Biological Objects, Pathways, and Knowledge Graphs) to be centralized, pure, and decoupled from backend DTO wire representations, so that inspecting entities, navigating analysis results, and executing pipelines is consistent and immune to backend wire changes.

**Why this priority**: Business domain integrity is the architectural foundation of BioPatternSG UI. Having fragmented domain definitions across services and components creates tight coupling, runtime transformation bugs, and maintenance bottlenecks.

**Independent Test**: Can be tested independently by creating and querying networks and experiment entities using only pure domain models in `src/domain/models/`, verifying that data shapes remain strictly decoupled from network transport schemas.

**Acceptance Scenarios**:

1. **Given** network and experiment datasets returned from the API, **When** domain models are instantiated or consumed by application modules, **Then** all entities conform strictly to pure domain interfaces without referencing HTTP status, wire DTO metadata, or framework specifics.
2. **Given** biological entity structures across `src/domain/models/`, **When** inspected during build and lint verification, **Then** zero files in `src/domain/` contain imports from UI libraries, React, Lucide icons, components, or services.

---

### User Story 2 - Resilient Biological Object Editing & Pipeline Step Navigation (Priority: P2)

As a researcher configuring experiments in the dashboard, I want to edit aligned biological objects, update biological roles, and view manual execution steps with dedicated UI view contracts that wrap clean domain entities, without inline domain declarations scattered across page views.

**Why this priority**: Experiment configuration views (`UpdateAlignedObjects`, `UpdateBiologicalObjects`, `ExperimentExecution`) require user-driven state changes (modifications, custom synonyms, action routing). Separating pure domain data from UI view states ensures clean state management and component reusability.

**Independent Test**: Can be tested independently by navigating to the aligned objects and biological objects update screens, applying search filters, toggling modifications, and saving changes without reliance on inline entity declarations.

**Acceptance Scenarios**:

1. **Given** the aligned objects management view, **When** a researcher modifies synonyms or changes alignment status, **Then** the view state tracks modifications seamlessly using domain types imported exclusively from `@/domain/models/Experiment`.
2. **Given** manual execution pipeline steps in the experiment dashboard, **When** action steps are rendered, **Then** step action metadata (route segment, button labels) originates from domain definitions, while presentational properties (such as Lucide icon components) are composed exclusively in the UI layer.

---

### User Story 3 - Unified Domain Pagination & Knowledge Base Collections (Priority: P3)

As an analyst querying biological collections, pathways, and network catalogs, I want standardized pagination and query metadata across all domain models, so that table views, result summaries, and exploration canvases exhibit consistent pagination mechanics.

**Why this priority**: `PaginatedResponse` is currently declared ad-hoc inside service files. Unifying domain pagination primitives ensures consistent pagination semantics across all domain entities.

**Independent Test**: Can be tested independently by requesting paginated collections of networks and pathways, verifying that domain collection wrappers provide standard count, items, and navigation attributes.

**Acceptance Scenarios**:

1. **Given** a paginated query for biological networks, **When** data is delivered to domain consumers, **Then** results conform to the standardized `PaginatedResult<T>` domain primitive.
2. **Given** pathway and graph exploration views, **When** paginated entity chunks are loaded, **Then** collection metadata provides uniform pagination attributes across all modules.

---

### User Story 4 - Strict Service Boundary & DTO Decoupling (Priority: P4)

As a frontend architect and maintainer, I want backend transport contracts (DTOs) in `src/services/models/` to be clearly distinguished from pure domain models in `src/domain/models/`, with adapters mediating all boundary transformations, so that backend API schema changes do not ripple through UI components.

**Why this priority**: Prevents regression against Principle III and Principle IV of the BioPatternSG UI Constitution, guaranteeing long-term system stability.

**Independent Test**: Can be tested independently by running automated boundary checks and static analysis verifying zero inline domain models in services and modules.

**Acceptance Scenarios**:

1. **Given** the `src/services/` directory, **When** static analysis is performed, **Then** service files define or import transport DTOs (with explicit `Dto` suffix) and do not declare inline business entities.
2. **Given** `npm run build` and `npm run lint`, **When** executed on the codebase, **Then** all files compile with zero type errors and zero boundary rule violations.

---

### Edge Cases

- What happens when backend API returns unexpected null or omitted values for domain timestamps or nested arrays?
  Adapters must normalize missing fields into default domain representations (e.g., empty arrays or fallback timestamps) before entities enter domain consumers.
- How does the system handle complex UI-only flags (e.g. `isModified`, temporary form validation errors) when editing biological objects?
  UI view models must compose the pure domain model with presentation flags, ensuring that domain model contracts remain untouched by temporary UI states.
- How are circular references avoided between `Experiment`, `Network`, and `Pathway` domain models?
  Domain models must reference related entities by primitive identifiers (e.g., `networkId: string`) rather than deep recursive entity imports.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST consolidate all core business domain models under `src/domain/models/`, specifically: `Common.ts` (shared pagination and generic domain primitives), `Network.ts` (pure network entities), `Experiment.ts` (experiments, pipelines, biological objects, aligned objects, and step definitions), `Pathway.ts` (pathway entities and knowledge base events), and `Graph.ts` (graph nodes, links, and force-directed data).
- **FR-002**: All models in `src/domain/models/` MUST be pure TypeScript declarations and MUST NOT import from `react`, `lucide-react`, `src/components/`, `src/modules/`, `src/services/`, or `src/adapters/`.
- **FR-003**: System domain timestamps (such as creation dates) MUST be normalized to standard ISO 8601 strings (`string`) in domain entities, with adapters transforming raw numeric epoch timestamps from backend DTOs.
- **FR-004**: Backend wire transport interfaces in `src/services/models/` and service files MUST be systematically named with a `Dto` suffix (e.g., `NetworkDto`, `ExperimentDto`, `PathwayDto`, `PaginatedResponseDto<T>`), explicitly distinguishing them from pure domain models.
- **FR-005**: All inline business entity interfaces declared in `src/modules/dashboard/experiments/` (`AlignedObjectItem`, `EditableBiologicalObject`, `ManualStepDefinition`, `ParsedMetricItem`, `RawMetricInput`) MUST be replaced with pure domain imports from `@/domain/models/Experiment` or dedicated localized UI view contracts (e.g., extending domain entities with UI-only flags like `isModified` and `LucideIcon`).
- **FR-006**: Service implementation files (specifically `src/services/networkService.ts`) MUST NOT define business domain entities inline, moving `Network` to `src/domain/models/Network.ts` and `PaginatedResponse<T>` to `src/domain/models/Common.ts` (as `PaginatedResult<T>`).
- **FR-007**: Presentational components and UI views MUST NOT consume raw backend transport DTOs directly when interacting with biological networks, experiments, and pathways; all data crossing the boundary MUST be mediated by domain models and adapters.
- **FR-008**: Build and lint quality gates (`npm run build` and `npm run lint`) MUST pass with zero TypeScript errors and zero linter warnings.

### Key Entities

- **Common (`src/domain/models/Common.ts`)**: Generic domain primitives, including `PaginatedResult<T>` containing `count` and item `list`, and common biological identifier types.
- **Network (`src/domain/models/Network.ts`)**: Pure biological network entity, including unique identifier, owner identifier, name, description, and normalized ISO 8601 timestamp metadata.
- **Experiment (`src/domain/models/Experiment.ts`)**: Pure experiment definition, pipeline status, inference results, biological objects (`BiologicalObjectItem`), aligned objects (`AlignedObjectItem`), experiment execution metrics, and manual step metadata.
- **Pathway (`src/domain/models/Pathway.ts`)**: Pure biological pathway entity, grouped pathway collections, and knowledge base relationship events.
- **Graph (`src/domain/models/Graph.ts`)**: Visual network graph domain structures, including nodes, directed links, input payloads, and force-directed graph datasets.
- **Auth & User (`src/domain/models/Auth.ts`, `User.ts`)**: Existing pure domain representations for user credentials, tokens, session claims, and user profiles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of core business entities (`Network`, `Experiment`, `Pathway`, `Graph`, `BiologicalObject`, `AlignedObject`, `PaginatedResult`) reside exclusively in `src/domain/models/`.
- **SC-002**: Zero files in `src/domain/` contain imports referencing external libraries (React, Lucide, DOM APIs) or other application architectural layers (`services`, `adapters`, `components`, `modules`).
- **SC-003**: Zero business entity interfaces are declared inline inside `src/modules/**/*.tsx` or `src/services/*.ts`.
- **SC-004**: Service transport schemas (`src/services/models/`) and domain entities (`src/domain/models/`) are cleanly decoupled and mediated by adapters in `src/adapters/`.
- **SC-005**: Static type verification (`npm run build`) and linting (`npm run lint`) complete successfully with 0 errors across the entire codebase.

## Assumptions

- Backend REST API endpoints and payload schemas remain unmodified; this feature is strictly an internal frontend architectural consolidation.
- Existing user authentication and authorization logic (`Auth.ts`, `User.ts`) remains compatible with the consolidated domain models structure.
- Localized UI view state (such as temporary form dirty flags and Lucide icon associations) will be handled in presentational layers or UI view contracts, keeping domain models completely pure.
- All modern browsers supporting ECMAScript 2022+ will be supported without additional polyfills.
