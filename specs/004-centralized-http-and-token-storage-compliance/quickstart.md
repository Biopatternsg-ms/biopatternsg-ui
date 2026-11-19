# Quickstart & Verification Guide: Centralized HTTP & Token Storage Compliance

**Feature Branch**: `feature/04-centralized-http-and-token-storage-compliance`  
**Date**: 2026-11-19  
**Spec Reference**: [spec.md](./spec.md)

---

## Prerequisites

- Node.js 22+ (via NVM: `export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"`)
- Active feature branch: `feature/04-centralized-http-and-token-storage-compliance`

---

## Verification & Quality Gates

### 1. Architectural Boundary Checks (Automated Static Checks)

Run the following commands from the project root to guarantee zero leaks:

```bash
# Gate 1: Verify ZERO localStorage references outside tokenStorage.ts
# Expected: Only matches src/core/http/tokenStorage.ts (and explanatory comments)
git grep "localStorage" src/

# Gate 2: Verify ZERO raw fetch() calls outside httpClient.ts
# Expected: Exactly one match in src/core/http/httpClient.ts:39
git grep "fetch(" src/

# Gate 3: Verify ZERO hardcoded localhost fallback URLs in apiConfig.ts
# Expected: 0 matches for localhost:8008
git grep "localhost:8008" src/services/apiConfig.ts
```

---

### 2. TypeScript Compilation Gate

Ensure 100% type safety without compilation warnings or errors:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run build
```

**Expected Outcome**: Vite production build completes successfully with exit code 0.

---

### 3. ESLint Code Quality Gate

Ensure 0 lint violations across the codebase:

```bash
export PATH="/home/yacson/.nvm/versions/node/v22.23.4/bin:$PATH"
npm run lint
```

**Expected Outcome**: Clean exit with 0 errors and 0 warnings.

---

### 4. Functional Verification Scenarios

1. **Session Restoration (User Story 1)**:
   - Log into the application (or set an `access_token` in storage).
   - Refresh the browser.
   - Verify `AuthContext` initializes in authenticated state using `getAccessToken()` from `tokenStorage.ts`.

2. **Graph Example Loading (User Story 2)**:
   - Navigate directly to `/results-graph` in the browser without active pipeline execution data.
   - Verify that the default example graph loads nodes and links via `templateGraphService.ts` and renders the interactive network.
   - Inspect network tab: requests to `/templates/graph-nodes-example.txt` and `/templates/graph-links-example.txt` succeed with status 200.

3. **Production Base URL Fallback (User Story 3)**:
   - Verify that in production mode (`import.meta.env.DEV = false`) when `VITE_API_URL` is omitted, requests are directed to `/api/...`.
