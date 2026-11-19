# Architectural & Design Research: Design System Inline Styles & Color Token Normalization

**Feature**: `006-design-system-tokens-migration`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Research Overview & Problem Analysis

*The Clinical Lens* visual system dictates zero arbitrary colors and zero static inline styles outside of dynamic canvas drawing. A detailed codebase audit revealed four primary violation clusters:

1. **Duplicated Biological Color Palettes**:
   - `PathwayDetailModal.tsx` and `PathwayListView.tsx` both independently declare `ROLE_COLORS` (10 HEX entries), `getRoleColor()`, and `formatRoleName()`.
2. **Hardcoded Graph Background & Contrast Overrides**:
   - `PathwayGraphView.tsx` and `ResultsGraph.tsx` hardcode `#87ceeb` and `#ffffff` instead of querying `GRAPH_PROFILES` from `src/config/forceGraphProfiles.ts`.
3. **Hardcoded Brand & Surface Colors**:
   - `Register.tsx` and `RecoveryPassword.tsx` hardcode `#0050cb` inside an inline radial gradient.
   - `Sidebar.tsx` hardcodes `#eef3ff` in its navigation container class string (`bg-[#eef3ff]`).
4. **Non-Canvas Inline Style Attributes**:
   - `Stepper.tsx`, `NodeDetailPanel.tsx`, `NodeSearchSelect.tsx`, and `PathwayDetailModal.tsx` use `style={{ ... }}` for layout, colors, and background opacity.

---

## 2. Architectural Decisions & Rationales

### Decision 1: Centralize Biological Role Colors in `src/config/biologicalCategories.ts`

- **Decision**: Consolidate `ROLE_COLORS: Record<string, string>`, `getRoleColor(role?: string): string`, and `formatRoleName(role?: string): string` directly into `src/config/biologicalCategories.ts`. Re-export them so that `PathwayListView.tsx`, `PathwayDetailModal.tsx`, and future components import from a single canonical location.
- **Rationale**:
  - `biologicalCategories.ts` is already the constitutional single source of truth for biological entities (Proteins, Genes, Ligands, Receptors, etc.).
  - Prevents drift where adding or modifying a role's clinical indicator color would require updating multiple views.
- **Alternatives Considered**:
  - *Dedicated `pathwayRoleColors.ts` file*: Rejected in favor of consolidating all biological categorization in `src/config/biologicalCategories.ts` to prevent file sprawl.
  - *Pure Tailwind class mapping*: Rejected because Canvas graphs and dynamic SVG/swatch rendering require raw color strings (hex values) for rendering contexts.

### Decision 2: Strict Consumption of `GRAPH_PROFILES` for Viewport Backgrounds

- **Decision**: Refactor `PathwayGraphView.tsx` and `ResultsGraph.tsx` to read background swatches and container colors strictly from `GRAPH_PROFILES` (`src/config/forceGraphProfiles.ts`):
  - `black`: `#111827`
  - `white`: `#ffffff`
  - `skyblue`: `#87ceeb`
- **Rationale**:
  - Clinical graph visualization requires high contrast adaptation for publications and low-light clinical analysis.
  - Hardcoded literals bypass profile toggles and prevent dynamic theme re-skinning.
- **Alternatives Considered**:
  - *Arbitrary HEX overrides*: Strictly rejected as a constitutional violation of Quality Standard 3.

### Decision 3: Abstract Theme Tokens & Radial Grid Pattern in `tailwind.config.ts`

- **Decision**:
  1. Map `#0050cb` to `colors.primary` (already existing in `tailwind.config.ts`).
  2. Add `surface-sidebar: "#eef3ff"` to `theme.extend.colors` in `tailwind.config.ts`.
  3. Add `grid-dots` utility in `theme.extend.backgroundImage`:
     ```ts
     backgroundImage: {
       "grid-dots": "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
     }
     ```
  4. In `Register.tsx` and `RecoveryPassword.tsx`, replace `style={{ backgroundImage: "...", backgroundSize: "40px 40px" }}` with `className="absolute inset-0 pointer-events-none opacity-[0.02] bg-grid-dots bg-[size:40px_40px]"`.
  5. In `Sidebar.tsx`, replace `bg-[#eef3ff]` with `bg-surface-sidebar`.
- **Rationale**:
  - Removes all hardcoded brand/surface colors from HTML templates.
  - Ensures changes to brand tokens automatically propagate across all authentication and navigation surfaces.
- **Alternatives Considered**:
  - *Arbitrary Tailwind class `bg-[radial-gradient(...)]`*: Rejected because raw hex strings in template markup still violate the tokenization goal.

### Decision 4: Delimit Dynamic Runtime Styles vs. Zero Static Inline Styles

- **Decision**:
  - **Permitted dynamic styles**:
    1. Runtime color injection on dots and swatches: `style={{ backgroundColor: color }}` or `style={{ color }}` when `color` is a dynamically resolved value from `getRoleColor` or `colorForType`.
    2. Dynamic percentage width on `Stepper.tsx`: `style={{ width: `${progressPercent}%` }}` where percentage is a runtime calculated number.
  - **Strictly forbidden in `style={{ ... }}`**:
    - Layout (`flex`, `grid`, `position`, `display`).
    - Dimensions (`height`, `width` unless mathematical dynamic percentage, `padding`, `margin`).
    - Borders, border radii, typography, font weights, opacities, and z-indexes. All of these MUST use Tailwind utility classes.
- **Rationale**:
  - Allows clean data-driven UI while preserving the performance, caching, and responsive power of Tailwind CSS.
  - Complies with Constitution Quality Standard 1.

### Decision 5: Synchronize Atomic Component Documentation

- **Decision**: Update `.agents/components/molecules/Stepper.md`, `NodeDetailPanel.md`, `NodeSearchSelect.md`, and `PathwayDetailModal.md` to reflect tokenized styling and the updated prop/styling interfaces.
- **Rationale**: Constitution Principle II strictly enforces continuous documentation synchronization with 0 lag.

---

## 3. Best Practices & Verification Plan

- **Static Token Inspection**: Verify 0 occurrences of `#0066ff`, `#0050cb`, `#eef3ff`, `#87ceeb` outside config files using `git grep`.
- **Build Quality Gate**: Verify `npm run build` exits with code 0.
- **Lint Quality Gate**: Verify `npm run lint` exits with 0 errors and 0 warnings.
- **Visual Regression Validation**: Confirm identical visual appearance across Stepper, Sidebar, Register, RecoveryPassword, PathwayListView, PathwayDetailModal, and graph views.
