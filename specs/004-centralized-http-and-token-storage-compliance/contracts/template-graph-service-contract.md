# Contract: Template Graph Service

**Module**: `src/services/templateGraphService.ts`  
**Consumer**: `src/modules/public/ResultsGraph.tsx`  
**Transport**: Centralized `baseFetch` from `src/core/http/httpClient.ts`

---

## 1. Exports

```typescript
import { baseFetch } from "@/core/http/httpClient";

export interface ExampleGraphTemplates {
  nodesTxt: string;
  linksTxt: string;
}

/**
 * Loads default example graph nodes and links templates from public assets.
 *
 * @throws {Error} If either template file fails to fetch (status not ok).
 * @returns {Promise<ExampleGraphTemplates>} Object containing raw text for nodes and links.
 */
export async function loadExampleGraphTemplates(): Promise<ExampleGraphTemplates>;
```

---

## 2. Behavioral Contract

1. **Path targets**:
   - Nodes: `/templates/graph-nodes-example.txt`
   - Links: `/templates/graph-links-example.txt`
2. **HTTP Headers**:
   - Sets `{ headers: { Accept: "text/plain" } }` so `baseFetch` does not force JSON response parsing.
3. **Concurrent Resolution**:
   - Both files are fetched concurrently via `Promise.all`.
4. **Error Handling**:
   - If `!res.ok`, throws `Error(`Failed to load ${path}: ${res.statusText}`)`.
5. **Architectural Boundary**:
   - Zero raw `fetch()` calls inside React view components.
   - 100% of network traffic channeled through `httpClient.ts`.
