# Data Model & Interface Contracts: Centralized HTTP & Token Storage Compliance

**Feature Branch**: `feature/04-centralized-http-and-token-storage-compliance`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Storage Domain Model: `TokenStorageAPI`

Location: `src/core/http/tokenStorage.ts`

### Interface Specification

```typescript
/**
 * Safe, centralized abstraction over client-side authentication token persistence.
 * Guarantees zero ReferenceError exceptions in non-browser/SSR environments.
 */
export interface TokenStorageAPI {
  /**
   * Retrieves the current access token from storage.
   * Returns null if unauthenticated, storage is cleared, or storage is inaccessible.
   */
  getAccessToken(): string | null;

  /**
   * Retrieves the current refresh token from storage.
   * Returns null if unavailable.
   */
  getRefreshToken(): string | null;

  /**
   * Persists both access and refresh tokens.
   */
  setTokens(pair: TokenPair): void;

  /**
   * Updates only the access token (typically called after silent refresh).
   */
  setAccessToken(token: string): void;

  /**
   * Removes all tokens from storage upon logout or session expiry.
   */
  clearTokens(): void;

  /**
   * Helper returning true if an access token exists.
   */
  hasAccessToken(): boolean;
}
```

### Storage Invariants & Validation Rules
- **Non-browser safety**: If `typeof window === 'undefined'` or `typeof window.localStorage === 'undefined'`, all getter methods return `null` and mutation methods perform a silent no-op.
- **Key naming**: Token keys MUST remain strictly `"access_token"` and `"refresh_token"`.
- **Zero leak rule**: No component, context, or hook outside `src/core/http/tokenStorage.ts` may invoke `localStorage` or `sessionStorage`.

---

## 2. Static Asset Domain Model: `ExampleGraphTemplates`

Location: `src/services/templateGraphService.ts`

### Type Definitions

```typescript
/**
 * Raw text content of static graph template assets used for public example rendering.
 */
export interface ExampleGraphTemplates {
  /** Raw content of /templates/graph-nodes-example.txt */
  readonly nodesTxt: string;
  /** Raw content of /templates/graph-links-example.txt */
  readonly linksTxt: string;
}

/**
 * Service function contract for loading example graph template files.
 * Uses centralized baseFetch with Accept: "text/plain".
 */
export type LoadExampleGraphTemplatesFn = () => Promise<ExampleGraphTemplates>;
```

### Validation & Error Handling
- **HTTP 200 Verification**: Both requests must return HTTP status in range 200–299 (`res.ok === true`).
- **Error Propagation**: If either asset fails to load (e.g. 404 or network outage), the promise rejects with a descriptive error: `"Failed to load [asset-name]: [statusText]"`.
- **Consumption**: `ResultsGraph.tsx` consumes `ExampleGraphTemplates`, feeding `nodesTxt` into `parseGraphNodesTxt` and `linksTxt` into `parseGraphLinksTxt`.

---

## 3. Configuration Domain Model: `ApiConfig`

Location: `src/services/apiConfig.ts`

### Configuration Rules

```typescript
/**
 * Root base URL for Config & Control microservice endpoints.
 *
 * Rules:
 * 1. import.meta.env.DEV === true  -> "" (delegates to Vite server.proxy)
 * 2. import.meta.env.DEV === false -> VITE_API_URL (trimmed) if present and non-empty;
 *                                     otherwise defaults to "/api" (Nginx reverse proxy).
 * 3. MUST NEVER equal "http://localhost:8008/api" or any localhost URL in production.
 */
export const CONFIG_AND_CONTROL: string;
```

### Endpoint Derivations
- `USERS_ENDPOINT`: `${CONFIG_AND_CONTROL}/config-and-control/users`
- `ADMIN_USERS_ENDPOINT`: `${CONFIG_AND_CONTROL}/config-and-control/admin/users`
- `CREATE_ADMIN_USER_ENDPOINT`: `${CONFIG_AND_CONTROL}/config-and-control/admin/users`
- `adminUserStatusEndpoint(userId)`: `${CONFIG_AND_CONTROL}/config-and-control/admin/users/${userId}/status`
