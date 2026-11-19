# Architecture Rules & Guidelines — BioPatternSG UI

> **Architecture Governance & Development Rules**  
> **Project:** `biopatternsg-ui`  
> **Location:** `.agents/architecture-rules.md`  
> **Purpose:** Defines the non-negotiable architectural principles and technical rules governing all future frontend development. Serves as the authoritative source for the **SpecKit Constitution (`constitution.md`)** within the Spec-Driven Development (SDD) lifecycle.

---

## 1. Rule 1: Atomic Design in 3 Strict Levels

All UI components must be developed strictly adhering to **Atomic Design** restricted to **3 hierarchical levels**:

```
src/components/
├── atoms/       # Level 1: Atoms
├── molecules/   # Level 2: Molecules
└── organisms/   # Level 3: Organisms
```

### 1.1. Level Constraints
1. **Atoms (`atoms/`):**
   - Indivisible, primitive building blocks (`Button`, `Input`, `Badge`, `Label`, `Checkbox`, `LoadingSpinner`, `ForceGraphCanvas`).
   - **Rule:** An atom **must never depend on other atoms, molecules, or organisms**.
   - **Rule:** Atoms must not contain business logic, network requests, or global state subscriptions.
   - Must receive data and emit events exclusively via `props`.

2. **Molecules (`molecules/`):**
   - Cohesive assemblies of atoms providing distinct functional interactions (`FormField`, `BenefitCard`, `NodeSearchSelect`, `Stepper`, confirmation modals).
   - **Rule:** A molecule may only compose atoms and other simple molecules. **A molecule must never import or render an organism**.
   - Must not perform direct global business state mutations; they delegate actions via callbacks (`onConfirm`, `onClose`, `onChange`).

3. **Organisms (`organisms/`):**
   - Complex, autonomous assemblies combining molecules and atoms (`ForceGraphViewer`, `DataTable`, `DataForm`, `DashboardLayout`, `Sidebar`, `TopBar`).
   - May manage internal presentation state and connect to global contexts (`AuthContext`, `SidebarContext`).
   - **Rule:** Organisms must be reusable and configurable via declarative props or contracts (such as `DataFormConfig` in `DataForm` or `ColumnDef` in `DataTable`). They must not be tightly coupled to a single page.

4. **Views & Pages (Not Organisms):**
   - Full pages and screens **do not belong in `src/components/`**. They belong exclusively to feature modules under `src/modules/` (`public`, `dashboard`, `admin`).

### 1.2. Reusability & Decoupling
- Every component created in `src/components/` must be designed for **reusability across different parts of the application**.
- If a component contains view logic tied to a single specific workflow, it must reside inside that feature's directory (`src/modules/<module>/components/`) or be refactored into a presentation component and container hook.

---

## 2. Rule 2: Continuous Documentation Synchronization (Mandatory SDD Rule)

To guarantee that the codebase and its specifications never diverge:

1. **New Component Rule:**
   - **Whenever a new component is created in `src/components/`, its corresponding documentation file MUST be created immediately in `.agents/components/<level>/<ComponentName>.md`**, and its entry must be registered in the catalog master [`.agents/components/README.md`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/.agents/components/README.md).
2. **Component Modification Rule:**
   - **Whenever an existing component is modified** (such as prop signature updates, new visual variants, breaking changes, or behavioral enhancements), **its corresponding documentation file in `.agents/components/` MUST be updated in the same task**.
3. **Task Completion Gate:**
   - No SpecKit implementation task (`tasks.md`) involving frontend components may be marked as complete without verifying that the corresponding documentation is synchronized.

---

## 3. Rule 3: Pure Domain Modeling in `src/domain/models/`

To keep business logic independent of UI frameworks and external API fluctuations:

1. **Mandatory Location:**
   - All core entity structures, business objects, and domain models used across modules (`User`, `Auth`, `Experiment`, `Pathway`, `BiologicalEntity`) must be defined exclusively in:
     ```
     src/domain/models/
     ```
2. **Prohibition of Ad-Hoc Inline Types:**
   - Defining business entity interfaces or types inside component files (`.tsx`) or page views is strictly prohibited.
3. **Pure Domain Rule:**
   - Domain models must be pure TypeScript types (`interface` or `type`).
   - **Rule:** The `domain/` package **must never import anything** from `components/`, `modules/`, `services/`, `adapters/`, or UI libraries (React, Tailwind, Lucide, etc.).

---

## 4. Rule 4: Mandatory Adapter Pattern (`src/adapters/`)

To insulate the frontend from schema changes in backend microservices and KrakenD API Gateway:

1. **Mandatory Use of Adapters:**
   - Whenever data is received from backend endpoints (DTOs in `src/services/models/`) or sent from user forms to API endpoints, an adapter in `src/adapters/` must be used (e.g. `authAdapter.ts`, `userAdapter.ts`).
2. **Adapter Responsibilities:**
   - Transform API DTOs into clean domain models (`apiToDomain`).
   - Transform domain models or form values into API request payloads (`domainToApiPayload`).
   - Isolate field renames, date format changes, or structural API evolutions from affecting UI views.
3. **Consumption Rule in Views:**
   - UI views and components **must never manipulate raw API DTOs directly** whenever an adapter transformation is required.

---

## 5. Rule 5: Centralized HTTP & Service Layer (`src/services/` & `src/core/http/`)

1. **Encapsulation in Services:**
   - All HTTP requests to backend microservices must be encapsulated within dedicated functions in `src/services/` (`experimentService.ts`, `networkService.ts`, `userService.ts`, `authService.ts`).
   - **Strictly Prohibited:** Using `fetch()` or third-party HTTP clients directly inside components, hooks, or module pages.
