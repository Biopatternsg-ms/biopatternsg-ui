# Feature Specification: Design System Inline Styles & Color Token Normalization

**Feature Branch**: `feature/06-design-system-inline-styles-and-color-tokens`  
**Created**: 2026-11-19  
**Status**: Draft  
**Input**: User description: "/home/yacson/Proyectos/biopatternsg-ms/SDD/UI/06-design-system-inline-styles-and-color-tokens (REQ-UI-ARCH-06)"

---

## 1. Executive Summary & Value Proposition

*The Clinical Lens* design system provides a precise visual language for clinical researchers analyzing gene regulatory networks and biological pathways. Currently, several views and components contain hardcoded HEX color palettes, fragmented biological category colors, and static inline `style={{ ... }}` attributes. This introduces visual drift, impairs dark/light high-contrast theme adaptation, and creates maintenance overhead.

This feature establishes a single source of truth for all color tokens (biological palettes, contrast profiles, and brand surfaces) and normalizes styling across the user interface to strictly leverage Tailwind CSS utility classes and design system tokens, guaranteeing zero visual regression and full adherence to the project constitution.

---

## Clarifications

### Session 2026-11-19
- Q: ¿Dónde y cómo debe centralizarse el mapeo de colores por rol biológico (`ROLE_COLORS`) y sus funciones auxiliares (`getRoleColor`, `formatRoleName`) actualmente duplicados en `PathwayDetailModal.tsx` y `PathwayListView.tsx`? → A: Exportar `ROLE_COLORS`, `getRoleColor` y `formatRoleName` directamente desde `src/config/biologicalCategories.ts`.
- Q: ¿Cómo deben estructurarse los patrones de fondo radial decorativos en `Register.tsx` y `RecoveryPassword.tsx` que actualmente utilizan `style={{ backgroundImage: 'radial-gradient(...)' }}` con `#0050cb` hardcodeado? → A: Declarar una utilidad reusable en `tailwind.config.ts` (ej. `bg-grid-dots` / `backgroundImage`) utilizando `theme('colors.primary')`.
- Q: ¿Cómo deben aplicarse los colores dinámicos calculados en tiempo de ejecución (swatches, puntos de color y badges por tipo/rol en `NodeDetailPanel`, `NodeSearchSelect`, `PathwayDetailModal`, `PathwayGraphView` y `ResultsGraph`) para cumplir con la política de cero estilos en línea? → A: Permitir `style={{ backgroundColor: color }}` / `style={{ color }}` únicamente para la propiedad de color dinámico derivada de datos en tiempo de ejecución, manteniendo el 100% de layout, dimensiones, bordes y espaciados en clases utilitarias de Tailwind.

---

## 2. User Scenarios & Testing

### User Story 1 - Consistent Biological Category Palettes Across Pathway Exploration (Priority: P1)

As a clinical researcher analyzing complex pathway networks,  
I want pathway and biological entity colors (such as proteins, genes, and complexes) to be visually identical and predictable across list tables, detail modals, and graph visualizations,  
So that I can immediately identify biological relationships and categories without cognitive friction caused by mismatched colors.

**Why this priority**: Biological category recognition is the primary workflow in BioPatternSG. Inconsistent or conflicting color mappings directly compromise data interpretation and researcher efficiency.

**Independent Test**: Navigate to an experiment's pathway list view and open the pathway detail modal. Compare the color coding for identical entities between the list, modal, and graph view; all colors must match the central biological category token definition exactly.

**Acceptance Scenarios**:
1. **Given** a pathway with categorized biological objects, **When** viewed in the pathway list view (`PathwayListView.tsx`) and the pathway detail modal (`PathwayDetailModal.tsx`), **Then** both views display identical color indicators derived from the centralized biological category palette without duplicating color definitions.
2. **Given** an unknown or dynamic entity type in a graph or modal, **When** rendered by the UI, **Then** it receives a fallback color derived systematically from the central color mapping instead of hardcoded ad-hoc HEX strings.

---

### User Story 2 - Clinical High-Contrast Graph Profiles & Theme Alignment (Priority: P1)

As a researcher inspecting dense node graphs,  
I want graph viewports to reliably respect high-contrast theme profiles (`skyblue`, `white`, `black`) across all graph instances,  
So that I can inspect network topologies under optimal contrast conditions without hardcoded background conflicts.

**Why this priority**: Graph readability is crucial for clinical publication and deep inspection. Hardcoded background HEX colors break contrast profiles and visual consistency between public results and private dashboards.

**Independent Test**: Switch graph contrast profiles in both public results (`ResultsGraph.tsx`) and private dashboard graph views (`PathwayGraphView.tsx`), verifying that viewport backgrounds and associated canvas surfaces faithfully apply the configured `GRAPH_PROFILES` without arbitrary HEX overrides.

