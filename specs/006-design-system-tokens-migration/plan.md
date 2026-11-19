# Implementation Plan: Design System Inline Styles & Color Token Normalization

**Branch**: `feature/06-design-system-inline-styles-and-color-tokens` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-design-system-tokens-migration/spec.md` (`REQ-UI-ARCH-06`)

---

## 1. Summary

This feature resolves all non-compliant styling patterns across *The Clinical Lens* design system by:
1. Centralizing biological entity role colors (`ROLE_COLORS`), `getRoleColor()`, and `formatRoleName()` in `src/config/biologicalCategories.ts`, eliminating code and palette duplication in `PathwayDetailModal.tsx` and `PathwayListView.tsx`.
2. Normalizing graph contrast profile backgrounds in `PathwayGraphView.tsx` and `ResultsGraph.tsx` to strictly consume `GRAPH_PROFILES` from `src/config/forceGraphProfiles.ts`.
3. Abstracting hardcoded brand/surface colors (`#0050cb`, `#eef3ff`) and radial grid patterns into `tailwind.config.ts` (`primary`, `surface-sidebar`, and `bg-grid-dots`).
4. Eliminating static inline `style={{ ... }}` attributes across `Stepper.tsx`, `NodeDetailPanel.tsx`, `NodeSearchSelect.tsx`, `PathwayDetailModal.tsx`, `Register.tsx`, and `RecoveryPassword.tsx`, replacing them with Tailwind utility classes and `cn()`.
5. Synchronizing component documentation in `.agents/components/` per Constitution Principle II.

---

## 2. Technical Context

- **Language/Version**: TypeScript 5.9+, React 19
- **Primary Dependencies**: Tailwind CSS 3.4+, `clsx`, `tailwind-merge` (`cn()` utility), Lucide React
- **Storage**: N/A (Pure presentation and design system configuration)
- **Testing & Verification**: TypeScript strict mode (`npm run build`), ESLint 9 (`npm run lint`), Static token inspection (`git grep`)
- **Target Platform**: Desktop and responsive modern evergreen web browsers (Chrome, Firefox, Safari, Edge)
- **Project Type**: Single-Page Application (SPA) frontend in `services/biopatternsg-ui`
- **Performance Goals**: Zero render overhead; zero runtime style recalculations; 100% utility class utilization
- **Constraints**: Zero visual regressions; zero hardcoded brand/surface HEX outside configuration files; zero static inline styles outside canvas coordinates
- **Scale/Scope**: 1 configuration file (`biologicalCategories.ts`), 1 Tailwind config (`tailwind.config.ts`), 5 atomic components, 5 module views, 5 documentation files

---

## 3. Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitutional Principle | Requirement | Plan Compliance Status |
|---|---|---|
| **Principle I: Strict Atomic Design** | 3 levels (Atoms, Molecules, Organisms); views in `src/modules/` | **PASS** — Changes respect existing component placement without moving or leaking concerns. |
| **Principle II: Continuous Doc Sync** | Update documentation in `.agents/components/` for any modified component | **PASS** — Tasks explicitly include updating `.agents/components/` for `Stepper`, `NodeDetailPanel`, `NodeSearchSelect`, `PathwayDetailModal`, and `Sidebar`. |
| **Principle III: Pure Domain Modeling** | Domain models in `src/domain/models/` without UI coupling | **PASS** — Design token changes remain in `src/config/` and component layers; no domain changes. |
| **Principle IV: Mandatory Adapter Pattern** | API transformations isolated in `src/adapters/` | **PASS** — No backend DTOs or API schemas affected. |
| **Principle V: Encapsulated Service Layer** | Network communication through `httpClient.ts` | **PASS** — No network changes involved. |
| **Principle VI: Declarative Forms** | React Hook Form + Zod for user input | **PASS** — No forms modified. |
| **Principle VII: RBAC & Security** | Route guards and centralized token storage | **PASS** — No routing or auth logic altered. |
| **Quality Standard 1: Zero Inline Styles** | Visual presentation via Tailwind CSS utility classes; zero static `style={{ ... }}` | **PASS** — 100% of static inline styles refactored to Tailwind classes. Dynamic data colors and dynamic math widths strictly delimited. |
| **Quality Standard 2: Safe Class Merging** | Class composition with `cn(...)` | **PASS** — All refactored styles use `cn()`. |
| **Quality Standard 3: Standard Biological Categorization** | Colors strictly from `biologicalCategories.ts` and `forceGraphProfiles.ts` | **PASS** — Eliminates duplicated palettes and centralizes all role colors. |

