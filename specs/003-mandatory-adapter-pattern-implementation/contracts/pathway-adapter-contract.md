# Pathway Adapter Contract

`src/adapters/pathwayAdapter.ts` mediates all pathway search results and force-directed graph visualization boundaries.

## 1. Visualization Graph Ingestion Contract

```typescript
export interface PathwayGraphForceData {
  nodes: GraphNodeInput[];
  links: GraphLinkInput[];
  totalPathways: number;
  executionTimeMs: number;
}
```

## 2. Inbound Mappers

```typescript
export function toGroupedPathway(dto: GroupedPathwayDto): GroupedPathway;
export function toGroupedPathwayList(dtos: GroupedPathwayDto[]): GroupedPathway[];
export function toPathwayGraphNode(dto: PathwayGraphNodeDto): PathwayGraphNode;
export function toPathwayGraphEdge(dto: PathwayGraphEdgeDto): PathwayGraphEdge;
export function toBiologicalPathway(dto: BiologicalPathwayDto): BiologicalPathway;
export function toGroupedPathwaysResult(dto: GroupedPathwaysResponseDto): GroupedPathwaysResult;
export function formatPathwayRoleLabel(rawRole?: string): string;
export function toPathwayGraphForceData(dto?: PathwayGraphDto | null): PathwayGraphForceData;
```

## 3. Namespace Export

```typescript
export const pathwayAdapter = {
  toGroupedPathway,
  toGroupedPathwayList,
  toPathwayGraphNode,
  toPathwayGraphEdge,
  toBiologicalPathway,
  toGroupedPathwaysResult,
  formatPathwayRoleLabel,
  toPathwayGraphForceData,
};
```
