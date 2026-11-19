# Implementation Plan: Atomic Design Hierarchy Decoupling

**Branch**: `feature/01-atomic-design-hierarchy-decoupling` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-atomic-hierarchy-decoupling/spec.md`

## Summary

Eliminate all inverted dependencies and layer boundary violations across `src/components/` by enforcing a strict 3-level Atomic Design hierarchy (`Atoms -> Molecules -> Organisms`). Shared biological graph types and visual profiles will be relocated to canonical locations (`src/domain/models/Graph.ts` and `src/config/forceGraphProfiles.ts`). `Breadcrumb` will be promoted to a presentational molecule composing the `Button` atom with an `onNavigate` callback. Direct backend calls, DTO consumption, and global router/context couplings inside molecules and organisms (`BiologicalRolesModal`, `UserMenu`, `ManualStepHeader`, `HeroSection`, `PathwayDetailModal`, `PipelineStatus`) will be replaced with pure prop interfaces, dedicated domain models (`Pathway.ts`, `Experiment.ts`), adapters (`pathwayAdapter.ts`, `experimentAdapter.ts`), and custom hooks (`useBiologicalRoles`). Continuous compliance will be automated via ESLint `no-restricted-imports` boundary rules.

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 20+, React 19.2 (Vite SPA)  
**Primary Dependencies**: React 19, Tailwind CSS 3.4, Radix UI primitives, React Force Graph (2D/3D), Three.js, Lucide React, Zod 4  
**Storage**: In-memory React state, `tokenStorage.ts` (JWT lifecycle in browser storage)  
**Testing**: TypeScript strict compilation (`tsc -b`), ESLint flat config (`npm run lint`), Vite build (`npm run build`)  
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge) with HTML5 Canvas / WebGL  
**Project Type**: Single-page Web application frontend (Vite SPA)  
**Performance Goals**: Fluid 60 FPS graph rendering, instant tab/route transitions, zero memory leaks on unmount  
**Constraints**: Strict 3-level Atomic Design hierarchy (zero inverted imports, zero direct service/router coupling in atoms/molecules), mandatory documentation synchronization in `.agents/components/`  
**Scale/Scope**: 10 non-compliant component files refactored, 3 new domain models created (`Graph.ts`, `Pathway.ts`, `Experiment.ts`), 2 new adapters (`pathwayAdapter.ts`, `experimentAdapter.ts`), 1 custom hook (`useBiologicalRoles`), ~10 component doc updates in `.agents/components/`  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation & Evidence |
|-----------|--------|-----------------------|
| **I. Strict Atomic Design Hierarchy** | **PASS** | Atoms (`ForceGraphCanvas`, etc.) no longer import organisms or other atoms. Molecules (`Breadcrumb`, `UserMenu`, `BiologicalRolesModal`, `ManualStepHeader`) do not import organisms, services, or router hooks. Organisms (`HeroSection`) delegate network calls to feature modules. |
| **II. Continuous Documentation Synchronization** | **PASS** | Component documentation in `.agents/components/<level>/<ComponentName>.md` and `.agents/components/README.md` scheduled for updates alongside code changes. |
| **III. Pure Domain Modeling in `domain/models/`** | **PASS** | `Graph.ts`, `Pathway.ts`, and `Experiment.ts` declared as pure TypeScript interfaces in `src/domain/models/` without framework or service imports. |
| **IV. Mandatory Adapter Pattern** | **PASS** | External API DTOs from `src/services/models/` are mediated by dedicated adapters (`pathwayAdapter.ts`, `experimentAdapter.ts`) before reaching presentational components. |
| **V. Encapsulated Service Layer & Centralized HTTP** | **PASS** | All backend communications remain encapsulated in `src/services/` and are consumed exclusively by feature modules (`Landing.tsx`) or custom hooks (`useBiologicalRoles`), never directly by presentational components. |
| **VI. Declarative, Type-Safe Forms** | **PASS** | `HeroSection` maintains Zod schema validation and delegates submission to parent module handlers. |
| **VII. Robust Security & RBAC** | **PASS** | `UserMenu` delegates logout cleanly; `TopBar` retrieves credentials from `useAuth()` to supply presentational props. |

## Project Structure

### Documentation (this feature)

```text
specs/001-atomic-hierarchy-decoupling/
├── plan.md              # This implementation plan
├── research.md          # Architectural research & decisions
├── data-model.md        # Domain entities, profiles, and component prop models
├── quickstart.md        # Verification and quality gate guide
├── contracts/           # Component and boundary lint contracts
│   ├── component-contracts.md
│   └── lint-boundary-contract.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── models/
│       ├── Auth.ts
│       ├── User.ts
│       ├── Graph.ts               # Relocated shared graph domain models
│       ├── Pathway.ts             # New pure domain models for pathways
│       └── Experiment.ts          # New pure domain models for experiment/pipeline
├── config/
│   ├── forceGraphProfiles.ts      # Relocated visual contrast profiles
│   ├── biologicalCategories.ts
│   └── roles.ts
├── adapters/
│   ├── authAdapter.ts
│   ├── userAdapter.ts
│   ├── pathwayAdapter.ts          # New adapter for pathway DTOs
│   └── experimentAdapter.ts       # New adapter for experiment DTOs
├── services/
│   ├── authService.ts
│   ├── experimentService.ts
│   └── models/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── ForceGraphCanvas.tsx   # Refactored: imports from domain/models/Graph
│   │   └── ... (Breadcrumb removed from atoms)
│   ├── molecules/
│   │   ├── Breadcrumb.tsx         # Promoted from atoms: composes Button with onNavigate
│   │   ├── BiologicalRolesModal.tsx # Refactored: pure presentational props
│   │   ├── GraphDataUploadModal.tsx # Refactored: imports from domain/models/Graph
│   │   ├── NodeDetailPanel.tsx      # Refactored: imports from domain/models/Graph
│   │   ├── NodeSearchSelect.tsx     # Refactored: imports from domain/models/Graph
│   │   ├── PathwayDetailModal.tsx   # Refactored: consumes domain/models/Pathway
│   │   ├── PipelineStatus.tsx       # Refactored: consumes domain/models/Experiment
│   │   ├── ManualStepHeader.tsx     # Refactored: onBack and onNavigate props
│   │   └── UserMenu.tsx             # Refactored: pure presentational props
│   └── organisms/
│       ├── HeroSection.tsx          # Refactored: onLoginSubmit prop
│       ├── TopBar.tsx               # Supplies user and onLogout to UserMenu
│       └── forceGraph/
│           ├── ForceGraphViewer.tsx
│           └── (forceGraphTypes.ts and forceGraphProfiles.ts removed)
├── modules/
│   ├── public/
│   │   └── Landing.tsx              # Orchestrates authService/authAdapter for HeroSection
│   └── dashboard/
│       └── experiments/
│           ├── hooks/
│           │   └── useBiologicalRoles.ts # Custom hook for async role fetching
│           └── PathwayGraphView.tsx
└── eslint.config.js                 # Automated boundary rules (no-restricted-imports)
```

**Structure Decision**: Standard SPA structure within `src/`, adhering to 3-level Atomic Design under `src/components/`, pure domain models under `src/domain/models/`, adapters under `src/adapters/`, and feature module coordinators under `src/modules/`.

## Complexity Tracking

> **Constitution Check has passed with 0 violations. No complexity exemptions required.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *N/A* | *N/A* |
