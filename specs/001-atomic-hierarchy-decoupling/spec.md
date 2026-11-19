# Feature Specification: Atomic Design Hierarchy Decoupling

**Feature Branch**: `feature/01-atomic-design-hierarchy-decoupling`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "speckit-specify basado en /home/yacson/Proyectos/biopatternsg-ms/SDD/UI/01-atomic-design-hierarchy-decoupling"

## Clarifications

### Session 2026-11-18

- Q: ¿Debe el componente `Breadcrumb` trasladarse a `src/components/molecules/Breadcrumb.tsx` para reutilizar el átomo `Button`, o debe permanecer en `src/components/atoms/` utilizando elementos HTML nativos? → A: Mover a `src/components/molecules/Breadcrumb.tsx`, componiendo el átomo `Button` con un callback `onNavigate?: (href: string) => void`.
- Q: ¿Cómo debe orquestarse la obtención de datos (`experimentService`) extraída de `BiologicalRolesModal` para suministrar las props de presentación al modal? → A: Encapsular la lógica en un custom hook dedicado (ej. `useBiologicalRoles`) que exponga `rolesData`, `isLoading`, `error` y el disparador de carga.
- Q: Al reubicar los tipos de grafo en `src/domain/models/Graph.ts` y los perfiles visuales en `src/config/forceGraphProfiles.ts`, ¿deben mantenerse re-exportaciones marcadas como `@deprecated` en la ruta anterior (`@/components/organisms/forceGraph/`) para asegurar compatibilidad regresiva? → A: Eliminar completamente las exportaciones de la ruta anterior, forzando la actualización inmediata y estricta en todo el repositorio.
- Q: ¿Cómo deben estructurarse los nuevos modelos de dominio en `src/domain/models/` para reemplazar las importaciones de DTOs de servicio (`services/models/`) en `PathwayDetailModal` y `PipelineStatus`? → A: Crear `src/domain/models/Pathway.ts` y `src/domain/models/Experiment.ts` independientes junto con adaptadores en `src/adapters/` para mediar las respuestas de API.
- Q: ¿Cómo debe verificarse y asegurarse de forma continua que no se reintroduzcan violaciones de fronteras en la jerarquía Atomic Design en futuros desarrollos? → A: Configurar reglas estrictas en ESLint (`no-restricted-imports`) para rechazar importaciones no permitidas en `src/components/atoms/`, `molecules/` y `organisms/` durante `npm run lint` / CI.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless & High-Performance Clinical Graph Visualization (Priority: P1)

As a biological researcher analyzing disease mechanisms, I want to explore network graphs, upload custom graph datasets, view biological node details, and inspect biological roles without visual freezes, state corruption, or circular dependency crashes, across all supported clinical contrast modes.

**Why this priority**: Graph visualization and biological entity inspection represent the core functional value of BioPatternSG UI. Ensuring reliable, decoupling-safe rendering across themes and modal interactions directly impacts clinical analysis fidelity.

**Independent Test**: Can be fully tested by loading sample network graph data, switching visual contrast modes (Dark, Light, Sky Blue), opening the biological roles modal, and querying node details. The entire workflow operates smoothly without console errors or UI stalls.

**Acceptance Scenarios**:

1. **Given** a loaded biological network graph on the canvas, **When** the researcher selects a node and opens the biological roles panel, **Then** the dialog displays the biological roles and inference metrics with appropriate loading states while the canvas remains responsive.
2. **Given** an open graph visualization view, **When** the researcher toggles between contrast themes, **Then** all graph nodes, links, and background palettes update cleanly without resetting the canvas zoom or losing selection state.
3. **Given** the graph data upload modal, **When** the user provides a dataset file, **Then** the component validates the input and notifies parent workflows of the completed upload without depending on internal organism-level definitions.

---

### User Story 2 - Decoupled User Authentication & Session Controls (Priority: P2)

