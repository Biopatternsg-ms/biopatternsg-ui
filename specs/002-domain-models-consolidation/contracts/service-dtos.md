# Contract: Service Transport DTOs & Adapter Signatures

**Location**: `src/services/models/` and `src/adapters/`  
**Governance**: Principles IV & V of BioPatternSG UI Constitution  
**Rules**:
1. All raw API request and response interfaces must carry the `Dto` suffix.
2. Data crossing between `src/services/` and UI modules must be converted via `src/adapters/`.

---

## 1. Network DTO & Adapter

### `src/services/models/NetworkDto.ts` (or in `src/services/networkService.ts`)
```typescript
export interface NetworkDto {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface PaginatedResponseDto<T> {
  count: number;
  list: T[];
}
```

### `src/adapters/networkAdapter.ts`
```typescript
import type { NetworkDto, PaginatedResponseDto } from "@/services/models/NetworkDto";
import type { Network } from "@/domain/models/Network";
import type { PaginatedResult } from "@/domain/models/Common";

export const networkAdapter = {
  toDomain(dto: NetworkDto): Network {
    return {
      id: dto.id,
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      createdAt: new Date(dto.createdAt).toISOString(),
    };
  },

  toPaginatedDomain(dto: PaginatedResponseDto<NetworkDto>): PaginatedResult<Network> {
    return {
      count: dto.count,
      list: dto.list.map(networkAdapter.toDomain),
    };
  },
};
```

---

## 2. Experiment DTOs & Adapter

### `src/services/models/Experiment.ts` (DTOs)
- `ExperimentDto`: Contains `createdAt?: number`, `transcriptionFactorConfig?: TranscriptionFactorConfigDto`, etc.
- `BiologicalObjectItemDto`: Raw biological object attributes.
- `AlignedResultResponseDto`: Raw alignment response containing `aligned: string[]`, `noAligned: string[]`, `alignedAs: AlignedAsItemDto[]`.

### `src/adapters/experimentAdapter.ts`
- `toDomain(dto: ExperimentDto): Experiment`: Normalizes `createdAt` to ISO string.
- `toBiologicalObjectDomain(dto: BiologicalObjectItemDto): BiologicalObjectItem`.
- `toAlignedResultDomain(dto: AlignedResultResponseDto): ...`.

---

## 3. Pathway DTOs & Adapter

### `src/services/models/Pathway.ts` (DTOs)
- `PathwayGraphNodeDto`, `PathwayGraphEdgeDto`, `PathwayDto`, `PathwayInferenceResponseDto`.

### `src/adapters/pathwayAdapter.ts`
- `toPathwayDomain(dto: PathwayDto): Pathway`.
- `toGroupedPathwayDomain(dto: ...): GroupedPathway`.
