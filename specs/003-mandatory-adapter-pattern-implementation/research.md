# Architectural Research & Decisions: Mandatory Adapter Pattern Implementation

## Decision 1: Dual Exports across All Boundary Adapters

- **Context**: Adapters mediate between backend wire representations (`src/services/models/*`) and internal domain models / form schemas (`src/domain/models/*`). Some caller files prefer named imports for tree-shaking, while existing services or test files benefit from an enclosing namespace object.
- **Decision**: All adapters in `src/adapters/` MUST support dual exports:
  1. Individual named pure functions: `toNetworkDomain`, `toPaginatedNetworksDomain`, `toCreateNetworkPayload`, etc.
  2. A consolidated namespace object: `export const networkAdapter = { toDomain: toNetworkDomain, toNetworkDomain, ... }`.
- **Rationale**: Provides maximum DX (Developer Experience) and backwards compatibility without bloating bundles.
- **Alternatives Considered**:
  - *Namespace Object Only*: Rejected because it hinders tree-shaking and creates unnecessary indirection.
  - *Named Functions Only*: Rejected because it breaks existing code patterns relying on `networkAdapter.toDomain`.

---

## Decision 2: Delimiting Boundary Adapters vs. Presentation Utilities

- **Context**: Previous module components performed inline date formatting (e.g. `formatDate` in `Network.tsx`) and inline metric label parsing (e.g. `parseRawMetrics` in `ExperimentExecution.tsx`). The boundary adapter's role is to mediate data contracts, not handle visual presentation formatting.
- **Decision**: Keep adapters strictly focused on DTO <-> Domain and Form <-> Payload transformations (Principio IV). Visual presentation formatters are extracted into dedicated, reusable utilities in `src/utils/`:
  - `src/utils/dateUtils.ts`: Pure presentation date formatting (`formatDateToDisplay`, `formatISODateToDDMMYYYY`).
  - `src/utils/metricUtils.ts`: Parsing and human-readable label formatting for pipeline step metrics (`parseExperimentMetrics`).
- **Rationale**: Enforces single responsibility principle (SRP). Adapters normalize timestamps to ISO 8601 strings, while presentation formatting depends on locale/UI theme.
- **Alternatives Considered**:
  - *Embedding visual formatters inside adapters*: Rejected during clarification session (Option B selected) to prevent domain adapters from acquiring UI formatting bloat.

---

## Decision 3: Encapsulating Adaptation within the Service Layer

- **Context**: UI views can either call services that return DTOs and then call adapters manually, or call services that return already adapted domain models.
- **Decision**: Service methods in `src/services/` MUST encapsulate adapter calls internally by default, returning `Promise<DomainModel>` or `Promise<PaginatedResult<DomainModel>>`.
- **Rationale**: Conforms to Principle V (*Encapsulated Service Layer*) and Principle IV (*Mandatory Adapter Pattern*). Views never touch wire DTOs and cannot accidentally forget to invoke adapters.
- **Alternatives Considered**:
  - *Views manually call adapters*: Rejected because it leads to scattered adapter invocations, repeated boilerplate, and frequent leaky abstraction bugs.

---

## Decision 4: Automated Architectural Boundary Verification

- **Context**: Principle IV requires that zero files in `src/modules/` or `src/components/` import directly from `src/services/models/*`.
- **Decision**: Add an automated grep check in CI and verification scripts:
  ```bash
  grep -rnE "from ['\"].*services/models" src/modules src/components
  ```
  Strictly requiring 0 matches.
- **Rationale**: Automated boundary assertions prevent regressions as new developers contribute features.
