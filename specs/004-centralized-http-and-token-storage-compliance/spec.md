# Feature Specification: Centralized HTTP Client & Token Storage Compliance

**Feature Branch**: `feature/04-centralized-http-and-token-storage-compliance`  
**Created**: 2026-11-19  
**Status**: Draft  
**Input**: SDD Requirement `REQ-UI-ARCH-04` from `/home/yacson/Proyectos/biopatternsg-ms/SDD/UI/04-centralized-http-and-token-storage-compliance/requirement.md`

---

## Clarifications

### Session 2026-11-19

- Q: ¿Dónde debe ubicarse la función encargada de cargar los archivos de plantilla de grafos de ejemplo (`/templates/graph-nodes-example.txt` y `/templates/graph-links-example.txt`)? → A: Crear un servicio dedicado `src/services/templateGraphService.ts` que exporte `loadExampleGraphTemplates()`.
- Q: ¿Cómo debe resolver `apiConfig.ts` la constante `CONFIG_AND_CONTROL` en entornos de producción cuando `VITE_API_URL` no está definida o está vacía? → A: Usar `"/api"` como fallback predeterminado cuando `VITE_API_URL` está ausente o vacía en producción.
- Q: ¿Qué mecanismo de red debe utilizar internamente `templateGraphService.ts` para solicitar los archivos estáticos `.txt`? → A: Usar `baseFetch` de `@/core/http/httpClient` con header `{ Accept: "text/plain" }`, garantizando que el 100% del tráfico HTTP de la aplicación fluya a través del cliente HTTP centralizado.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized Token Access in Auth Context (Priority: P1)

As an authenticated user, when I access the application or refresh the page, the authentication context must restore my session state using the centralized token storage abstraction rather than having UI contexts touch browser storage directly.

**Why this priority**: Direct access to `localStorage` in `AuthContext.tsx` violates Principle VII (*Robust Security & RBAC*) and prevents seamless migration to safer token storage mechanisms (e.g., httpOnly cookies or secure memory storage) across the application.

**Independent Test**: Load the application with an existing token stored; verify `AuthContext` restores authentication state, parses user roles, and handles session validation strictly through `getAccessToken()` from `@/core/http/tokenStorage` without invoking `localStorage.getItem` directly in the context.

**Acceptance Scenarios**:
1. **Given** a valid access token is present in storage, **When** `AuthProvider` initializes on app boot or page reload, **Then** it retrieves the token via `getAccessToken()` and restores the authenticated state with appropriate user permissions.
2. **Given** no token is stored (or storage is inaccessible/cleared), **When** `AuthProvider` initializes, **Then** it receives `null` from `getAccessToken()` and sets unauthenticated state cleanly without runtime exceptions.
3. **Given** a non-browser or SSR execution context where `window` or `localStorage` is undefined, **When** `getAccessToken()` is invoked, **Then** it safely returns `null` without throwing errors.

---

### User Story 2 - Encapsulated Graph Template Loading (Priority: P1)

As an analyst or public user navigating to the Results Graph view without pre-loaded experimental results, the application must load default example graph templates through an encapsulated service layer (`templateGraphService.ts`) instead of raw `fetch()` calls inside the React component.

**Why this priority**: Invoking browser `fetch()` directly inside `ResultsGraph.tsx` violates Principle V (*Encapsulated Service Layer & Centralized HTTP*), bypassing error handling standards, base URL configurations, and service layer testability.

**Independent Test**: Navigate to `/results-graph` with no previous pipeline session data; verify the example nodes (`/templates/graph-nodes-example.txt`) and links (`/templates/graph-links-example.txt`) are loaded through `templateGraphService.ts` and the graph renders all example nodes and edges properly.

**Acceptance Scenarios**:
1. **Given** a user navigates to `/results-graph` with `hasInitialData = false`, **When** the component mounts, **Then** it invokes `loadExampleGraphTemplates()` from `templateGraphService.ts` to retrieve both node and link template texts.
2. **Given** both template files are successfully retrieved by `templateGraphService.ts`, **When** the service returns the raw text payloads, **Then** the component parses nodes and links and renders the interactive network visualizer.
3. **Given** a network failure or 404 response when requesting a template asset, **When** `templateGraphService.ts` encounters the HTTP error, **Then** it catches and reports the failure predictably, allowing the UI to handle loading state without uncaught promise rejections.

---

### User Story 3 - Production-Safe API Configuration Fallback (Priority: P1)

As a DevOps engineer or system administrator deploying the UI to staging or production environments, the application API configuration must never fall back to a hardcoded `http://localhost` address when environment variables are omitted or deployed behind a reverse proxy.

**Why this priority**: A hardcoded `http://localhost:8008/api` fallback in production builds causes silent network failures, CORS errors, or security misconfigurations when `VITE_API_URL` is omitted, violating Principle V.

**Independent Test**: Build the application in production mode (`import.meta.env.DEV === false`) without providing `VITE_API_URL`; verify `CONFIG_AND_CONTROL` resolves safely to relative `"/api"` (matching reverse proxy setups like nginx in `.env.production`) or fails gracefully, never targeting `http://localhost:8008/api`.

