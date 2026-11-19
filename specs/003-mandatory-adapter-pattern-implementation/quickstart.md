# Quickstart & Verification Guide: Mandatory Adapter Pattern

## 1. Prerequisites

Ensure Node.js 22+ and npm are available in PATH:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
node -v
npm -v
```

## 2. Boundary Verification Scenarios

### Scenario 1: Adapter Files Completeness
Verify all five constitutional adapters exist in `src/adapters/`:

```bash
ls -la src/adapters/
```
Expected output:
- `authAdapter.ts`
- `userAdapter.ts`
- `networkAdapter.ts`
- `experimentAdapter.ts`
- `pathwayAdapter.ts`

### Scenario 2: Zero DTO Imports in UI Modules and Components
Run static analysis grep asserting 0 matches for direct service model imports:

```bash
grep -rnE "from ['\"].*services/models" src/modules src/components || echo "PASS: Zero service model imports in UI"
```

### Scenario 3: Clean TypeScript Compilation
Compile the entire project in strict mode:

```bash
npm run build
```

### Scenario 4: ESLint Code Health
Lint all TypeScript and TSX files:

```bash
npm run lint
```
