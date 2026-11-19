# Component & Adapter Contracts: Atomic Design Decoupling

**Feature**: `001-atomic-hierarchy-decoupling`  
**Status**: Completed  
**Date**: 2026-11-18  

---

## 1. Component Interface Contracts

### 1.1. `Breadcrumb` Molecule (`src/components/molecules/Breadcrumb.tsx`)
- **Category**: Molecule
- **Responsibility**: Purely render horizontal navigation trail with optional chevron separators and action buttons.
- **Invariants**:
  - MUST NOT import `react-router-dom` or execute route mutations directly.
  - Composes the `Button` atom with `variant="ghost"`.
  - Dispatches `onNavigate(item.href)` when a link item is clicked, or falls back to no-op if no callback is supplied.
  - The terminal item (or items lacking `href`) renders as static text styled with `text-primary font-semibold`.

---

### 1.2. `BiologicalRolesModal` Molecule (`src/components/molecules/BiologicalRolesModal.tsx`)
- **Category**: Molecule
- **Responsibility**: Present inferred biological roles, confidence indicators, and categories for a selected node.
- **Invariants**:
  - MUST NOT import `src/services/` or `src/services/models/`.
  - Receives `rolesData: BiologicalRoleItem[]`, `isLoading: boolean`, and `error: string | null` via props.
  - Provides visual skeleton / spinner when `isLoading` is true.
  - Renders explicit error banner with optional `onRetry` trigger when `error` is present.
  - Triggers `onClose()` on backdrop or dismiss button click.

---

### 1.3. `UserMenu` Molecule (`src/components/molecules/UserMenu.tsx`)
- **Category**: Molecule
- **Responsibility**: Display authenticated user avatar and popover menu containing identity and logout triggers.
- **Invariants**:
  - MUST NOT import `AuthContext` or `useAuth()`.
  - Accepts `user: UserProfileDisplay` and `onLogout: () => void`.
  - Renders avatar initials fallback when no image URL exists.
  - Invokes `onLogout` when user selects "Log out" menu action.

---

### 1.4. `ManualStepHeader` Molecule (`src/components/molecules/ManualStepHeader.tsx`)
- **Category**: Molecule
- **Responsibility**: Render workflow stage title, subtitle, and return/progress navigation.
- **Invariants**:
  - MUST NOT import `useNavigate` from `react-router-dom`.
  - Accepts `onBack: () => void` and passes `onNavigate` down to child `Breadcrumb` molecule.

---

### 1.5. `HeroSection` Organism (`src/components/organisms/HeroSection.tsx`)
- **Category**: Organism
- **Responsibility**: Render the asymmetric public landing banner, features summary, and login form card.
- **Invariants**:
  - MUST NOT import `authService` or `authAdapter`.
  - Delegates form submission to `onLoginSubmit: (values: LoginFormValues) => Promise<void>`.
  - Dispatches `onForgotPassword: () => void` when the user clicks "Forgot?".

---

## 2. Adapter Contracts (`src/adapters/`)

### 2.1. `pathwayAdapter.ts`
Translates backend KrakenD / microservice response objects into domain `GroupedPathway` structures.

```typescript
import type { PathwayResponseDTO } from '@/services/models/Pathway';
import type { GroupedPathway } from '@/domain/models/Pathway';

export function toGroupedPathway(dto: PathwayResponseDTO): GroupedPathway;
export function toGroupedPathwayList(dtos: PathwayResponseDTO[]): GroupedPathway[];
```

### 2.2. `experimentAdapter.ts`
Translates pipeline status and inference DTOs into domain `PipelineStatus` and `BiologicalRoleItem` entities.

```typescript
import type { InferenceResponseDTO, PipelineStatusDTO } from '@/services/models/Experiment';
import type { BiologicalRoleItem, PipelineStatus } from '@/domain/models/Experiment';

export function toBiologicalRoleList(dto: InferenceResponseDTO): BiologicalRoleItem[];
export function toPipelineStatus(dto: PipelineStatusDTO): PipelineStatus;
```

---

## 3. Custom Hook Contract: `useBiologicalRoles`

Located in `src/modules/dashboard/experiments/hooks/useBiologicalRoles.ts`:

```typescript
import type { BiologicalRoleItem } from '@/domain/models/Experiment';

export interface UseBiologicalRolesResult {
  rolesData: BiologicalRoleItem[];
  isLoading: boolean;
  error: string | null;
  fetchRoles: (experimentId: string, nodeId: string) => Promise<void>;
  reset: () => void;
}

export function useBiologicalRoles(): UseBiologicalRolesResult;
```
