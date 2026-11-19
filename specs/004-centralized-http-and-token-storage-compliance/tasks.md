# Tasks: Centralized HTTP Client & Token Storage Compliance

**Input**: Design documents from `/specs/004-centralized-http-and-token-storage-compliance/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification of repository and toolchain.

- [x] T001 Verify baseline repository status, branch `feature/04-centralized-http-and-token-storage-compliance`, and compilation (`npm run build`) in `services/biopatternsg-ui`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish resilient environment guards in core token storage before updating consumers.

**⚠️ CRITICAL**: Must be completed before updating `AuthContext.tsx`.

- [x] T002 Implement safe environment detection (`isStorageAvailable()`) in `src/core/http/tokenStorage.ts` ensuring getters return `null` and mutators perform a safe no-op when `window` or `localStorage` is undefined

**Checkpoint**: Core token storage is SSR-safe and ready for consumer adoption.

---

## Phase 3: User Story 1 - Centralized Token Access in Auth Context (Priority: P1) 🎯 MVP

**Goal**: Eliminate direct `localStorage` access in `AuthContext.tsx` and centralize token retrieval via `@/core/http/tokenStorage`.

**Independent Test**: Load the application with an access token in storage; verify `AuthContext` restores authentication state via `getAccessToken()` without accessing `localStorage.getItem` directly in the context.

### Implementation for User Story 1

- [x] T003 [US1] Refactor `src/context/AuthContext.tsx` to import `getAccessToken` from `@/core/http/tokenStorage` and replace direct `localStorage.getItem("access_token")` on line 86
- [x] T004 [US1] Verify that `src/context/AuthContext.tsx` contains zero direct runtime references to `localStorage` or `sessionStorage`

**Checkpoint**: User Story 1 is fully functional as an MVP increment.

---

## Phase 4: User Story 2 - Encapsulated Graph Template Loading (Priority: P1)

**Goal**: Encapsulate static graph template loading in `templateGraphService.ts` via `baseFetch`, removing raw browser `fetch()` calls from `ResultsGraph.tsx`.

**Independent Test**: Navigate to `/results-graph` with `hasInitialData = false`; verify example nodes and links are loaded via `templateGraphService.loadExampleGraphTemplates()` and the network renders correctly.

### Implementation for User Story 2

- [x] T005 [P] [US2] Create `src/services/templateGraphService.ts` defining `ExampleGraphTemplates` interface and `loadExampleGraphTemplates()` using `baseFetch` from `@/core/http/httpClient` with header `{ Accept: "text/plain" }`
- [x] T006 [US2] Refactor `src/modules/public/ResultsGraph.tsx` to invoke `loadExampleGraphTemplates()` in `useEffect` and remove direct `fetch()` calls for template assets

**Checkpoint**: User Story 2 is fully functional and all static template graph loading is mediated by the service layer.

---

## Phase 5: User Story 3 - Production-Safe API Configuration Fallback (Priority: P1)

**Goal**: Eliminate the insecure `"http://localhost:8008/api"` fallback from production configuration in `src/services/apiConfig.ts`.

**Independent Test**: Verify that in production mode (`import.meta.env.DEV === false`) when `VITE_API_URL` is omitted, `CONFIG_AND_CONTROL` resolves safely to `"/api"`.

### Implementation for User Story 3

- [x] T007 [US3] Update `src/services/apiConfig.ts` to replace `"http://localhost:8008/api"` with `"/api"` fallback when `import.meta.env.VITE_API_URL` is absent or empty in production mode (`!import.meta.env.DEV`)

**Checkpoint**: User Story 3 is complete and production builds never target developer localhost.

---

## Phase 6: User Story 4 - Zero Storage and HTTP Leaks Boundary Enforcement (Priority: P2)

**Goal**: Validate architectural boundaries across the entire codebase using automated static checks.

**Independent Test**: Static grep checks confirm exactly 0 direct storage accesses outside `tokenStorage.ts`, 0 raw fetch calls outside `httpClient.ts`, and 0 localhost fallbacks in `apiConfig.ts`.

### Implementation for User Story 4

- [x] T008 [P] [US4] Execute static boundary check confirming exactly 0 occurrences of `localStorage` or `sessionStorage` outside `src/core/http/tokenStorage.ts`
- [x] T009 [P] [US4] Execute static boundary check confirming exactly 0 occurrences of raw `fetch(` outside `src/core/http/httpClient.ts`
- [x] T010 [P] [US4] Execute static boundary check confirming exactly 0 occurrences of `localhost:8008` in `src/services/apiConfig.ts`

**Checkpoint**: Boundary enforcement passes with 100% compliance across all architectural rules.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, quality gates, and constitutional verification.

- [x] T011 Run production build gate (`npm run build`) in `services/biopatternsg-ui` and confirm 0 TypeScript errors
- [x] T012 Run linting gate (`npm run lint`) in `services/biopatternsg-ui` and confirm 0 ESLint errors/warnings
- [x] T013 Execute end-to-end quickstart validation scenarios defined in `specs/004-centralized-http-and-token-storage-compliance/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1); blocks US1.
- **User Stories (Phases 3-6)**:
  - US1 (Phase 3) depends on Phase 2 (`tokenStorage.ts`).
  - US2 (Phase 4) can proceed in parallel with US1 (modifies distinct files `templateGraphService.ts` and `ResultsGraph.tsx`).
  - US3 (Phase 5) can proceed in parallel (modifies `apiConfig.ts`).
  - US4 (Phase 6) runs after US1, US2, and US3 are implemented to verify the clean boundary state.
- **Polish (Phase 7)**: Depends on all user story tasks being completed.

### Parallel Opportunities

- `T005` (US2 template service) and `T007` (US3 apiConfig) can run in parallel with `T003` (US1 AuthContext).
- `T008`, `T009`, and `T010` in US4 can run concurrently as independent static checks.

---

## Parallel Example: User Stories 1, 2, and 3

```bash
# Developer A: Implement US1 Token Access
Task: T003 Refactor src/context/AuthContext.tsx to import getAccessToken from @/core/http/tokenStorage

# Developer B: Implement US2 Template Graph Service
Task: T005 Create src/services/templateGraphService.ts using baseFetch
Task: T006 Refactor src/modules/public/ResultsGraph.tsx to use loadExampleGraphTemplates()

# Developer C: Implement US3 Safe API Fallback
Task: T007 Update src/services/apiConfig.ts to fallback to "/api" in production
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`).
2. Complete Phase 2: Foundational (`T002` in `tokenStorage.ts`).
3. Complete Phase 3: User Story 1 (`T003`, `T004` in `AuthContext.tsx`).
4. **VALIDATE**: Verify session restoration on reload without direct `localStorage` access.

### Incremental Delivery

1. Foundation + US1 (MVP) → Zero token storage leaks.
2. Add US2 → Zero raw `fetch()` calls in UI views.
3. Add US3 → Zero localhost fallback in production builds.
4. Add US4 + Polish → Automated boundary verification, clean lint, clean production build.
