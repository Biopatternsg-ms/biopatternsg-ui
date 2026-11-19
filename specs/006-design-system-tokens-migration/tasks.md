# Tasks: Design System Inline Styles & Color Token Normalization

**Input**: Design documents from `/specs/006-design-system-tokens-migration/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline verification and repository status check.

- [x] T001 Verify baseline repository status, branch `feature/06-design-system-inline-styles-and-color-tokens`, and clean compilation (`npm run build`) in `services/biopatternsg-ui`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core design system tokens and biological category color dictionaries required across views and components.

**⚠️ CRITICAL**: Must be completed before refactoring pathway views, graphs, or component styling.

- [x] T002 [P] Extend `tailwind.config.ts` with `surface-sidebar: "#eef3ff"` and `backgroundImage: { "grid-dots": "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)" }`
- [x] T003 [P] Centralize biological role colors in `src/config/biologicalCategories.ts` by defining and exporting `ROLE_COLORS`, `DEFAULT_ROLE_COLOR`, `getRoleColor(role?: string)`, and `formatRoleName(role?: string)`

**Checkpoint**: Foundation ready — token extensions and biological color functions are exported and ready for consumption.

---

## Phase 3: User Story 1 - Consistent Biological Category Palettes Across Pathway Exploration (Priority: P1) 🎯 MVP

**Goal**: Eliminate duplicate `ROLE_COLORS` dictionaries and helper functions across pathway list and modal views, establishing a single source of truth.

**Independent Test**: Navigate to an experiment's pathway list view and open the pathway detail modal. Verify identical colors render for all biological roles (Ligand, Protein, Transcription Factor, etc.) using imports from `biologicalCategories.ts`.

### Implementation for User Story 1

- [x] T004 [P] [US1] Refactor `src/modules/dashboard/experiments/PathwayListView.tsx` to remove internal `ROLE_COLORS`, `getRoleColor`, and `formatRoleName` declarations and import them from `src/config/biologicalCategories.ts`
- [x] T005 [P] [US1] Refactor `src/components/molecules/PathwayDetailModal.tsx` to remove duplicate `ROLE_COLORS`, `getRoleColor`, and `formatRoleName` declarations and import them from `src/config/biologicalCategories.ts`

**Checkpoint**: User Story 1 is fully functional. Both pathway list and detail modal consume unified biological role colors.

---

## Phase 4: User Story 2 - Clinical High-Contrast Graph Profiles & Theme Alignment (Priority: P1)

**Goal**: Configure graph views to read contrast background options from `GRAPH_PROFILES` without arbitrary hardcoded HEX strings.

**Independent Test**: Open graph views in both dashboard and public views, toggle between `black`, `white`, and `skyblue` contrast profiles, and verify backgrounds match `GRAPH_PROFILES`.

### Implementation for User Story 2

- [x] T006 [P] [US2] Refactor `src/modules/dashboard/experiments/PathwayGraphView.tsx` to read contrast profile background swatches from `GRAPH_PROFILES` in `src/config/forceGraphProfiles.ts`, removing hardcoded `#87ceeb` and `#ffffff`
- [x] T007 [P] [US2] Refactor `src/modules/public/ResultsGraph.tsx` to read contrast profile background swatches from `GRAPH_PROFILES` in `src/config/forceGraphProfiles.ts`, removing hardcoded `#87ceeb` and `#ffffff`

**Checkpoint**: User Story 2 is fully functional. Graph views strictly adhere to canonical contrast profiles.

---

## Phase 5: User Story 3 - Normalized Brand & Surface Colors on Public & Dashboard Interfaces (Priority: P2)

**Goal**: Replace hardcoded brand and surface HEX colors on public entry and navigation views with Tailwind semantic tokens.

**Independent Test**: Inspect `/register`, `/recovery-password`, and `/dashboard` sidebar. Verify all backgrounds and brand accents use Tailwind utility classes (`bg-grid-dots`, `bg-surface-sidebar`, `primary`).

### Implementation for User Story 3

- [x] T008 [P] [US3] Refactor `src/modules/public/Register.tsx` to replace `style={{ backgroundImage: "...", backgroundSize: "..." }}` with Tailwind classes `bg-grid-dots bg-[size:40px_40px]`
- [x] T009 [P] [US3] Refactor `src/modules/public/RecoveryPassword.tsx` to replace `style={{ backgroundImage: "...", backgroundSize: "..." }}` with Tailwind classes `bg-grid-dots bg-[size:40px_40px]`
- [x] T010 [P] [US3] Refactor `src/components/organisms/Sidebar.tsx` to replace `bg-[#eef3ff]` with semantic token `bg-surface-sidebar`

