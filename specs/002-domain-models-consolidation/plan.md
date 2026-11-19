# Implementation Plan: Pure Domain Models Consolidation

**Branch**: `feature/02-domain-models-consolidation` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-domain-models-consolidation/spec.md`

## Summary

Consolidate and purify all core business domain models under `src/domain/models/` (`Common.ts`, `Network.ts`, `Experiment.ts`, `Pathway.ts`, `Graph.ts`, `Auth.ts`, `User.ts`) in strict compliance with Principle III of the BioPatternSG UI Constitution. Eliminate inline business interfaces across module views (`UpdateAlignedObjects.tsx`, `UpdateBiologicalObjects.tsx`, `ExperimentExecution.tsx`) and service files (`networkService.ts`). Ensure zero framework, UI library, or layer imports within `src/domain/`. Distinguish backend transport representations in `src/services/models/` with an explicit `Dto` suffix, and mediate all domain/DTO interactions through dedicated adapters in `src/adapters/` (`networkAdapter.ts`, `experimentAdapter.ts`, `pathwayAdapter.ts`).

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 20+, React 19.2 (Vite SPA)  
**Primary Dependencies**: React 19, Tailwind CSS 3.4, Radix UI primitives, Lucide React, Zod 4  
**Storage**: In-memory React state, `tokenStorage.ts` (JWT lifecycle in browser storage)  
**Testing**: TypeScript strict compilation (`npm run build`), ESLint (`npm run lint`), grep-based boundary assertions  
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page Web application frontend (Vite SPA)  
**Performance Goals**: Instant static type resolution, zero runtime object conversion overhead, zero circular dependency deadlocks  
**Constraints**: Strict compliance with Principle III (Pure Domain Modeling in `domain/models/`), Principle IV (Mandatory Adapter Pattern), Zero UI/framework imports in `domain/models/`, Zero inline business models in modules or services  
**Scale/Scope**: 5 consolidated domain model files (`Common.ts`, `Network.ts`, `Experiment.ts`, `Pathway.ts`, `Graph.ts`), 3 updated service files / DTO collections, 3 refactored experiment module screens, 3 adapters (`networkAdapter.ts`, `experimentAdapter.ts`, `pathwayAdapter.ts`)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation & Evidence |
|-----------|--------|-----------------------|
| **I. Strict Atomic Design Hierarchy** | **PASS** | UI components remain organized in atoms, molecules, and organisms. Transient UI properties are separated into localized View Contracts in modules, keeping components decoupled from domain internals. |
| **II. Continuous Documentation Synchronization** | **PASS** | Any component prop adjustments will update the corresponding `.agents/components/` files and master catalog. |
| **III. Pure Domain Modeling in `domain/models/`** | **PASS** | Core focus of this feature. All domain models (`Common.ts`, `Network.ts`, `Experiment.ts`, `Pathway.ts`, `Graph.ts`) reside in `src/domain/models/` with zero imports from `react`, `lucide-react`, `components`, `modules`, `services`, or `adapters`. |
| **IV. Mandatory Adapter Pattern** | **PASS** | Backend wire contracts (`*Dto`) are systematically separated from domain entities and mediated by dedicated adapters (`networkAdapter.ts`, `experimentAdapter.ts`, `pathwayAdapter.ts`). |
| **V. Encapsulated Service Layer & Centralized HTTP** | **PASS** | All network calls remain strictly inside `src/services/` using `authFetch`, returning DTOs or adapter-transformed domain models. |
| **VI. Declarative, Type-Safe Forms** | **PASS** | Form inputs and biological edit payloads derive from domain models and Zod schemas without ad-hoc validation. |
| **VII. Robust Security & RBAC** | **PASS** | User authentication entities (`Auth.ts`, `User.ts`) remain intact and integrated with protected routes. |

## Project Structure

### Documentation (this feature)

```text
specs/002-domain-models-consolidation/
├── plan.md              # This implementation plan
├── research.md          # Architectural research & decisions (Phase 0)
├── data-model.md        # Domain entities, DTOs, and view contracts (Phase 1)
├── quickstart.md        # Verification and quality gate guide (Phase 1)
├── contracts/           # Interface contracts (Phase 1)
│   ├── domain-models.md
│   ├── service-dtos.md
│   └── module-view-contracts.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── models/
│       ├── Common.ts              # New: PaginatedResult<T> and biological primitives
│       ├── Network.ts             # New: Pure Network entity and CreateNetworkInput
│       ├── Experiment.ts          # Consolidated: Pure Experiment, Status, Roles, Biological/Aligned Objects, Metrics
│       ├── Pathway.ts             # Consolidated: Pure Pathway, GroupedPathway, Events
│       ├── Graph.ts               # Consolidated: Pure GraphNode, GraphLink, ForceGraphData
│       ├── Auth.ts                # Existing: AuthCredentials, AuthTokenResult
│       └── User.ts                # Existing: User, UserProfile
├── config/
│   ├── biologicalCategories.ts
│   ├── forceGraphProfiles.ts
│   └── roles.ts
├── adapters/
│   ├── networkAdapter.ts          # New: Transforms NetworkDto to Network domain model
│   ├── experimentAdapter.ts       # Enhanced: Mediates ExperimentDto, BiologicalObjectDto, AlignedResultDto
│   ├── pathwayAdapter.ts          # Enhanced: Mediates PathwayDto to Pathway domain models
│   ├── authAdapter.ts             # Existing
│   └── userAdapter.ts             # Existing
├── services/
│   ├── apiConfig.ts
│   ├── networkService.ts          # Refactored: Uses NetworkDto & PaginatedResponseDto, removes inline models
│   ├── experimentService.ts       # Refactored: Consumes DTOs from models/Experiment.ts
│   ├── pathwayService.ts          # Refactored: Consumes DTOs from models/Pathway.ts
│   └── models/
│       ├── NetworkDto.ts          # New or updated wire contract
│       ├── Experiment.ts          # Refactored to pure DTOs (ExperimentDto, etc.)
│       └── Pathway.ts             # Refactored to pure DTOs (PathwayDto, etc.)
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
└── modules/
    └── dashboard/
        └── experiments/
            ├── UpdateAlignedObjects.tsx    # Refactored: Imports AlignedObjectItem from domain
            ├── UpdateBiologicalObjects.tsx # Refactored: Extends BiologicalObjectItem with EditableBiologicalObject
            └── ExperimentExecution.tsx     # Refactored: Decouples ManualStepMetadata from LucideIcon
```

## Complexity Tracking

> **No violations identified.** All architectural designs strictly adhere to the BioPatternSG UI Constitution.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A |
