<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0 (Feature 003 Ratification)
- Ratification & Verification of Principle IV (Mandatory Adapter Pattern):
  * src/adapters/ updated with authAdapter, userAdapter, networkAdapter, experimentAdapter, pathwayAdapter
  * Dual exports established across all adapters
  * Service layer encapsulates adaptation by default
  * Zero direct imports of services/models/* across src/modules/ and src/components/
  * Pure presentation formatters isolated in src/utils/
- Core Principles defined from .agents/architecture-rules.md:
  * Principle I: Strict Atomic Design Hierarchy (3 Levels)
  * Principle II: Continuous Documentation Synchronization (Mandatory SDD Rule)
  * Principle III: Pure Domain Modeling in domain/models/
  * Principle IV: Mandatory Adapter Pattern
  * Principle V: Encapsulated Service Layer & Centralized HTTP
  * Principle VI: Declarative, Type-Safe Forms (React Hook Form + Zod)
  * Principle VII: Robust Security & Role-Based Access Control (RBAC)
- Added sections:
  * Quality Standards & Technical Constraints
  * Development Workflow & Quality Gates
- Follow-up TODOs: None (all template tokens resolved)
-->

# BioPatternSG UI Constitution

## Core Principles

### I. Strict Atomic Design Hierarchy (NON-NEGOTIABLE)
All user interface components MUST be developed adhering strictly to Atomic Design across three levels: Atoms (`src/components/atoms/`), Molecules (`src/components/molecules/`), and Organisms (`src/components/organisms/`). Atoms MUST NOT depend on other components and MUST NOT contain business logic or network calls. Molecules compose atoms and simple molecules without ever importing organisms or directly mutating global state. Organisms assemble molecules and atoms into autonomous, configurable structures via declarative contracts (e.g., `DataFormConfig`, `ColumnDef`). Full views, screens, and route pages MUST reside in feature modules under `src/modules/` and MUST NEVER be placed in `src/components/`.

### II. Continuous Documentation Synchronization (Mandatory SDD Rule)
Code and specification MUST remain synchronized at all times. Whenever a new component is created in `src/components/`, its corresponding documentation file MUST be created immediately in `.agents/components/<level>/<ComponentName>.md` and registered in the catalog master [`.agents/components/README.md`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/.agents/components/README.md). Whenever an existing component is modified (such as prop updates, new variants, or behavioral enhancements), its documentation file MUST be updated in the same task. No SpecKit implementation task (`tasks.md`) involving UI components may be marked complete without verifying documentation synchronization.

### III. Pure Domain Modeling in domain/models/
All business entities, core domain structures, and shared data objects used across modules (such as `User`, `Auth`, `Experiment`, `Pathway`, and biological entities) MUST be declared exclusively in `src/domain/models/`. Defining ad-hoc business models inline within component `.tsx` files or page views is strictly forbidden. The `domain/` layer MUST consist of pure TypeScript definitions and MUST NEVER import from `components/`, `modules/`, `services/`, `adapters/`, or UI frameworks.

### IV. Mandatory Adapter Pattern
All data crossing the boundary between external backend contracts/DTOs (`src/services/models/`) and internal domain models or form schemas (`src/domain/models/`) MUST be mediated by dedicated adapters in `src/adapters/` (e.g., `authAdapter.ts`, `userAdapter.ts`). Adapters isolate the user interface from backend schema evolution, field renames, and formatting shifts. UI views and presentational components MUST NEVER consume or manipulate raw API DTOs directly when model transformations or sanitization are required.

### V. Encapsulated Service Layer & Centralized HTTP
All network communication with backend microservices and the KrakenD API Gateway MUST be encapsulated within dedicated service modules in `src/services/` using the core HTTP client (`src/core/http/httpClient.ts`). Direct calls to `fetch()` or third-party HTTP clients inside components, hooks, or module pages are strictly prohibited. The core HTTP client MUST handle automatic Bearer token injection, token refresh concurrency queues on `401 Unauthorized`, and global session expiration events. Hardcoded absolute URLs are forbidden; endpoints must use relative proxy paths in development and `VITE_API_URL` in production.

### VI. Declarative, Type-Safe Forms (React Hook Form + Zod)
Every form capturing user input MUST define an explicit validation schema using Zod (`z.object({ ... })`). Manual, ad-hoc validation scattered across `onChange` or `onSubmit` handlers is strictly prohibited. Standard forms MUST prioritize the `DataForm` organism with `DataFormConfig` to ensure uniform spacing, accessible labels, loading spinners (`isLoading`), and inline error rendering. Form input models MUST be inferred directly from Zod schemas via `z.infer<typeof schema>`.

### VII. Robust Security & Role-Based Access Control (RBAC)
Every application route requiring authentication MUST be registered in `PROTECTED_ROUTES` (`src/routes/protectedRoutes.ts`) and wrapped by `<ProtectedRoute />`. Access permissions MUST be evaluated against defined roles in `src/config/roles.ts` (`admin`, `admin-user`, `researcher`) using `isRouteAllowedForRole()`. Public-only views MUST use `<PublicRoute />`. Token storage and lifecycle MUST be handled exclusively through `src/core/http/tokenStorage.ts`; direct, scattered manipulation of `localStorage` is strictly forbidden.

## Quality Standards & Technical Constraints

1. **Zero Inline Styles:** All visual presentation MUST use Tailwind CSS utility classes and semantic tokens from *The Clinical Lens* design system. Inline `style={{ ... }}` attributes are forbidden, except for dynamic pixel coordinate math in HTML5 Canvas and Three.js viewports.
2. **Safe Class Name Merging:** Dynamic class composition MUST always utilize the `cn(...)` utility from `@/lib/utils` (`clsx` + `tailwind-merge`).
3. **Standardized Biological Categorization:** Colors and styles assigned to biological categories (Proteins, Genes, Pathways, Chemicals, Diseases) MUST strictly use the tokens defined in `@/config/biologicalCategories.ts` and `forceGraphProfiles.ts`. Arbitrary color codes are forbidden.
4. **Graph Engine Lifecycle & Performance:** All graph visualization components (`ForceGraphCanvas`, `ForceGraphViewer`) MUST implement strict lifecycle cleanup, canceling active `requestAnimationFrame` loops and removing event listeners upon unmounting to prevent memory leaks. They MUST support the three standard clinical contrast profiles: `black`, `white`, and `skyblue`.

## Development Workflow & Quality Gates

1. **Spec-Driven Lifecycle:** All non-trivial enhancements MUST follow the SpecKit pipeline: Specification (`spec.md`) -> Architectural Planning (`plan.md`) -> Tasks Definition (`tasks.md`) -> Implementation -> Verification.
2. **Pull Request Quality Gates:** Every pull request and code review MUST verify:
   - Compliance with the 3-level Atomic Design hierarchy.
   - Domain models placed in `src/domain/models/` without framework coupling.
   - Use of adapters in `src/adapters/` for all API data ingestion and dispatch.
   - Complete documentation synchronization in `.agents/components/` and `.agents/components/README.md`.
   - Absence of inline styles, hardcoded API URLs, or direct `localStorage` access.
3. **Runtime Guidance:** Developers and AI agents MUST consult [`.agents/architecture-rules.md`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/.agents/architecture-rules.md) and [`.agents/architecture.md`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/.agents/architecture.md) for concrete operational guidelines.

## Governance

This Constitution supersedes all undocumented practices and informal conventions. Any amendment requires formal review, documentation update in `.agents/architecture-rules.md`, and a semantic version bump of this document:
- **MAJOR**: Incompatible governance changes, removal or fundamental redefinition of core principles.
- **MINOR**: Addition of new principles, quality sections, or substantially expanded architectural constraints.
- **PATCH**: Clarifications, wording refinements, and non-semantic corrections.

**Version**: 1.0.0 | **Ratified**: 2026-11-18 | **Last Amended**: 2026-11-18