**Checkpoint**: User Story 3 is fully functional. Authentication backgrounds and navigation surfaces use semantic design tokens.

---

## Phase 6: User Story 4 - Elimination of Non-Canvas Inline Styles (Priority: P2)

**Goal**: Eliminate static inline styles across clinical components, enforcing Tailwind utility classes and reserving `style` exclusively for runtime dynamic data colors and mathematical progress widths.

**Independent Test**: Inspect the DOM of `Stepper`, `NodeDetailPanel`, `NodeSearchSelect`, and `PathwayDetailModal`. Verify 0 static layout/border/padding styles exist in `style` attributes.

### Implementation for User Story 4

- [x] T011 [P] [US4] Refactor `src/components/molecules/Stepper.tsx` to isolate `style` exclusively to dynamic progress width (`style={{ width: \`\${percent}%\` }}`) while ensuring all positioning, transitions, and colors use Tailwind classes
- [x] T012 [P] [US4] Refactor `src/components/molecules/NodeDetailPanel.tsx` lines 112, 119, 216 to replace static inline padding and layout with Tailwind classes, isolating `style` strictly to runtime dynamic data colors
- [x] T013 [P] [US4] Refactor `src/components/molecules/NodeSearchSelect.tsx` line 297 to ensure swatch dot structure uses Tailwind classes, isolating `style` strictly to runtime dynamic background color

**Checkpoint**: User Story 4 is complete. All clinical components adhere to the constitutional zero-static-inline-styles standard.

---

## Phase 7: Polish & Documentation Synchronization

**Purpose**: Synchronize atomic component documentation per Constitution Principle II, execute quality gates, and validate end-to-end scenarios.

- [x] T014 [P] Update component documentation in `.agents/components/molecules/Stepper.md` to document tokenized styling and dynamic progress bar width
- [x] T015 [P] Update component documentation in `.agents/components/molecules/NodeDetailPanel.md` to document tokenized node category chips
- [x] T016 [P] Update component documentation in `.agents/components/molecules/NodeSearchSelect.md` to document tokenized swatch indicators
- [x] T017 [P] Update component documentation in `.agents/components/molecules/PathwayDetailModal.md` to document consumption of central `biologicalCategories.ts`
- [x] T018 [P] Update component documentation in `.agents/components/organisms/Sidebar.md` to document consumption of `bg-surface-sidebar`
- [x] T019 Run production build gate (`npm run build`) in `services/biopatternsg-ui` and confirm 0 TypeScript errors
- [x] T020 Run linting gate (`npm run lint`) in `services/biopatternsg-ui` and confirm 0 ESLint errors/warnings
- [x] T021 Execute end-to-end quickstart validation scenarios defined in `specs/006-design-system-tokens-migration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — executes first.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1); blocks US1, US2, US3, and US4.
- **User Stories (Phases 3-6)**:
  - US1 (Phase 3) depends on `biologicalCategories.ts` (Phase 2).
  - US2 (Phase 4) depends on `forceGraphProfiles.ts` (Phase 2).
  - US3 (Phase 5) depends on `tailwind.config.ts` (Phase 2).
  - US4 (Phase 6) depends on Phase 2; can execute in parallel with US1, US2, or US3.
- **Polish (Phase 7)**: Depends on all user story implementation tasks being complete.

### Parallel Execution Opportunities

- `T002` and `T003` in Phase 2 can run in parallel (different config files).
- `T004` and `T005` in Phase 3 (US1) can run in parallel.
- `T006` and `T007` in Phase 4 (US2) can run in parallel.
- `T008`, `T009`, and `T010` in Phase 5 (US3) can run in parallel.
- `T011`, `T012`, and `T013` in Phase 6 (US4) can run in parallel.
- `T014`, `T015`, `T016`, `T017`, and `T018` in Phase 7 (Doc sync) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`).
2. Complete Phase 2: Foundational tokens and categories (`T002`, `T003`).
3. Complete Phase 3: User Story 1 (`T004`, `T005`).
4. **VALIDATE**: Verify pathway list and modal render identical colors with 0 duplicate definitions.

### Incremental Delivery

1. Foundation + US1 (MVP) → Biological role colors consolidated.
2. Add US2 → Graph contrast profiles aligned with `GRAPH_PROFILES`.
3. Add US3 → Auth screen backgrounds and sidebar surface tokenized.
4. Add US4 → Static inline styles eliminated across clinical molecules.
5. Add Polish (Phase 7) → Documentation synchronized, build clean, lint clean.