As an authenticated user or administrator, I want to access landing authentication and manage my session through the navigation header with clear visual feedback, while ensuring presentational components do not directly trigger network calls or lock into global context.

**Why this priority**: Authentication and session management are vital security gates. Decoupling landing hero and user menu components allows them to remain reusable and testable in isolation across different portal views.

**Independent Test**: Can be tested independently by rendering the landing login form and navigation top bar with mock properties and verifying that submitting credentials or clicking logout dispatches the expected callbacks to parent views.

**Acceptance Scenarios**:

1. **Given** a visitor on the public landing page, **When** they fill in login credentials and submit the form, **Then** the presentation component triggers the login callback, reflects the processing state, and hands control over to the authentication orchestrator.
2. **Given** an authenticated user session, **When** the user opens the user menu in the application header and selects logout, **Then** the component triggers the logout action callback and cleans up local open menu state.

---

### User Story 3 - Predictable Step & Breadcrumb Navigation (Priority: P3)

As a researcher progressing through multi-step experiment workflows, I want clear breadcrumbs and step headers that reliably indicate progress and execute navigation callbacks without unexpected routing side-effects.

**Why this priority**: Navigating between sequential pipeline stages requires consistent navigation triggers. Decoupling breadcrumbs and headers from direct router bindings enables flexible reuse across embedded workflows and standalone views.

**Independent Test**: Can be tested by embedding the breadcrumb and manual step header into a test harness, clicking step links and back buttons, and verifying that navigation events fire with the correct target identifiers.

**Acceptance Scenarios**:

1. **Given** a researcher navigating within a pipeline step, **When** they click the back action in the step header, **Then** the step header delegates the back event to the parent container callback.
2. **Given** a breadcrumb trail displayed on a page, **When** a user clicks on an active parent link, **Then** the breadcrumb notifies the navigation coordinator of the selected target path.

---

### User Story 4 - Modular Component Composition for UI Authors (Priority: P4)

As a frontend software engineer extending the design system, I need visual building blocks (Atoms, Molecules, and Organisms) to have strict unidirectional dependencies and clean callback interfaces, so that I can assemble new features rapidly without introducing circular imports or hidden service side-effects.

**Why this priority**: High internal architectural quality and adherence to strict Atomic Design boundaries prevents technical debt accumulation, accelerates new screen development, and maintains long-term maintainability.

**Independent Test**: Can be tested by running architectural dependency checks and automated unit/render tests across all design system components in complete isolation from backend services.

**Acceptance Scenarios**:

1. **Given** any component in the design system, **When** its import graph is analyzed, **Then** it must not contain inverted dependencies (Atoms or Molecules importing Organisms, or presentational components directly importing concrete network services).
2. **Given** any modified or refactored component, **When** component documentation is inspected, **Then** its properties, behavior, and design hierarchy tier are accurately documented in the component catalog.

---

### Edge Cases

