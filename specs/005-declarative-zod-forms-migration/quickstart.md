# Quickstart & Verification Guide: Declarative Zod & React Hook Form Migration

**Feature Branch**: `feature/05-declarative-zod-forms-migration`  
**Date**: 2026-11-19  
**Spec Reference**: [spec.md](./spec.md)

---

## Prerequisites

- Node.js 22+ (via NVM: `export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"`)
- Active feature branch: `feature/05-declarative-zod-forms-migration`

---

## Verification & Quality Gates

### 1. Static Schema Inference Gate

Verify that `CreateNetwork.tsx` infers form types via `z.infer` without manual interfaces:

```bash
# Check that DataFormConfig uses z.infer or CreateNetworkFormValues
git grep "z.infer<typeof createNetworkSchema>" src/modules/dashboard/networks/CreateNetwork.tsx
```

### 2. TypeScript Compilation Gate

Ensure 100% type safety and clean schema-form type binding:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run build
```

**Expected Outcome**: Vite production build completes successfully with exit code 0.

### 3. ESLint Code Quality Gate

Ensure 0 lint violations across refactored form modules:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run lint
```

**Expected Outcome**: Clean exit with 0 errors and 0 warnings.

---

## Functional Verification Scenarios

1. **Step-by-Step Wizard Validation (`CreateExperiment.tsx`)**:
   - Navigate to `/dashboard/networks/:networkId/experiments/create`.
   - On Step 1, click "Next" without typing a name: verify inline error `"Experiment name is required."` appears and stepper does NOT advance.
   - Enter name and description, click "Next": verify Stepper advances to Step 2.
   - On Step 2, enter `identity: 150` or `end < start`: verify constraint error blocks transition.
   - On Step 3, attach a sample CSV or add an expert object; advance to Step 4.
   - Complete Step 4 and submit: verify experiment saves and redirects cleanly.

2. **Edit Mode Population**:
   - Open an existing experiment in edit mode: verify all fields in all 4 steps populate from backend pipeline data via `reset()`.

3. **Inference Configuration**:
   - Navigate to `/dashboard/networks/:networkId/experiments/:experimentId/inferences/configure`.
   - Deselect all categories and submit: verify schema validation error `"At least one category must be selected."` displays.
