# Contract: Pure Domain Models

**Location**: `src/domain/models/`  
**Governance**: Principle III of BioPatternSG UI Constitution  
**Rules**:
1. Zero imports from `react`, `lucide-react`, `src/components/`, `src/modules/`, `src/services/`, or `src/adapters/`.
2. Pure TypeScript interfaces and types only.
3. Timestamps must be normalized ISO 8601 strings (`string`).

---

## 1. `Common.ts`

```typescript
export interface PaginatedResult<T> {
  count: number;
  list: T[];
  page?: number;
  size?: number;
  totalPages?: number;
}

export type BiologicalIdentifier = string;
```

---

## 2. `Network.ts`

```typescript
export interface Network {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  nodesCount?: number;
  edgesCount?: number;
}

export interface CreateNetworkInput {
  name: string;
  description: string;
}
```

---

## 3. `Experiment.ts`

```typescript
export type PipelineStage = "queued" | "running" | "completed" | "failed";

export interface PipelineStatus {
  step: string;
  status: string;
  createdAt?: string;
  progressPercentage?: number;
}

export interface BiologicalRoleItem {
  id?: string;
  symbol: string;
  roles: string[];
  activeRoles?: string[];
  category?: string;
  score?: number;
  description?: string;
}

export interface InferenceRolesDomain {
  pipelineId: string;
  restrictionLevel: string;
  roles: Record<string, string[]>;
  allSymbols: string[];
  entitiesWithActiveRolesCount: number;
}

export interface BiologicalObjectItem {
  id?: string;
  name: string;
  symbol?: string;
  synonyms?: string[];
  biotypes: string[];
  meshRoles: string[];
  roles: string[];
  alternativeIds?: string[];
  description?: string;
}

export type AlignedStatus = "ALIGNED" | "ALIGNED_AS" | "NO_ALIGNED" | "NEW" | "MODIFIED" | "CUSTOM_SYNONYMS";

export interface AlignedObjectItem {
  id: string;
  symbol: string;
  status: AlignedStatus;
  synonyms: string[];
}

export interface TranscriptionFactorConfig {
  sources: string[];
  genome?: string;
  track?: string;
  identity?: number;
  chromosome?: string;
  strand?: string;
  start?: string;
  end?: string;
  reliability: number;
  promoterRegion: string;
}

export interface ExpertObject {
  symbol: string | null;
  uniprotId: string | null;
  hgncId: string | null;
}

export interface ExperimentMetric {
  label: string;
  value: string;
  subLabel?: string;
  subLabelColor?: "green" | "red" | "blue" | "default";
  progress?: number;
  hasWarnings?: boolean;
  warningCount?: number;
}

export interface SubStep {
  name: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING";
}

export interface PipelineStepExecution {
  id: string;
  name: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING" | "FAILED";
  startTime?: string;
  duration?: string;
  outputText?: string;
  description: string;
  iconName: string;
  isManual?: boolean;
  actionRoute?: string;
  subSteps?: SubStep[];
  metrics?: ExperimentMetric[] | Record<string, string>;
}

export interface ExperimentExecution {
  experimentId: string;
  experimentName: string;
  networkId?: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PENDING";
  totalExecutionTime: string;
  currentPhaseDuration: string;
  steps: PipelineStepExecution[];
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  networkId: string;
  levels?: number;
  retMax?: number;
  maxComplexes?: number;
  step?: string;
  transcriptionFactorConfig?: TranscriptionFactorConfig;
  expertObjects?: ExpertObject[];
  createdAt?: string;
  status?: PipelineStatus;
  useOnlyPrincipalName?: boolean;
}

export type RestrictionLevel = "RESTRICTED" | "VERY_RESTRICTED" | "UNRESTRICTED";

export interface ManualStepMetadata {
  routeSegment: string;
  buttonLabel: string;
  iconName: string;
}
```

---

## 4. `Pathway.ts`

```typescript
export interface PathwayGraphNode {
  name: string;
  role?: string;
  type?: string;
}

export interface PathwayGraphEdge {
  first: string;
  relation: string;
  second: string;
  pubmedCount?: number;
}

export interface PathwayEvent {
  first: string;
  relation: string;
  second: string;
  pubmedIds: string[];
}

export interface Pathway {
  id: string;
  name: string;
  score?: number;
  length?: number;
  nodes?: PathwayGraphNode[];
  edges?: PathwayGraphEdge[];
  events?: PathwayEvent[];
  isExpanded?: boolean;
}

export interface GroupedPathway {
  key: string;
  name: string;
  pathways: Pathway[];
  totalScore?: number;
}
```
