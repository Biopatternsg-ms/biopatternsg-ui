# Implementation Plan: Mandatory Adapter Pattern Implementation

**Branch**: `feature/03-mandatory-adapter-pattern-implementation` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-mandatory-adapter-pattern-implementation/spec.md`

## Summary

Enforce and complete Principle IV (*Mandatory Adapter Pattern*) across BioPatternSG UI. Establish dedicated bidirectional adapters in `src/adapters/` (`authAdapter.ts`, `userAdapter.ts`, `networkAdapter.ts`, `experimentAdapter.ts`, `pathwayAdapter.ts`) supporting dual exports (named functions and consolidated namespace objects). Encapsulate boundary adaptation within `src/services/` so that services return pure domain models, and delegate presentation formatting (such as date display and view metric parsing) to `src/utils/`. Eliminate all direct imports of `@/services/models/*` across `src/modules/` and `src/components/`, ensuring 100% compliance with architectural boundaries.

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 22+, React 19.2 (Vite SPA)  
**Primary Dependencies**: React 19, Tailwind CSS 3.4, Radix UI primitives, Lucide React, Zod 4  
**Storage**: In-memory React state, `tokenStorage.ts` (JWT lifecycle in browser storage)  
**Testing**: TypeScript strict compilation (`npm run build`), ESLint (`npm run lint`), Grep-based static analysis boundary checks  
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page Web application frontend (Vite SPA)  
**Performance Goals**: Instant static type resolution, zero runtime object conversion overhead, zero circular dependency deadlocks  
**Constraints**:
- Strict compliance with Principle IV (*Mandatory Adapter Pattern*) and Principle III (*Pure Domain Modeling*).
- Zero direct imports of `@/services/models/*` in `src/modules/` and `src/components/`.
- Dual exports required on all adapters (individual pure mappers + consolidated namespace object).
- Pure presentation formatting utilities isolated in `src/utils/` rather than polluting adapters.
- Service layer methods encapsulate adaptation, returning pure domain models directly to views.
- Zero modification of backend REST API contracts or external payloads.

**Scale/Scope**: 5 dedicated adapters in `src/adapters/`, 2 updated service facades (`networkService.ts`, `experimentService.ts`), 2 utility modules (`dateUtils.ts`, `metricUtils.ts`), 6 refactored dashboard views in `dashboard/networks` and `dashboard/experiments`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation & Evidence |
|:---|:---:|:---|
| **I. Strict Atomic Design Hierarchy** | **PASS** | UI components remain organized in atoms, molecules, and organisms. Adapters mediate data, leaving presentational components purely declarative. |
| **II. Continuous Documentation Synchronization** | **PASS** | Any component prop modifications will update `.agents/components/` files and README. |
| **III. Pure Domain Modeling in `domain/models/`** | **PASS** | Domain entities in `src/domain/models/` remain purely declarative TypeScript interfaces without transport or UI concerns. |
| **IV. Mandatory Adapter Pattern** | **PASS** | Core focus. All boundaries between `src/services/models/` and `src/domain/models/` / UI views are mediated by `src/adapters/`. |
| **V. Encapsulated Service Layer & Centralized HTTP** | **PASS** | Network communication remains in `src/services/` using `authFetch`. Service layer encapsulates adapter transformations by default. |
| **VI. Declarative, Type-Safe Forms** | **PASS** | Form payloads derive from Zod schemas and are converted to API payloads via adapter mappers (e.g. `toCreateNetworkPayload`). |
| **VII. Robust Security & RBAC** | **PASS** | Auth and user adapters remain intact and aligned with route guards. |

## Project Structure

### Documentation (this feature)

```text
specs/003-mandatory-adapter-pattern-implementation/
├── plan.md              # This implementation plan
├── spec.md              # Feature specification with recorded clarifications
├── research.md          # Architectural research & decisions (Phase 0)
├── data-model.md        # Adapter mapping signatures and contracts (Phase 1)
├── quickstart.md        # Verification and quality gate guide (Phase 1)
├── checklists/
│   └── requirements.md  # Specification quality checklist
├── contracts/           # Interface contracts (Phase 1)
│   ├── network-adapter-contract.md
│   ├── experiment-adapter-contract.md
│   └── pathway-adapter-contract.md
└── tasks.md             # Execution task list (Phase 2)
```

### Source Code Layout

```text
src/
├── adapters/
│   ├── authAdapter.ts          # Authentication boundary adapter
│   ├── userAdapter.ts          # User management boundary adapter
│   ├── networkAdapter.ts       # Network DTO/Domain/Payload adapter (dual export)
│   ├── experimentAdapter.ts    # Experiment & Pipeline DTO/Domain adapter (dual export)
│   └── pathwayAdapter.ts       # Pathway & ForceGraphData adapter (dual export)
├── domain/
│   └── models/
│       ├── Common.ts           # PaginatedResult<T>, shared domain types
│       ├── Network.ts          # Pure Network entity
│       ├── Experiment.ts       # Pure Experiment, PipelineStatus, Biological entities
│       ├── Pathway.ts          # Pure Pathway entities
│       └── Graph.ts            # Pure GraphNode, GraphLink, ForceGraphData
├── services/
│   ├── apiConfig.ts            # Centralized API endpoints
│   ├── networkService.ts       # Encapsulates networkAdapter calls
│   ├── experimentService.ts    # Encapsulates experimentAdapter calls
│   └── models/                 # Backend wire contracts (*Dto)
├── utils/
│   ├── dateUtils.ts            # Presentation date formatting (DD/MM/YYYY)
│   ├── metricUtils.ts          # Pipeline step metric display parsing
│   └── graphDataParser.ts      # Graph edge filtering helpers
└── modules/
    └── dashboard/
        ├── networks/
        │   ├── Network.tsx       # Consumes Network domain model & dateUtils
        │   └── CreateNetwork.tsx # Dispatches via networkService with adapter payload
        └── experiments/
            ├── Experiments.tsx
            ├── CreateExperiment.tsx
            ├── ExperimentExecution.tsx
            ├── ConfigureInferences.tsx
            ├── UpdateBiologicalObjects.tsx
            ├── UpdateAlignedObjects.tsx
            └── PathwayGraphView.tsx
```

**Structure Decision**: Single React SPA frontend (`src/`). Adapters isolate external microservice wire DTOs (`services/models/`) from domain models (`domain/models/`) and presentational components/views.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| None | N/A | Full alignment with BioPatternSG UI Constitution |
