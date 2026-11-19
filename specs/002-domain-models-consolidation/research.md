# Architectural Research: Pure Domain Models Consolidation

**Feature**: `specs/002-domain-models-consolidation`  
**Date**: 2026-11-18  
**Status**: Completed

---

## 1. Domain Timestamp Representation

### Decision
Normalize all domain entity timestamps (such as `createdAt` and `updatedAt`) to standardized ISO 8601 strings (`string`) in `src/domain/models/` (e.g., `Network.ts`, `Experiment.ts`). Dedicated adapters in `src/adapters/` will convert raw numeric Unix epoch milliseconds from backend DTOs into ISO strings during ingestion.

### Rationale
- **Clean Serialization & Predictability**: ISO 8601 strings serialize transparently into JSON without losing precision or timezone context, making them safe for React state, URL search params, and caching.
- **Presentation Formatting**: String-based timestamps can be formatted using standard localized formatters (`Intl.DateTimeFormat` or date utilities) uniformly across UI views.
- **Purity**: Avoids mutable JavaScript `Date` instances in state management and prevents confusion between millisecond vs. second epoch numbers.

### Alternatives Considered
- *Unix Epoch Milliseconds (`number`)*: Simple to pass through, but forces every individual UI component to know the epoch unit and handle formatting, leaking transport details.
- *Native JavaScript `Date` instances*: Allows direct mathematical date comparisons, but introduces non-serializable objects into React state/props, complicating equality checks and component memoization.

---

## 2. Backend DTO Naming Convention & Location

### Decision
Rename and export all raw backend transport interfaces in `src/services/models/` and `src/services/` with an explicit `Dto` suffix:
- `NetworkDto` and `PaginatedResponseDto<T>` in `src/services/networkService.ts` / `src/services/models/Network.ts`
- `ExperimentDto`, `PipelineStatusDto`, `InferenceResponseDto`, `BiologicalObjectItemDto`, `AlignedResultResponseDto` in `src/services/models/Experiment.ts`
- `PathwayDto`, `PathwayGraphNodeDto`, `PathwayGraphEdgeDto`, `PathwayInferenceResponseDto` in `src/services/models/Pathway.ts`

### Rationale
- **Zero Ambiguity**: Immediately signals to developers and static analysis whether a type is an unvalidated wire representation (`Dto`) or a validated business domain entity (`Domain`).
- **Prevents Accidental Coupling**: Imports from `@/domain/models/*` versus `@/services/models/*` cannot be accidentally interchanged or aliased incorrectly.
- **Enforces Principle IV**: Highlights where adapters are missing because passing a `*Dto` to a UI component or pure molecule will trigger type mismatches.

### Alternatives Considered
- *Retaining current names in `services/models/` with alias imports*: Causes naming collisions when both are needed in adapters (`import { Experiment as ExperimentDto } from '@/services/models/Experiment'`), increasing risk of accidental direct usage in UI modules.
- *Placing DTOs in a nested `src/domain/dto/` folder*: Violates Clean Architecture by mixing external I/O wire formats inside the domain layer.

---

## 3. Localized UI View Contracts vs. Domain Pollution

### Decision
Keep `src/domain/models/` strictly pure. When UI screens require interactive, transient editing state (such as `isModified: boolean`, temporary validation flags, or UI components like `LucideIcon`), declare localized **View Contracts** inside the feature module or organism that extend the pure domain entity:
- In `UpdateAlignedObjects.tsx`: `AlignedObjectItem` defined as a pure domain model in `src/domain/models/Experiment.ts` (attributes: `id`, `symbol`, `status`, `synonyms`).
- In `UpdateBiologicalObjects.tsx`: Define `EditableBiologicalObject` in the module extending `BiologicalObjectItem` from `@/domain/models/Experiment`:
  ```typescript
  export interface EditableBiologicalObject extends BiologicalObjectItem {
    id: string;
    isModified: boolean;
  }
  ```
- In `ExperimentExecution.tsx`: Decouple `ManualStepDefinition` so that the domain entity in `src/domain/models/Experiment.ts` defines business action attributes (`routeSegment: string; buttonLabel: string; iconName: string;`), while the UI view or component contract maps `iconName` to the actual `LucideIcon` component (`Edit3`, `Sliders`, etc.).

### Rationale
- **Principle III Compliance**: No UI library (React, Lucide, HTML5 Canvas) may leak into `src/domain/models/`.
- **Single Source of Truth**: Core business attributes (`symbol`, `roles`, `synonyms`, `biotypes`) remain anchored in the domain model, while component-specific interaction state remains scoped to its lifecycle.

### Alternatives Considered
- *Adding optional UI properties directly to domain models (`isModified?: boolean`)*: Pollutes pure domain models with frontend view concerns, violating separation of concerns.
- *Duplicating all fields in view models*: Leads to maintenance overhead and desynchronization when domain entities evolve.

---

## 4. Generic Domain Pagination Primitive

### Decision
Define `PaginatedResult<T>` in `src/domain/models/Common.ts`:
```typescript
export interface PaginatedResult<T> {
  count: number;
  list: T[];
  page?: number;
  size?: number;
}
```
In `src/services/networkService.ts` and other paginated services, define `PaginatedResponseDto<T>` for the wire contract and return `PaginatedResult<T>` mapped via `networkAdapter.ts`.

### Rationale
- **Uniformity Across Collections**: Networks, pathways, and experiments share identical pagination vocabulary across the UI.
- **Forward Compatibility**: Allows adding optional navigation helpers (e.g. `totalPages`, `hasNextPage`) in the domain layer without requiring backend changes.

### Alternatives Considered
- *Ad-hoc pagination per service*: Leads to duplicated types (`PaginatedResponse<T>` in `networkService.ts`, different shapes in other endpoints).

---

## 5. Summary of Architecture Decisions Table

| Topic | Selected Approach | Key Benefit | Constitutional Alignment |
|---|---|---|---|
| **Timestamps** | ISO 8601 string (`string`) | Immutable, JSON-safe, uniform formatting | Principle III |
| **DTOs** | Suffix `Dto` in `services/models/` | Explicit boundary separation from domain | Principle IV & V |
| **UI Edit State** | Localized View Contracts extending domain | Zero domain pollution by UI frameworks | Principle I & III |
| **Manual Step Icons**| Domain uses `iconName: string`; UI maps to `LucideIcon` | Eliminates Lucide imports from domain | Principle III |
| **Pagination** | `PaginatedResult<T>` in `Common.ts` | Unified collection structure | Principle III |
