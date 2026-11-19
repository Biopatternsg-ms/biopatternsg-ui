# Architectural Research & Decisions: Atomic Design Hierarchy Decoupling

**Feature**: `001-atomic-hierarchy-decoupling`  
**Status**: Completed  
**Date**: 2026-11-18  

---

## 1. Relocation of Graph Entities and Visual Profiles

### Decision
Relocate all shared graph entity types (`GraphNode`, `GraphLink`, `GraphNodeInput`, `GraphLinkInput`, `ForceGraphData`) to `src/domain/models/Graph.ts`, and visual contrast profile definitions (`GraphBackground`, `GraphVisualProfile`, `GRAPH_PROFILES`, `getGraphProfile`) to `src/config/forceGraphProfiles.ts`. Completely eliminate legacy exports from `src/components/organisms/forceGraph/forceGraphTypes.ts` and `forceGraphProfiles.ts`.

### Rationale
- Eliminates inverted dependencies where lower-level Atoms (`ForceGraphCanvas`) and Molecules (`GraphDataUploadModal`, `NodeDetailPanel`, `NodeSearchSelect`) imported types from an Organism (`forceGraph/`).
- Enforces Constitution Principle I (Strict Atomic Design Hierarchy) and Principle III (Pure Domain Modeling).
- Full removal of legacy export stubs guarantees immediate repository-wide adherence, preventing developers from continuing to import from deprecated organism paths.

### Alternatives Considered
- *Preserve re-exports in `forceGraph/` with `@deprecated`:* Evaluated during clarification and rejected (Option B selected) to prevent obsolete paths from lingering in active development.
- *Keep types in a shared UI types directory (`src/types/`):* Rejected because network and biological interaction graph entities represent core domain data structures, which Constitution Principle III requires to live in `src/domain/models/`.

---

## 2. Structural Promotion of Breadcrumb to Molecule

### Decision
Promote `Breadcrumb` from an Atom (`src/components/atoms/Breadcrumb.tsx`) to a Molecule (`src/components/molecules/Breadcrumb.tsx`). The component will compose the `Button` atom and Lucide icons, accepting an optional navigation callback `onNavigate?: (href: string) => void` instead of importing `react-router-dom`'s `useNavigate`.

### Rationale
- Under Atomic Design, Atoms cannot depend on other Atoms. `Breadcrumb` inherently composes individual navigation steps, buttons, labels, and separator chevrons, which fits the textbook definition of a Molecule.
- Composing the `Button` atom allows `Breadcrumb` to maintain consistent hover, focus ring, and typography states without duplicate CSS.
- Replacing `useNavigate()` with `onNavigate` renders `Breadcrumb` 100% presentationally pure, usable inside embedded workflows, Storybook/unit test harnesses, and standard routing views.

### Alternatives Considered
- *Keep Breadcrumb as an Atom:* Would require replacing the `Button` atom with raw `<button>` / `<a>` elements and duplicating styling tokens.
- *Maintain an alias re-export in `atoms/`:* Rejected in favor of explicit import updates across the 7+ consuming views to preserve 1:1 file-to-catalog synchronization.

---

## 3. Data Fetching Decoupling for BiologicalRolesModal

### Decision
Refactor `BiologicalRolesModal.tsx` to be a pure presentational Molecule accepting `rolesData: BiologicalRole[]`, `isLoading: boolean`, and `error: string | null` via props. Encapsulate backend communication with `experimentService.getBiologicalRoles()` inside a dedicated custom hook: `src/modules/dashboard/experiments/hooks/useBiologicalRoles.ts` (or `src/hooks/useBiologicalRoles.ts`).

### Rationale
- Adheres to Constitution Principle I and Principle V: Molecules MUST NOT perform HTTP calls or directly instantiate backend services.
- Isolating async state (`useState`, `useEffect`, error handling) inside a dedicated custom hook allows parent views (`PathwayGraphView`, `Experiments`) to manage or share role data seamlessly while keeping `BiologicalRolesModal` purely presentational and trivial to test.

### Alternatives Considered
- *Inlining `experimentService` call directly inside `PathwayGraphView`:* Rejected because it clutters the page coordinator with modal-specific fetch orchestration.
- *Passing a fetch callback into the modal:* Rejected because the modal should not manage asynchronous network state machines.

---

## 4. Domain Modeling & Adapters for Pathway and Experiment

### Decision
Create `src/domain/models/Pathway.ts` and `src/domain/models/Experiment.ts` declaring pure domain interfaces for `GroupedPathway`, `PathwayDetail`, and `PipelineStatus`. Create dedicated adapters `src/adapters/pathwayAdapter.ts` and `src/adapters/experimentAdapter.ts` to transform backend DTOs from `src/services/models/` into domain entities. Refactor `PathwayDetailModal.tsx` and `PipelineStatus.tsx` to consume domain models exclusively.

### Rationale
- Constitution Principle III forbids UI components from importing backend DTOs (`src/services/models/`).
- Constitution Principle IV mandates dedicated adapters in `src/adapters/` to insulate UI components from backend contract shifts and schema variations.

### Alternatives Considered
- *Re-exporting service types in domain/models/:* Rejected as a violation of Principle III (domain layer must be pure and independent of service DTOs).
- *Defining ad-hoc interfaces inside modal files:* Explicitly forbidden by Constitution Principle III.

---

## 5. Presentational Delegation for HeroSection & UserMenu

### Decision
1. **`HeroSection.tsx`**: Refactor to accept `onLoginSubmit: (values: LoginFormValues) => Promise<void>`, `isLoading?: boolean`, `error?: string | null`, and `onForgotPassword?: () => void`. Move `authService.loginUser()` and `authAdapter.toLoginPayload()` orchestration into `src/modules/public/Landing.tsx`.
2. **`UserMenu.tsx`**: Refactor to accept `user?: { name?: string; email?: string; initials?: string }` and `onLogout?: () => void` via props. `TopBar.tsx` (an Organism) retrieves user and logout handlers from `useAuth()` and supplies them to `UserMenu`.

### Rationale
- Organisms under `src/components/organisms/` must not couple directly to concrete HTTP service layers (`authService`) or adapters (`authAdapter`).
- `Landing.tsx` (a feature module under `src/modules/public/`) is the appropriate layer for orchestrating authentication workflows, session tokens, and redirect navigation.
- Decoupling `UserMenu` from `AuthContext` makes the menu presentationally pure and reusable across distinct header layouts or preview harnesses.

### Alternatives Considered
- *Having TopBar remain completely prop-driven without context:* Rejected because `TopBar` is an Organism acting as the layout navigation header, and Organisms are permitted to assemble context/state for child molecules.

---

## 6. Automated Architectural Boundary Enforcement (ESLint)

### Decision
Configure explicit `no-restricted-imports` rules in `eslint.config.js` targeting:
1. `src/components/atoms/**`: Restrict imports from `@/components/atoms/*`, `@/components/molecules/*`, `@/components/organisms/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, and `react-router-dom`.
2. `src/components/molecules/**`: Restrict imports from `@/components/organisms/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, and `react-router-dom`.
3. `src/components/organisms/**`: Restrict imports from `@/services/*` and `@/adapters/*`.
4. `src/domain/models/**`: Restrict imports from `@/components/*`, `@/modules/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, and external UI packages.

### Rationale
- Guarantees automated enforcement during `npm run lint` and CI pipelines.
- Prevents future architectural drift or inadvertent inverted imports without relying solely on manual PR reviews.

### Alternatives Considered
- *Stand-alone bash regex script:* Rejected in favor of ESLint native AST parsing, which provides exact line/column reporting and seamless IDE feedback.
