# Network Adapter Contract

`src/adapters/networkAdapter.ts` mediates all network boundary interactions adhering strictly to Principle IV.

## 1. Type Definitions

```typescript
export interface CreateNetworkPayload {
  name: string;
  description: string;
}
```

## 2. Interface Contract

```typescript
export interface NetworkAdapterContract {
  toNetworkDomain(dto: NetworkDto): Network;
  toPaginatedNetworksDomain(dto: PaginatedResponseDto<NetworkDto>): PaginatedResult<Network>;
  toCreateNetworkPayload(formValues: CreateNetworkInput | { name: string; description: string }): CreateNetworkPayload;
}
```

## 3. Dual Export Pattern

The module MUST provide both:
```typescript
// Named functional exports (tree-shakeable)
export function toNetworkDomain(dto: NetworkDto): Network;
export function toPaginatedNetworksDomain(dto: PaginatedResponseDto<NetworkDto>): PaginatedResult<Network>;
export function toCreateNetworkPayload(formValues: CreateNetworkInput | { name: string; description: string }): CreateNetworkPayload;

// Consolidated namespace object
export const networkAdapter = {
  toDomain: toNetworkDomain,
  toNetworkDomain,
  toPaginatedDomain: toPaginatedNetworksDomain,
  toPaginatedNetworksDomain,
  toCreateNetworkPayload,
};
```