2. **Use of Core HTTP Client (`src/core/http/httpClient.ts`):**
   - All service calls must use the project's central HTTP client.
   - The client guarantees:
     - Automatic injection of JWT Bearer tokens.
     - Automatic token refresh handling on `401 Unauthorized` with a concurrent request queue.
     - Global emission of `SESSION_EXPIRED_EVENT` when credentials expire unrecoverably.
3. **URL Resolution & CORS Strategy (`src/services/apiConfig.ts`):**
   - In **Development**: Relative paths (`""`) must be used, relying on Vite's dev reverse proxy (`vite.config.ts`) to forward calls to `http://localhost:8081` without CORS issues.
   - In **Production**: Endpoints resolve against `VITE_API_URL`.
   - **Strictly Prohibited:** Hardcoding absolute URLs such as `http://localhost:8080` inside service files.

---

## 6. Rule 6: Type-Safe Declarative Forms (React Hook Form + Zod)

1. **Mandatory Zod Schemas:**
   - Every form capturing user input must define an explicit validation schema using **Zod** (`z.object({ ... })`).
   - Ad-hoc validation logic scattered across manual `onChange` or `onSubmit` handlers is strictly prohibited.
2. **Preference for `DataForm` Organism:**
   - Standard forms must utilize the `DataForm` organism configured through `DataFormConfig`.
   - Guarantees visual consistency, accessible labels, loading state indicators (`isLoading`), and inline error rendering via `FormField`.
3. **Inferred Form Types:**
   - Form input types must be inferred directly from the Zod schema via `z.infer<typeof schema>`.

---

## 7. Rule 7: Route Security & Role-Based Access Control (RBAC)

1. **Centralized Protected Routes Registry:**
   - Every route requiring authentication must be registered in the `PROTECTED_ROUTES` array in `src/routes/protectedRoutes.ts`.
2. **Route Guards (`src/core/router/`):**
   - Private routes must be guarded by `<ProtectedRoute />`.
   - Public-only entry views must use `<PublicRoute />` to prevent redundant access if already authenticated.
3. **Role-Based Permissions:**
   - RBAC roles are strictly defined in `src/config/roles.ts`: `admin`, `admin-user`, `researcher`.
   - Route and navigation item access must be validated using `isRouteAllowedForRole()`.
4. **Credential Persistence:**
   - Token access and revocation must be handled exclusively through `src/core/http/tokenStorage.ts` (`setTokens`, `getAccessToken`, `clearTokens`).
   - **Strictly Prohibited:** Directly calling `localStorage.setItem("token", ...)` anywhere else in the application.

---

## 8. Rule 8: Design System & Styling Governance ("The Clinical Lens")

1. **Zero Inline Styles:**
   - All styling must use **Tailwind CSS** utility classes and semantic tokens.
   - `style={{ ... }}` is strictly prohibited, except for dynamic pixel coordinate math required by HTML5 Canvas or Three.js.
2. **Safe Class Merging (`cn`):**
   - To merge custom `className` properties, components must always use the `cn(...)` utility from `@/lib/utils` (backed by `clsx` and `tailwind-merge`).
3. **Standardized Biological Category Colors:**
   - Colors assigned to biological entities (Proteins, Genes, Pathways, Chemicals, Diseases) must strictly use the definitions in `@/config/biologicalCategories.ts` or `forceGraphProfiles.ts`.
   - Arbitrary HEX color codes for biological roles must never be introduced ad-hoc.

---

## 9. Rule 9: Scope of Global State (Context API)

1. **Limited Context Scope:**
   - React Context must be reserved for truly global, cross-cutting state:
     - `AuthContext`: Active session, user profile, login, logout.
     - `SidebarContext`: Desktop/mobile sidebar drawer states.
2. **No Monolithic Contexts:**
   - Specific dataset, graph, or wizard state must be managed with local module state, custom hooks, or hoisted component state.

---

## 10. Rule 10: Graph Visualization Performance & Cleanup

1. **Dedicated Graph Components:**
   - Visualizing network graphs on HTML5 Canvas or Three.js must be encapsulated in dedicated components (`ForceGraphCanvas`, `ForceGraphViewer`).
2. **Lifecycle & Cleanup:**
   - Graph components must cancel all active `requestAnimationFrame` loops and remove window event listeners upon unmounting (`useEffect` cleanup return).
3. **Profile Compatibility:**
   - Graph views must support the three clinical contrast profiles: `black`, `white`, and `skyblue`.

---

## 📋 Architectural Compliance Matrix

| Dimension | Mandatory Rule | Strictly Prohibited |
| :--- | :--- | :--- |
| **Atomic Design** | 3 levels: Atoms, Molecules, Organisms in `src/components/`. | Hybrid levels; full pages in `components/`. |
| **Documentation Sync** | Create doc on component creation; update doc on modification. | Undocumented components; outdated component markdown. |
| **Domain Models** | Defined strictly in `src/domain/models/`. | Business entity types defined inline in components or pages. |
| **API Integration** | Mediate API DTOs and domain via `src/adapters/`. | Direct consumption of raw API DTOs in UI views. |
| **HTTP Requests** | Services in `src/services/` using `core/http/httpClient.ts`. | Direct `fetch`/`axios` in components; hardcoded URLs. |
| **Form Validation** | React Hook Form + declarative Zod schemas. | Untyped forms; manual conditional validation in `onChange`. |
| **Security & RBAC** | Registered in `protectedRoutes.ts` and guarded by `ProtectedRoute`. | Direct `localStorage` access; unguarded private routes. |
| **Styling & Tokens** | Tailwind CSS + *The Clinical Lens* semantic tokens. | Inline styles `style={{}}`; ad-hoc arbitrary biological colors. |
| **Graph Visualization** | Dedicated canvas atoms with explicit lifecycle cleanup. | Leaking animation frames; un-isolated graph rendering. |