---

## 4. Project Structure & Affected Files

```text
services/biopatternsg-ui/
├── tailwind.config.ts                                           # Extend colors (surface-sidebar) & backgroundImage (grid-dots)
├── src/
│   ├── config/
│   │   ├── biologicalCategories.ts                              # Centralize ROLE_COLORS, getRoleColor, formatRoleName
│   │   └── forceGraphProfiles.ts                                # Reference GRAPH_PROFILES (existing)
│   ├── components/
│   │   ├── molecules/
│   │   │   ├── Stepper.tsx                                      # Refactor progress bar width and static classes
│   │   │   ├── NodeDetailPanel.tsx                              # Refactor static styles to Tailwind; dynamic color isolated
│   │   │   ├── NodeSearchSelect.tsx                             # Refactor swatch dot to Tailwind
│   │   │   └── PathwayDetailModal.tsx                           # Consume biologicalCategories; eliminate duplicate palette & static styles
│   │   └── organisms/
│   │       └── Sidebar.tsx                                      # Replace bg-[#eef3ff] with bg-surface-sidebar
│   └── modules/
│       ├── public/
│       │   ├── Register.tsx                                     # Replace inline radial gradient with bg-grid-dots
│       │   ├── RecoveryPassword.tsx                             # Replace inline radial gradient with bg-grid-dots
│       │   └── ResultsGraph.tsx                                 # Consume GRAPH_PROFILES for background swatches
│       └── dashboard/experiments/
│           ├── PathwayListView.tsx                              # Consume biologicalCategories; eliminate duplicate palette
│           └── PathwayGraphView.tsx                             # Consume GRAPH_PROFILES for background swatches
└── .agents/
    └── components/
        ├── molecules/
        │   ├── Stepper.md                                       # Documentation sync
        │   ├── NodeDetailPanel.md                               # Documentation sync
        │   ├── NodeSearchSelect.md                              # Documentation sync
        │   └── PathwayDetailModal.md                            # Documentation sync
        └── organisms/
            └── Sidebar.md                                       # Documentation sync
```

---

## 5. Implementation Roadmap & Phases

### Phase 1: Core Design System Configuration & Tokens
1. Extend `tailwind.config.ts` with `surface-sidebar: "#eef3ff"` and `backgroundImage: { "grid-dots": "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)" }`.
2. Add `ROLE_COLORS`, `DEFAULT_ROLE_COLOR`, `getRoleColor()`, and `formatRoleName()` to `src/config/biologicalCategories.ts`.

### Phase 2: Pathway Views & Biological Role Color Consolidation
1. Refactor `src/modules/dashboard/experiments/PathwayListView.tsx` to import `getRoleColor` and `formatRoleName` from `biologicalCategories.ts`.
2. Refactor `src/components/molecules/PathwayDetailModal.tsx` to import `getRoleColor` and `formatRoleName` from `biologicalCategories.ts` and replace static inline styles with Tailwind utility classes.

### Phase 3: Graph Contrast Profiles & Theme Alignment
1. Refactor `src/modules/dashboard/experiments/PathwayGraphView.tsx` to read contrast background options from `GRAPH_PROFILES`.
2. Refactor `src/modules/public/ResultsGraph.tsx` to read contrast background options from `GRAPH_PROFILES`.

### Phase 4: Public Auth Screens & Navigation Surface Normalization
1. Update `src/modules/public/Register.tsx` to use `bg-grid-dots bg-[size:40px_40px]`.
2. Update `src/modules/public/RecoveryPassword.tsx` to use `bg-grid-dots bg-[size:40px_40px]`.
3. Update `src/components/organisms/Sidebar.tsx` to use `bg-surface-sidebar`.

### Phase 5: Component Inline Style Elimination & Documentation Sync
1. Refactor `src/components/molecules/Stepper.tsx`, `NodeDetailPanel.tsx`, and `NodeSearchSelect.tsx` to eliminate all static inline styles.
2. Synchronize component documentation in `.agents/components/` for `Stepper.md`, `NodeDetailPanel.md`, `NodeSearchSelect.md`, `PathwayDetailModal.md`, and `Sidebar.md`.
3. Run verification quality gates: `npm run build` and `npm run lint`.
