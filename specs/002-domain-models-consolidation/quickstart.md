# Quickstart & Verification Guide: Pure Domain Models Consolidation

**Feature**: `specs/002-domain-models-consolidation`  
**Status**: Ready for Verification  
**Date**: 2026-11-18  

---

## 1. Prerequisites

- Node.js >= 20.x
- Branch: `feature/02-domain-models-consolidation`
- Dependencies installed: `npm install`

---

## 2. Automated Quality Gates

Execute these commands from `services/biopatternsg-ui`:

### 2.1. Domain Purity Check (Principle III Verification)

Ensure zero external UI/React/service/adapter dependencies inside `src/domain/models/`:

```bash
# Check 1: Zero imports from react, lucide-react, or UI frameworks in domain
git grep -E "from ['\"](react|react-dom|lucide-react)" src/domain/models/

# Check 2: Zero imports from components, modules, services, or adapters in domain
git grep -E "from ['\"]@/(components|modules|services|adapters)" src/domain/models/
```
- **Expected Outcome**: Zero matches (empty output).

### 2.2. Zero Inline Entity Declarations in Modules

Ensure module screens no longer declare inline business entities:

```bash
# Check 3: No inline AlignedObjectItem in UpdateAlignedObjects
git grep "interface AlignedObjectItem" src/modules/dashboard/experiments/UpdateAlignedObjects.tsx

# Check 4: No manual step LucideIcon coupling in domain
git grep "LucideIcon" src/domain/models/
```
- **Expected Outcome**: Zero matches (empty output).

### 2.3. Zero Inline Entity Declarations in Service Files

Ensure service files do not define business models inline:

```bash
# Check 5: No inline Network interface or PaginatedResponse in networkService.ts
git grep -E "export interface (Network|PaginatedResponse)" src/services/networkService.ts
```
- **Expected Outcome**: Zero matches (empty output, or only DTO interfaces with `Dto` suffix).

### 2.4. TypeScript Strict Compilation & Linting

```bash
npm run lint
npm run build
```
- **Expected Outcome**: Exits with code `0`. Zero type errors, zero linter warnings.

---

## 3. Manual Functional Verification Scenarios

### Scenario 1: Biological Networks Catalog & Pagination
1. Start dev server: `npm run dev`
2. Open network dashboard at `/dashboard/networks`
3. Verify that networks list loads, pagination numbers display correctly, and dates format properly via ISO string normalization.

### Scenario 2: Aligned Objects Management View
1. Navigate to `/dashboard/experiments/:experimentId/aligned-objects`
2. Verify that aligned entities render, status tags reflect alignment (`ALIGNED_AS`, etc.), and synonyms can be searched and added without TypeScript runtime issues.

### Scenario 3: Biological Objects & Experiment Execution
1. Navigate to `/dashboard/experiments/:experimentId/biological-objects`
2. Modify a biological role or toggle modified status
3. Save changes and navigate to `/dashboard/experiments/:experimentId/execution`
4. Verify manual pipeline steps display icons and action buttons correctly.
