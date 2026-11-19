# Contract: Module Localized View Contracts

**Location**: `src/modules/dashboard/experiments/`  
**Governance**: Principles I & III of BioPatternSG UI Constitution  
**Rules**:
1. No inline business entity declarations: core data structures must be imported from `@/domain/models/*`.
2. UI-specific transient state (e.g. `isModified: boolean`, `LucideIcon` references, custom form inputs) must extend or wrap domain models locally.

---

## 1. `UpdateAlignedObjects.tsx`

### Replaces:
Inline `interface AlignedObjectItem`

### With:
```typescript
import type { AlignedObjectItem, AlignedStatus } from "@/domain/models/Experiment";

// Used directly as AlignedObjectItem from domain models!
```

---

## 2. `UpdateBiologicalObjects.tsx`

### Replaces:
Inline `interface EditableBiologicalObject extends BiologicalObjectItem { ... }`

### With:
```typescript
import type { BiologicalObjectItem, RestrictionLevel } from "@/domain/models/Experiment";

export interface EditableBiologicalObject extends BiologicalObjectItem {
  id: string;
  isModified: boolean;
}
```

---

## 3. `ExperimentExecution.tsx`

### Replaces:
- Inline `interface ManualStepDefinition` containing `buttonIcon: LucideIcon`
- Inline `interface ParsedMetricItem`
- Inline `type RawMetricInput`

### With:
```typescript
import type { 
  ManualStepMetadata, 
  ExperimentMetric, 
  ExperimentExecution, 
  PipelineStepExecution 
} from "@/domain/models/Experiment";
import type { LucideIcon } from "lucide-react";

export interface ManualStepPresentation extends ManualStepMetadata {
  buttonIcon: LucideIcon;
}

export interface ParsedMetricItem extends ExperimentMetric {
  isLongText?: boolean;
}

export type RawMetricInput = ExperimentMetric[] | Record<string, string | number | boolean | null | undefined>;
```