- **Asynchronous Service Latency / Failure**: When background data fetching takes longer than expected or encounters an error, presentational components (e.g., biological role modals) must display clear loading indicators or descriptive error feedback provided by parent coordinators.
- **Empty or Incomplete Datasets**: When graph data contains zero nodes or empty link sets, canvas and upload components must render a clean empty state without throwing runtime exceptions.
- **Rapid Navigation / Premature Unmount**: When a user navigates away while animations or network requests are pending, presentational components must cleanly tear down visual observers and event handlers without memory leaks.
- **Viewport Dimension Boundaries**: When rendered on constrained displays or mobile breakpoints, navigation controls and breadcrumbs must truncate or collapse gracefully without overflowing container bounds.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Visual components in lower architectural levels (Atoms and Molecules) MUST NOT depend on or import from higher architectural levels (Organisms).
- **FR-002**: Visual building blocks (Atoms, Molecules, and Organisms) MUST NOT directly instantiate or execute backend communication services or API clients.
- **FR-003**: Domain entities and visualization configurations (including graph structures, pathway models, experiment pipeline states, and visual contrast palettes) MUST reside in centralized domain modeling (`src/domain/models/Graph.ts`, `src/domain/models/Pathway.ts`, `src/domain/models/Experiment.ts`) and configuration (`src/config/forceGraphProfiles.ts`) modules accessible to all design tiers. Legacy export locations under `src/components/organisms/forceGraph/` for shared types and profiles MUST be completely removed, enforcing direct imports from canonical domain and config paths. External backend DTOs MUST be transformed to domain models via dedicated adapters in `src/adapters/` before reaching presentational components.
- **FR-004**: Presentational components displaying dynamic or remote data (such as biological roles and pathway summaries) MUST receive their data payload, loading state, and error information exclusively via input properties. The remote data fetching extracted from `BiologicalRolesModal` MUST be encapsulated within a dedicated custom hook (e.g., `useBiologicalRoles`) consumed by parent orchestration views.
- **FR-005**: User interface actions requiring navigation or session mutation (such as back buttons, breadcrumb clicks, and user logouts) MUST dispatch callbacks to parent coordinators rather than directly binding to global routing or authentication singletons. Specifically, `Breadcrumb` MUST be relocated to a Molecule (`src/components/molecules/Breadcrumb.tsx`) composing the `Button` atom and delegating navigation via `onNavigate?: (href: string) => void`.
- **FR-006**: Authentication landing components MUST receive submission handlers and submission states from their enclosing feature module rather than orchestrating API requests internally.
- **FR-007**: Every component modified or decoupled in this initiative MUST have its architectural specification and property documentation synchronized in the design system catalog.
- **FR-008**: Existing visual styling, theme contrast profiles, and user-facing workflows MUST remain functionally and visually identical to their pre-refactored state.
- **FR-009**: The repository build and lint configuration MUST enforce Atomic Design boundaries via strict automated linting rules (`no-restricted-imports`), preventing atoms and molecules from importing prohibited layers or services during lint and CI checks.

### Key Entities

- **Biological Graph Model**: Represents the clinical network structure, including entity nodes (genes, proteins, chemicals, diseases) and biological relationship links with associated metadata.
- **Visual Contrast Profile**: Defines visual rendering rules and color palettes for graph elements across clinical contrast modes (Dark, Light, Clinical Blue).
- **User Presentation Identity**: Encapsulates user display properties (initials, full name, email) passed to navigational components for display and interaction.
- **Navigation Breadcrumb & Step Item**: Represents an individual item in a navigational hierarchy or workflow progression, defining its display label, active status, and target path/identifier.
- **Pathway Domain Model**: Pure domain representation of biological pathways and grouped pathway metrics, decoupled from backend DTOs.
- **Experiment & Pipeline Domain Model**: Pure domain representations of experiment status, execution stages, and pipeline progress indicators.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of UI components under atomic and molecular directories operate without dependencies on higher-level components or direct backend network services, verified by automated ESLint boundary enforcement (`npm run lint`).
- **SC-002**: Zero circular dependencies exist across the entire UI codebase.
- **SC-003**: 100% of existing user workflows (landing authentication, experiment inspection, force graph exploration, pipeline step tracking) continue to function identically with zero visual regressions.
- **SC-004**: Component catalog and architectural documentation in the repository is 100% synchronized with the updated component properties and contracts.
- **SC-005**: Full application build and type checking completes with 0 errors.

## Assumptions

- Target environment is modern evergreen web browsers supporting HTML5 Canvas and CSS variables.
- Feature modules under `src/modules/` retain responsibility for orchestrating data fetching, business logic, and routing navigation, passing data down to components.
- No visual redesign or changes to styling tokens/themes are introduced; the scope is strictly architectural hierarchy decoupling and component purification.
- Existing routing table definitions remain unchanged; only component-internal navigation triggers are converted to callback props.
