# Implementation Plan: Centralized HTTP Client & Token Storage Compliance

**Branch**: `feature/04-centralized-http-and-token-storage-compliance` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-centralized-http-and-token-storage-compliance/spec.md`

---

## Summary

Resolve three architectural compliance violations in BioPatternSG UI to enforce 100% adherence to Principle V (*Encapsulated Service Layer & Centralized HTTP*) and Principle VII (*Robust Security & RBAC*):
1. **Centralized Token Access**: Replace direct `localStorage.getItem("access_token")` in `src/context/AuthContext.tsx` with `getAccessToken()` from `@/core/http/tokenStorage`, adding safe environment guards to prevent SSR / non-browser runtime errors.
2. **Encapsulated Graph Template Loading**: Create `src/services/templateGraphService.ts` utilizing `baseFetch` from `@/core/http/httpClient` with `{ Accept: "text/plain" }` to load example graph templates, eliminating all direct browser `fetch()` calls from `src/modules/public/ResultsGraph.tsx`.
3. **Safe Production URL Configuration**: Replace the hardcoded `"http://localhost:8008/api"` fallback in `src/services/apiConfig.ts` with `"/api"` (matching reverse proxy setups like `.env.production`) when `VITE_API_URL` is undefined or empty in production mode.

---

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 22+, React 19.2 (Vite SPA)  
**Primary Dependencies**: React 19, Tailwind CSS 3.4, Lucide React  
**Storage**: `src/core/http/tokenStorage.ts` (centralized browser localStorage encapsulation)  
**Testing**: TypeScript strict compilation (`npm run build`), ESLint (`npm run lint`), Grep-based static analysis boundary checks  
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page Web application frontend (Vite SPA)  
**Performance Goals**: Instant token lookup, parallel static template asset loading via `Promise.all`, zero extraneous re-renders  
**Constraints**:
- Strict compliance with Principle V (*Encapsulated Service Layer & Centralized HTTP*) and Principle VII (*Robust Security & RBAC*).
- Exactly 0 direct invocations of `localStorage` / `sessionStorage` in `src/` outside `src/core/http/tokenStorage.ts`.
- Exactly 0 raw `fetch(` invocations in `src/` outside `src/core/http/httpClient.ts`.
- Exactly 0 instances of `http://localhost` in production configuration branches in `src/services/apiConfig.ts`.
- Safe execution in non-browser / SSR contexts without throwing `ReferenceError`.

**Scale/Scope**:
- 1 updated context (`AuthContext.tsx`)
- 1 fortified core storage module (`tokenStorage.ts`)
- 1 new dedicated service (`templateGraphService.ts`)
- 1 updated view component (`ResultsGraph.tsx`)
- 1 updated API configuration module (`apiConfig.ts`)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation & Evidence |
|:---|:---:|:---|
| **I. Strict Atomic Design Hierarchy** | **PASS** | UI views (`ResultsGraph.tsx` in `src/modules/public/`) remain purely presentational, delegating I/O to services without changing component hierarchy. |
| **II. Continuous Documentation Synchronization** | **PASS** | No atomic UI components in `src/components/` are created or modified; component docs remain synchronized. |
| **III. Pure Domain Modeling in `domain/models/`** | **PASS** | Models in `domain/models/` remain pure TypeScript interfaces. Storage and HTTP concerns remain in `core/` and `services/`. |
| **IV. Mandatory Adapter Pattern** | **PASS** | Existing adapters remain intact. `templateGraphService` handles raw text files returning typed domain-friendly `ExampleGraphTemplates`. |
| **V. Encapsulated Service Layer & Centralized HTTP** | **PASS** | **Direct Target**. All HTTP requests are encapsulated in services; static assets are fetched via `baseFetch` from `src/core/http/httpClient.ts`. Zero raw `fetch()` calls remain in UI views. Production API URL fallback defaults to safe relative `"/api"`. |
| **VI. Declarative, Type-Safe Forms** | **PASS** | Forms and validation schemas are unaffected by this infrastructure compliance change. |
| **VII. Robust Security & RBAC** | **PASS** | **Direct Target**. Direct `localStorage` access in `AuthContext.tsx` is eliminated. All token management is 100% centralized within `src/core/http/tokenStorage.ts` with SSR guards. |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-centralized-http-and-token-storage-compliance/
├── plan.md              # This implementation plan
├── spec.md              # Feature specification with recorded clarifications
├── research.md          # Architectural research & decisions (Phase 0)
├── data-model.md        # Data models & interfaces (Phase 1)
├── quickstart.md        # Verification and quality gate guide (Phase 1)
├── checklists/
│   └── requirements.md  # Specification quality checklist
├── contracts/           # Interface contracts (Phase 1)
│   ├── template-graph-service-contract.md
│   └── token-storage-contract.md
└── tasks.md             # Execution task list (Phase 2 - generated by /speckit-tasks)
```

### Source Code Layout

```text
src/
├── context/
│   └── AuthContext.tsx             # Updated: Reads token strictly via getAccessToken()
├── core/
│   └── http/
│       ├── httpClient.ts           # Central HTTP client (sole location of raw fetch)
│       └── tokenStorage.ts         # Updated: Centralized storage with SSR / window safety guards
├── services/
│   ├── apiConfig.ts                # Updated: Replace localhost:8008 fallback with "/api" in production
│   └── templateGraphService.ts     # NEW: Dedicated service to load example graph templates via baseFetch
└── modules/
    └── public/
        └── ResultsGraph.tsx        # Updated: Replaces inline fetch() calls with templateGraphService
```

**Structure Decision**: The source code changes adhere cleanly to the established project layout. No new architectural layers are added. A single dedicated service `templateGraphService.ts` is introduced in `src/services/` to encapsulate static template file retrieval.

---

## Complexity Tracking

> *No constitutional violations exist. All changes directly restore constitutional compliance with Principles V and VII.*

| Principle / Rule | Compliance Status | Resolution Mechanism |
|---|---|---|
| Principle V (Centralized HTTP) | COMPLIANT | `baseFetch` in `templateGraphService.ts` replaces inline `fetch` in `ResultsGraph.tsx` |
| Principle V (Safe API Config) | COMPLIANT | `"/api"` replaces `"http://localhost:8008/api"` in `apiConfig.ts` |
| Principle VII (Token Storage) | COMPLIANT | `getAccessToken()` replaces `localStorage.getItem` in `AuthContext.tsx` |
