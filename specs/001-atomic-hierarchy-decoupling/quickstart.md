# Quickstart & Verification Guide: Atomic Design Hierarchy Decoupling

**Feature**: `001-atomic-hierarchy-decoupling`  
**Status**: Ready for Verification  
**Date**: 2026-11-18  

---

## 1. Prerequisites

- Node.js >= 20.x
- Dependencies installed: `npm install`
- Working branch: `feature/01-atomic-design-hierarchy-decoupling`

---

## 2. Automated Quality Gates

Run these verification commands in the repository root to prove architectural compliance:

### 2.1. TypeScript Compilation & Strict Type Check
```bash
npm run build
```
- **Expected Outcome**: Exits with code `0`. All imports to `@/domain/models/Graph`, `@/config/forceGraphProfiles`, and `@/components/molecules/Breadcrumb` resolve cleanly with zero type errors.

### 2.2. Architectural Boundary Verification (ESLint)
```bash
npm run lint
```
- **Expected Outcome**: Exits with code `0`. Zero violations reported by `no-restricted-imports` across `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/`, and `src/domain/models/`.

### 2.3. Automated Dependency Graph Grep Check
Verify that no banned imports remain in component tiers:
```bash
# Check 1: No atoms importing other atoms or organisms
git grep -E "from ['\"]@/components/(atoms|molecules|organisms)" src/components/atoms/

# Check 2: No molecules importing organisms, services, or router hooks
git grep -E "from ['\"]@/components/organisms" src/components/molecules/
git grep -E "from ['\"]@/(services|adapters|context)" src/components/molecules/
git grep -E "from ['\"]react-router-dom" src/components/molecules/

# Check 3: No organisms importing services or adapters
git grep -E "from ['\"]@/(services|adapters)" src/components/organisms/
```
- **Expected Outcome**: All three checks return zero matches (empty output).

---

## 3. Manual Functional Verification Scenarios

### Scenario 1: Biological Network Graph & Themes
1. Launch local dev server: `npm run dev`
2. Navigate to `/dashboard/network` or open an experiment network view.
3. Toggle between contrast modes: **Dark**, **Light**, and **Clinical Blue**.
4. **Validation**: Graph canvas renders with 60 FPS fluidity, nodes/links reflect the selected profile colors, and switching modes does not trigger camera resets or console warnings.

### Scenario 2: Biological Roles Modal Inspection
1. From the network graph view, click on any biological node.
2. Open the **Biological Roles** action.
3. **Validation**: The modal displays a loading spinner while `useBiologicalRoles` queries the data, then renders the role badges and metrics cleanly. Closing the modal returns focus to the graph without unmount errors.

### Scenario 3: Breadcrumb & Pipeline Step Navigation
1. Navigate to `/dashboard/experiments/configure-inferences` or any multi-step wizard.
2. Click on the back button in `ManualStepHeader` or click intermediate steps in `Breadcrumb`.
3. **Validation**: Smooth navigation occurs to preceding steps without full-page reloads or route context desynchronization.

### Scenario 4: User Authentication & Session Logout
1. Access the public landing page (`/`).
2. Enter credentials in `HeroSection` and submit the login form.
3. Verify landing transitions to the dashboard upon successful auth dispatch.
4. Click on `UserMenu` in `TopBar` and click **Log out**.
5. **Validation**: Session terminates cleanly and the user is redirected to the public view.

---

## 4. Documentation Catalog Verification

Check that all modified components have updated catalog documentation:
```bash
ls -la .agents/components/molecules/Breadcrumb.md
git diff .agents/components/README.md
```
- **Expected Outcome**: Documentation reflects updated prop signatures, molecule tier classification, and pure presentational contracts.
