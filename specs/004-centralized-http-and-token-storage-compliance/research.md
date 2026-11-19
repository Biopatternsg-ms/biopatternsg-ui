# Research & Architectural Decisions: Centralized HTTP & Token Storage Compliance

**Feature Branch**: `feature/04-centralized-http-and-token-storage-compliance`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Centralized Token Storage & SSR Protection

### Context
`src/context/AuthContext.tsx` line 86 directly invoked:
```ts
const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
```
This violated Principle VII (*Robust Security & RBAC*), which mandates that all access to persistent session tokens MUST be routed exclusively through `src/core/http/tokenStorage.ts`. Furthermore, `tokenStorage.ts` did not guard against environments where `localStorage` or `window` might be undefined (e.g. Vitest/Jest runner or SSR contexts).

### Decision
1. Update `AuthContext.tsx` to call `getAccessToken()` imported from `@/core/http/tokenStorage`.
2. Add safe environment detection inside `src/core/http/tokenStorage.ts`:
   ```ts
   function isStorageAvailable(): boolean {
     return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
   }
   ```
   If storage is unavailable, getters safely return `null` and setters/clear methods perform a safe no-op.

### Rationale
- Encapsulates token lifecycle logic entirely within `tokenStorage.ts`. If the storage mechanism is upgraded in the future (e.g., httpOnly cookies, secure in-memory storage, or biometric tokens), `AuthContext` will require zero modifications.
- Guarantees crash immunity in headless test environments or SSR execution pipelines.

### Alternatives Considered
- *Direct access with inline checks in components*: Rejected. Directly violates Principle VII and disperses security assumptions across the UI layer.
- *Full in-memory mock storage polyfill*: Rejected. Over-engineered for a client-side React SPA where non-browser environments only require safe fallback values (`null`).

---

## 2. Dedicated Template Graph Service (`templateGraphService.ts`)

### Context
`src/modules/public/ResultsGraph.tsx` (lines 173-180) executed raw `fetch()` calls inside a `useEffect` hook:
```ts
fetch("/templates/graph-nodes-example.txt")
fetch("/templates/graph-links-example.txt")
```
This violated Principle V (*Encapsulated Service Layer & Centralized HTTP*).

### Decision
Create a dedicated service file `src/services/templateGraphService.ts` that encapsulates static template loading and exports:
```ts
export interface ExampleGraphTemplates {
  nodesTxt: string;
  linksTxt: string;
}

export async function loadExampleGraphTemplates(): Promise<ExampleGraphTemplates>;
```

### Rationale
- Keeps `networkService.ts` focused purely on backend API endpoints (`/pipeline/network/...`).
- Keeps `ResultsGraph.tsx` purely focused on visualization state and rendering without performing raw I/O.
- Allows unit and integration tests to easily mock or spy on template loading.

### Alternatives Considered
- *Placing `loadExampleGraphTemplates` in `networkService.ts`*: Rejected during clarification. `networkService.ts` handles REST endpoints requiring authentication and JSON responses; mixing local static text assets pollutes its cohesive scope.
- *Generic `staticAssetService.ts`*: Rejected as premature generalization. The only static assets requiring programmatic fetching in the application are the example graph templates.

---

## 3. Network Transport for Static Asset Loading

### Context
`httpClient.ts` provides `baseFetch` and `authFetch`. By default, `baseFetch` injects `Content-Type: application/json` and `Accept: application/json` if not provided. However, graph templates are plain text files (`text/plain`) served from `public/templates/`.

### Decision
`templateGraphService.ts` will invoke `baseFetch` from `@/core/http/httpClient` explicitly specifying `Accept: "text/plain"`:
```ts
const [nodesRes, linksRes] = await Promise.all([
  baseFetch("/templates/graph-nodes-example.txt", { headers: { Accept: "text/plain" } }),
  baseFetch("/templates/graph-links-example.txt", { headers: { Accept: "text/plain" } }),
]);
```
Both responses are verified for `res.ok`, throwing descriptive errors if not found, and unpacked via `res.text()`.

### Rationale
- Guarantees that **100% of HTTP traffic** in the application passes through `@/core/http/httpClient`.
- Achieves **0 raw `fetch(` calls** anywhere in `src/` outside `src/core/http/httpClient.ts`.
- `baseFetch` already checks `if (!headers.has("Accept"))`, so passing `{ Accept: "text/plain" }` prevents the default JSON accept header from being set.

### Alternatives Considered
- *Calling browser `fetch()` directly inside `templateGraphService.ts`*: Rejected during clarification. Allowing raw `fetch()` anywhere in `services/` weakens architectural boundaries and makes static lint/grep enforcement harder.
- *Creating a specialized `fetchStaticText()` in `httpClient.ts`*: Rejected. `baseFetch` with custom headers already provides full flexibility without modifying core HTTP primitives.

---

## 4. Production API Fallback URL Configuration

### Context
In `src/services/apiConfig.ts`:
```ts
export const CONFIG_AND_CONTROL: string = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:8008/api");
```
In production environments without `VITE_API_URL`, requests fallback to `http://localhost:8008/api`. When deployed in a browser, the browser attempts to connect to the client machine's localhost, causing hard connection failures and CORS violations.

### Decision
Update `apiConfig.ts` to fallback to `"/api"` in production:
```ts
export const CONFIG_AND_CONTROL: string = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL?.trim() || "/api");
```
Ensure all derived endpoints (e.g., `USERS_ENDPOINT = `${CONFIG_AND_CONTROL}/${REGISTER_PATH}`) correctly format URLs without double slashes.

### Rationale
- In production, BioPatternSG microservices are deployed behind an Nginx/reverse proxy gateway where `/api/...` routes traffic to the backend services (as specified in `.env.production`).
- Using `|| "/api"` handles both `undefined` and empty string `""` in production.
- In local development (`DEV = true`), `CONFIG_AND_CONTROL` remains `""` so that Vite's `server.proxy` transparently intercepts and proxies calls.

### Alternatives Considered
- *Throw an error at boot time*: Rejected. Fails standard container deployments where runtime reverse proxying expects relative `/api` paths.
- *Defaulting to `""` in production*: Rejected. Root paths (`/config-and-control/...`) collide with frontend routing unless explicitly prefixed with `/api`.