**Acceptance Scenarios**:
1. **Given** the application is compiled/running in production mode (`DEV = false`) and `VITE_API_URL` is defined (e.g., `https://api.biopatternsg.com`), **When** `CONFIG_AND_CONTROL` is evaluated in `apiConfig.ts`, **Then** it uses `import.meta.env.VITE_API_URL`.
2. **Given** the application is compiled/running in production mode (`DEV = false`) and `VITE_API_URL` is undefined or empty, **When** `CONFIG_AND_CONTROL` is evaluated, **Then** it falls back to `"/api"` instead of any localhost URL.
3. **Given** the application is running in local development mode (`DEV = true`), **When** `CONFIG_AND_CONTROL` is evaluated, **Then** it remains `""` to leverage Vite's local dev proxy (`server.proxy`).

---

### User Story 4 - Zero Storage and HTTP Leaks Boundary Enforcement (Priority: P2)

As a software architect, I want automated verification that ensures zero direct references to browser storage (`localStorage` / `sessionStorage`) exist outside `src/core/http/tokenStorage.ts` and zero raw `fetch()` calls exist inside `src/modules/` or `src/components/`.

**Why this priority**: Guarantees ongoing constitutional compliance and prevents future regressions as new features are added.

**Independent Test**: Execute static analysis / repository grep across `src/` to confirm that all storage access is encapsulated in `tokenStorage.ts` and all HTTP requests are mediated by service abstractions.

**Acceptance Scenarios**:
1. **Given** the entire `src/` codebase, **When** searching for `localStorage` and `sessionStorage`, **Then** the only occurrences found are located inside `src/core/http/tokenStorage.ts` (and purely explanatory comments).
2. **Given** all UI views and components (`src/modules/` and `src/components/`), **When** searching for `fetch(`, **Then** exactly zero occurrences are found.
3. **Given** `src/services/apiConfig.ts`, **When** inspecting production URL configuration expressions, **Then** zero occurrences of `http://localhost` exist.

---

### Edge Cases

- **Non-browser/SSR environments**: Calling `getAccessToken()` or storage operations when `window` is `undefined` must return `null` without throwing a `ReferenceError`.
- **Corrupted or missing template files**: If template assets in `/templates/` fail to load (e.g. 404 or 500 error), the service must throw a descriptive error that the caller handles gracefully (e.g. logging and leaving graph in empty/error state rather than crashing the component).
- **Trailing slash in `VITE_API_URL`**: If `VITE_API_URL` is configured with a trailing slash, endpoint concatenation in `apiConfig.ts` must maintain valid URL paths without double slashes.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `src/context/AuthContext.tsx` MUST retrieve the authentication token exclusively via `getAccessToken()` from `@/core/http/tokenStorage` and MUST NOT reference `localStorage` directly.
- **FR-002**: `src/core/http/tokenStorage.ts` MUST safely check for browser environment availability before accessing `localStorage` to avoid exceptions in SSR or test runner contexts.
- **FR-003**: The application MUST encapsulate the retrieval of graph example templates (`/templates/graph-nodes-example.txt` and `/templates/graph-links-example.txt`) inside a dedicated service `src/services/templateGraphService.ts` exporting `loadExampleGraphTemplates()`, which performs requests via `baseFetch()` from `@/core/http/httpClient` with `{ Accept: "text/plain" }`.
- **FR-004**: `src/modules/public/ResultsGraph.tsx` MUST use `loadExampleGraphTemplates()` from `templateGraphService.ts` to fetch example graph data and MUST NOT execute raw browser `fetch()` calls directly.
- **FR-005**: `src/services/apiConfig.ts` MUST NOT contain `http://localhost:8008/api` as a fallback in production; it MUST default to `"/api"` when `VITE_API_URL` is absent or empty in production environments.
- **FR-006**: Codebase static checks MUST verify zero unauthorized `localStorage` or `sessionStorage` references outside `src/core/http/tokenStorage.ts` and zero raw `fetch()` calls outside `src/core/http/httpClient.ts`.

---

### Key Entities *(include if feature involves data)*

- **ExampleGraphTemplates**: Data structure representing the example network graph templates loaded from static assets:
  - `nodesTxt`: `string` (raw content of `graph-nodes-example.txt`)
  - `linksTxt`: `string` (raw content of `graph-links-example.txt`)
- **TokenStorageAPI**: Core token storage abstraction contract:
  - `getAccessToken()`: `() => string | null`
  - `getRefreshToken()`: `() => string | null`
  - `setTokens(pair: TokenPair)`: `(pair: TokenPair) => void`
  - `setAccessToken(token: string)`: `(token: string) => void`
  - `clearTokens()`: `() => void`
  - `hasAccessToken()`: `() => boolean`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **100% Token Storage Encapsulation**: Exactly 0 direct invocations of `localStorage` or `sessionStorage` exist in `src/` outside `src/core/http/tokenStorage.ts`.
- **SC-002**: **100% Service Layer HTTP Encapsulation**: Exactly 0 direct invocations of raw `fetch(` exist in `src/` outside `src/core/http/httpClient.ts`.
- **SC-003**: **Zero Localhost in Production Config**: `src/services/apiConfig.ts` contains 0 instances of `http://localhost` in production configuration branches.
- **SC-004**: **Full Feature Regression Integrity**: Production build (`npm run build`) and linting (`npm run lint`) pass with 0 errors and 0 warnings, and authentication session restoration and graph example loading function identically.

---

## Assumptions

- Graph example files (`/templates/graph-nodes-example.txt` and `/templates/graph-links-example.txt`) are static assets served from the public web root (`public/templates/`).
- The production reverse-proxy routing convention forwards `/api` directly to the backend API gateway, making `"/api"` the correct default relative base URL when `VITE_API_URL` is not provided.
- Centralized token storage in `src/core/http/tokenStorage.ts` remains synchronous and returns `string | null`.
