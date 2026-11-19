# Data Model: Atomic Design Hierarchy Decoupling

**Feature**: `001-atomic-hierarchy-decoupling`  
**Status**: Completed  
**Date**: 2026-11-18  

---

## 1. Domain Entities (`src/domain/models/`)

### 1.1. Biological Graph Model (`src/domain/models/Graph.ts`)

Represents the core network graph structure rendered across 2D/3D force-directed canvases.

```typescript
export interface GraphNodeInput {
  id: string;
  name: string;
  label?: string;
  category?: string;
  type?: string;
  val?: number;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GraphLinkInput {
  source: string;
  target: string;
  name?: string;
  label?: string;
  type?: string;
  curvature?: number;
  rotation?: number;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GraphNode extends GraphNodeInput {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  color?: string;
}

export interface GraphLink extends GraphLinkInput {
  source: string | GraphNode;
  target: string | GraphNode;
  color?: string;
}

export interface ForceGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
```

---

### 1.2. Pathway Domain Model (`src/domain/models/Pathway.ts`)

Pure domain representation of grouped pathways and metrics consumed by pathway inspection views and modals.

```typescript
export interface GroupedPathway {
  pathwayId: string;
  pathwayName: string;
  category?: string;
  source?: string;
  target?: string;
  nodeCount: number;
  linkCount: number;
  confidenceScore?: number;
  description?: string;
  genes?: string[];
  compounds?: string[];
}

export interface PathwayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathway: GroupedPathway | null;
}
```

---

### 1.3. Experiment & Pipeline Domain Model (`src/domain/models/Experiment.ts`)

Pure domain models representing pipeline status and biological roles inferred from experiments.

```typescript
export type PipelineStage = 'queued' | 'running' | 'completed' | 'failed';

export interface PipelineStatus {
  stage: PipelineStage;
  progressPercentage: number;
  currentStepLabel?: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface BiologicalRoleItem {
  id: string;
  nodeId: string;
  role: string;
  category: string;
  score: number;
  evidenceCount?: number;
  summary?: string;
}
```

---

## 2. Configuration Entities (`src/config/`)

### 2.1. Visual Contrast Profiles (`src/config/forceGraphProfiles.ts`)

Clinical contrast palette configurations used by `ForceGraphCanvas` and graph viewers.

```typescript
export type GraphBackground = 'black' | 'white' | 'skyblue';

export interface GraphVisualProfile {
  id: GraphBackground;
  label: string;
  backgroundColor: string;
  nodeDefaultColor: string;
  nodeBorderColor: string;
  linkColor: string;
  textColor: string;
  highlightNodeColor: string;
  highlightLinkColor: string;
  glowColor?: string;
}

export const GRAPH_PROFILES: Record<GraphBackground, GraphVisualProfile>;
export function getGraphProfile(id?: GraphBackground): GraphVisualProfile;
```

---

## 3. Decoupled Presentational Component Contracts

### 3.1. `Breadcrumb` Molecule (`src/components/molecules/Breadcrumb.tsx`)

```typescript
import type { LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}
```

---

### 3.2. `BiologicalRolesModal` Molecule (`src/components/molecules/BiologicalRolesModal.tsx`)

```typescript
import type { BiologicalRoleItem } from '@/domain/models/Experiment';

export interface BiologicalRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId?: string | null;
  nodeName?: string | null;
  rolesData: BiologicalRoleItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}
```

---

### 3.3. `UserMenu` Molecule (`src/components/molecules/UserMenu.tsx`)

```typescript
export interface UserProfileDisplay {
  name?: string;
  email?: string;
  initials?: string;
  avatarUrl?: string;
}

export interface UserMenuProps {
  user?: UserProfileDisplay | null;
  onLogout?: () => void;
  className?: string;
}
```

---

### 3.4. `ManualStepHeader` Molecule (`src/components/molecules/ManualStepHeader.tsx`)

```typescript
import type { BreadcrumbItem } from '@/components/molecules/Breadcrumb';

export interface ManualStepHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems: BreadcrumbItem[];
  onBack?: () => void;
  onNavigate?: (href: string) => void;
  className?: string;
}
```

---

### 3.5. `HeroSection` Organism (`src/components/organisms/HeroSection.tsx`)

```typescript
import type { LoginFormValues } from '@/domain/models/Auth';

export interface HeroSectionProps {
  onLoginSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onForgotPassword?: () => void;
}
```
