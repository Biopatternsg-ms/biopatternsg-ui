# Contract: Token Storage & Session Boundary

**Module**: `src/core/http/tokenStorage.ts`  
**Consumers**:
- `src/context/AuthContext.tsx`
- `src/services/authService.ts`
- `src/core/http/requestInterceptors.ts`
- `src/core/http/responseInterceptors.ts`

---

## 1. Exports

```typescript
import type { TokenPair } from "@/domain/models/Auth";

export function getAccessToken(): string | null;
export function getRefreshToken(): string | null;
export function setTokens(pair: TokenPair): void;
export function setAccessToken(token: string): void;
export function clearTokens(): void;
export function hasAccessToken(): boolean;
```

---

## 2. Behavioral Contract

1. **Encapsulation Guarantee**:
   - `localStorage` and `sessionStorage` MUST NOT be referenced outside `tokenStorage.ts`.
   - `AuthContext.tsx` MUST use `getAccessToken()` to read token state on mount or re-render.
2. **Environment Resiliency**:
   - Safely checks for `typeof window !== "undefined" && typeof window.localStorage !== "undefined"`.
   - In non-browser / headless test / SSR environments, getters return `null` and mutators perform a safe no-op instead of throwing `ReferenceError`.
3. **Session Clearing**:
   - `clearTokens()` removes both `access_token` and `refresh_token` synchronously.
