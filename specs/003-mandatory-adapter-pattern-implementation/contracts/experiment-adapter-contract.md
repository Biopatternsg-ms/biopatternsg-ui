# Experiment Adapter Contract

`src/adapters/experimentAdapter.ts` mediates all experiment, biological object, pipeline execution, and inference boundary interactions.

## 1. Payload Interfaces

```typescript
export interface CreateExperimentPayload {
  networkId: string;
  name: string;
  description: string;
}

export interface InferenceConfigPayload {
  restrictionLevel: string;
  summarizeKb?: boolean;
  maxDepth?: number;
  startFirstRoles?: string[];
  startSecondRoles?: string[];
  intermediateFirstRoles?: string[];
  intermediateSecondRoles?: string[];
  endFirstRoles?: string[];
  endSecondRoles?: string[];
}
```

## 2. Inbound & Outbound Mappers

```typescript
export function toPipelineStatus(dto: PipelineStatusDto): PipelineStatus;
export function toExperimentDomain(dto: ExperimentDto): Experiment;
export function toBiologicalObjectDomain(dto: BiologicalObjectItemDto): BiologicalObjectItem;
export function toAlignedObjectDomain(dto: AlignedResultResponseDto): AlignedObjectItem[];
export function toInferenceRolesDomain(dto?: InferenceResponseDto | null): InferenceRolesDomain;
export function toBiologicalRoleList(dto?: InferenceResponseDto | null): BiologicalRoleItem[];
export function toCreateExperimentPayload(values: { networkId: string; name: string; description: string }): CreateExperimentPayload;
export function toSaveBiologicalRolesPayload(objects: BiologicalObjectItem[]): Record<string, string[]>;
export function toSaveAlignedObjectsPayload(objects: AlignedObjectItem[]): string[];
export function toInferenceConfigPayload(config: InferenceConfigInput): InferenceConfigPayload;
```

## 3. Namespace Export

```typescript
export const experimentAdapter = {
  toPipelineStatus,
  toExperimentDomain,
  toBiologicalObjectDomain,
  toAlignedObjectDomain,
  toInferenceRolesDomain,
  toBiologicalRoleList,
  toCreateExperimentPayload,
  toSaveBiologicalRolesPayload,
  toSaveAlignedObjectsPayload,
  toInferenceConfigPayload,
};
```