**Acceptance Scenarios**:
1. **Given** a researcher views a pathway graph in `PathwayGraphView.tsx`, **When** toggling between contrast themes (skyblue, white, black), **Then** background colors strictly reflect `GRAPH_PROFILES` tokens without hardcoded `#87ceeb` or `#ffffff` literals.
2. **Given** a visitor accesses the public `ResultsGraph.tsx`, **When** the graph loads, **Then** its canvas contrast and node indicators align with the canonical theme tokens defined in `forceGraphProfiles.ts`.

---

### User Story 3 - Normalized Brand & Surface Colors on Public & Dashboard Interfaces (Priority: P2)

As a user navigating authentication and dashboard interfaces,  
I want buttons, cards, sidebars, and input surfaces to display cohesive brand and neutral colors defined by semantic tokens,  
So that the application provides a unified, accessible visual appearance across all viewports.

**Why this priority**: Eliminates visual discrepancies on high-traffic entry points (Registration, Password Recovery, Sidebar navigation) and ensures brand token modifications propagate predictably.

**Independent Test**: Inspect the visual styling of `Register.tsx`, `RecoveryPassword.tsx`, and `Sidebar.tsx`. Confirm all surface backgrounds, accents, and borders utilize Tailwind CSS semantic theme tokens with zero hardcoded `#0050cb` or `#eef3ff` declarations.

**Acceptance Scenarios**:
1. **Given** an unauthenticated user opens the Register or Password Recovery view, **When** viewing the hero panels and actionable elements, **Then** brand blue backgrounds and focus rings utilize Tailwind semantic classes (e.g., `primary` tokens) rather than raw HEX codes.
2. **Given** an authenticated user interacts with the navigation sidebar, **When** viewing active or hover states, **Then** background highlights utilize the design system's semantic color classes.

---

### User Story 4 - Elimination of Non-Canvas Inline Styles (Priority: P2)

As a frontend maintainer and user interacting with multi-step workflows,  
I want clinical components (such as Stepper, NodeDetailPanel, and NodeSearchSelect) to use clean Tailwind CSS utility classes and `cn()` composition instead of static inline `style={{ ... }}` attributes,  
So that component rendering is optimized, styles are maintainable, and responsive behaviors remain predictable.

**Why this priority**: Constitution Principle Quality Standard 1 mandates zero inline styles outside of dynamic canvas pixel math. Inline styles break responsive overrides and complicate theme customization.

**Independent Test**: Audit the DOM and source code of `Stepper.tsx`, `NodeDetailPanel.tsx`, `NodeSearchSelect.tsx`, and modal dialogs. Verify that all layout, dimensions, paddings, and static colors are applied via utility classes with zero inline `style` tags (except where dynamic node coordinates or custom property hooks are strictly necessary).

**Acceptance Scenarios**:
1. **Given** a user navigates the experiment wizard, **When** viewing the `Stepper` component, **Then** progress indicators and connector bars render with responsive Tailwind classes without inline style attributes.
2. **Given** an analyst opens `NodeDetailPanel` or `NodeSearchSelect`, **When** scrolling or interacting with metadata chips, **Then** all borders, backgrounds, and layout properties render purely via utility classes and `cn()`.

---

### Edge Cases

- **Dynamic Color Indicators**: When a component renders a dynamic color indicator whose value is computed at runtime from a categorized entity (e.g., entity badges, swatches, or dot indicators), how should the color be applied without violating the zero-inline-style rule?  
  *Resolution*: Permitted strictly for the dynamic color property (`style={{ backgroundColor: color }}` or `style={{ color }}`), while all surrounding structure, dimensions, paddings, borders, and flexbox styles must strictly use Tailwind utility classes.
- **Dynamic Stepper Progress**: The active progress bar width in `Stepper.tsx` depends on the step index at runtime.  
  *Resolution*: The dynamic percentage width (`style={{ width: `${pct}%` }}`) is permitted as a runtime dynamic mathematical property, while its height, background color (`bg-primary`), position, and transitions are governed by Tailwind utility classes.
- **Canvas / WebGL Viewports**: Force-directed graphs require dynamic canvas coordinate math and frame rendering.  
  *Resolution*: HTML5 Canvas internal drawing math (`ctx.fillStyle`, coordinates) remains in canvas engine logic, while container wrappers and DOM overlays must strictly use Tailwind utility classes.
- **Missing Tailwind Tokens**: If a hardcoded color (e.g., `#0050cb` or `#eef3ff`) does not map directly to an existing token in `tailwind.config.ts`.  
  *Resolution*: Map `#0050cb` to the existing `primary` token in `tailwind.config.ts`, add `"surface-sidebar": "#eef3ff"` (or reuse `surface-section` where appropriate), and add the `bg-grid-dots` background utility.

