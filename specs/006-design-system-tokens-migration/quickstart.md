# Quickstart & Verification Guide: Design System Tokens & Style Normalization

**Feature**: `006-design-system-tokens-migration`  
**Date**: 2026-11-19  
**Status**: Ready  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Prerequisites

- Node.js 22+ (via NVM: `export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"`)
- Active feature branch: `feature/06-design-system-inline-styles-and-color-tokens`

---

## 2. Verification Commands & Quality Gates

### Gate 1: Elimination of Duplicated Biological Palette

Verify that `ROLE_COLORS` is defined exclusively in `src/config/biologicalCategories.ts` and consumed cleanly:

```bash
# Check that PathwayDetailModal and PathwayListView import from biologicalCategories
git grep "ROLE_COLORS" src/
```

**Expected Outcome**: Only `src/config/biologicalCategories.ts` defines `ROLE_COLORS`. `PathwayDetailModal.tsx` and `PathwayListView.tsx` import it (or `getRoleColor`).

---

### Gate 2: Elimination of Hardcoded Surface & Brand HEX Strings

Verify that `#0050cb`, `#eef3ff`, `#87ceeb` do not appear as hardcoded strings outside design system configs:

```bash
# Check for stray #0050cb or #eef3ff in views
git grep -in "#0050cb" src/modules/ src/components/
git grep -in "#eef3ff" src/modules/ src/components/
git grep -in "#87ceeb" src/modules/ src/components/
```

**Expected Outcome**: 0 matches in `src/modules/` and `src/components/`.

---

### Gate 3: TypeScript Compilation & Production Build

Ensure that all imported helpers and tokenized styles type-check cleanly:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run build
```

**Expected Outcome**: Vite production build completes successfully with exit code 0 and 0 errors.

---

### Gate 4: ESLint Code Quality Gate

Verify that there are 0 lint errors and 0 warnings:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run lint
```

**Expected Outcome**: Clean exit with code 0 (0 errors, 0 warnings).

---

## 3. Visual & Functional Scenarios

1. **Authentication Screens**:
   - Navigate to `/register` and `/recovery-password`.
   - Verify the decorative dot pattern appears identically to the previous version, now rendered via `bg-grid-dots`.
2. **Dashboard Navigation**:
   - Navigate to `/dashboard`.
   - Verify the sidebar background displays `#eef3ff` via `bg-surface-sidebar` with smooth transitions.
3. **Pathway Exploration**:
   - Open `/dashboard/experiments/:networkId/execution/:experimentId`.
   - Inspect pathway list and open the pathway detail modal.
   - Confirm entity roles (Ligand, Protein, Transcription Factor, etc.) render with vibrant, synchronized color indicators.
4. **Graph Contrast Profiles**:
   - Open graph visualization in private dashboard and public results.
   - Toggle between `black`, `white`, and `skyblue` contrast modes.
   - Confirm canvas and background surfaces adjust cleanly according to `GRAPH_PROFILES`.