---

## 3. Requirements

### Functional Requirements

- **FR-001**: System MUST centralize `ROLE_COLORS`, `getRoleColor`, and `formatRoleName` directly in `src/config/biologicalCategories.ts`, eliminating the duplicate 10-color HEX arrays and helper functions across `PathwayDetailModal.tsx` and `PathwayListView.tsx`.
- **FR-002**: System MUST configure `PathwayGraphView.tsx` and `ResultsGraph.tsx` to read contrast profile background colors exclusively from `GRAPH_PROFILES` in `src/config/forceGraphProfiles.ts`.
- **FR-003**: System MUST eliminate hardcoded brand and surface HEX colors (`#0050cb`, `#eef3ff`, `#87ceeb`, `#ffffff`) across `Register.tsx`, `RecoveryPassword.tsx`, `Sidebar.tsx`, `PathwayGraphView.tsx`, and `ResultsGraph.tsx`, configuring semantic utilities in `tailwind.config.ts` (including `bg-grid-dots` backed by `theme('colors.primary')` for auth screens) and semantic surface tokens.
- **FR-004**: System MUST refactor static inline `style={{ ... }}` attributes in `src/components/molecules/Stepper.tsx`, `src/components/molecules/NodeDetailPanel.tsx`, `src/components/molecules/NodeSearchSelect.tsx`, `src/components/molecules/PathwayDetailModal.tsx`, `src/modules/dashboard/experiments/PathwayListView.tsx`, `src/modules/dashboard/experiments/PathwayGraphView.tsx`, `src/modules/public/ResultsGraph.tsx`, `src/modules/public/Register.tsx`, and `src/modules/public/RecoveryPassword.tsx` to use Tailwind CSS utility classes and `cn()`.
- **FR-005**: System MUST permit the `style` attribute strictly and exclusively for dynamic runtime data colors (`backgroundColor` or `color` on dots, swatches, and badges, as well as the dynamic percentage `width` of the `Stepper` active bar), while 100% of static layout, positioning, dimensions, padding, margins, borders, and typography MUST use Tailwind CSS utility classes and `cn()`.
- **FR-006**: System MUST synchronize component documentation in `.agents/components/` for any modified atoms or molecules (`Stepper`, `NodeDetailPanel`, `NodeSearchSelect`, `PathwayDetailModal`), updating their markdown specifications in alignment with Constitution Principle II.
- **FR-007**: System MUST preserve 100% visual fidelity and zero regression in layout, contrast, and element sizing across all updated views.

---

## 4. Key Entities

- **BiologicalCategoryPalette**: Centralized mapping associating biological categories (Proteins, Genes, Complexes, Pathways, Chemicals, Diseases) with designated primary colors, subtle background badges, and border tokens.
- **GraphContrastProfile**: Standardized contrast configuration (`GRAPH_PROFILES`) providing background, grid, label, and link colors for `skyblue`, `white`, and `black` visualization modes.
- **DesignSystemToken**: Named semantic color and spacing tokens configured in `tailwind.config.ts` representing brand identity, surface elevations, text hierarchies, and state highlights.

---

## 5. Success Criteria

### Measurable Outcomes

- **SC-001**: 0 duplicate biological color arrays remain across the codebase (100% centralized in `biologicalCategories.ts` or `forceGraphProfiles.ts`).
- **SC-002**: 0 non-canvas static inline `style={{ ... }}` attributes exist in target components and module views.
- **SC-003**: 0 hardcoded HEX color codes (`#0050cb`, `#eef3ff`, `#87ceeb`, `#ffffff`) remain in component templates outside of central token configuration files.
- **SC-004**: 100% of affected atomic components in `src/components/` have their documentation synchronized in `.agents/components/`.
- **SC-005**: 100% clean production build (`npm run build`) and clean linter run (`npm run lint` with 0 errors and 0 warnings).
- **SC-006**: Zero visual regression across all pathway views, graph canvases, authentication screens, and wizard steppers.

---

## 6. Assumptions & Dependencies

- **Design Tokens**: The existing `tailwind.config.ts` file can be safely extended with semantic aliases if a specific brand shade is not currently mapped.
- **Visual Palette Invariance**: The visual appearance (hex values, contrast ratios) of the application must not change; this is a refactoring of how styles and colors are declared and consumed.
- **Canvas Exceptions**: Internal pixel drawing commands for HTML5 Canvas / Three.js math inside graph rendering hooks are explicitly exempted from the inline style ban, as documented in Constitution Quality Standard 1.
- **Browser Compatibility**: Tailwind CSS utility classes generated are compatible with modern desktop evergreen browsers (Chrome, Firefox, Safari, Edge).
