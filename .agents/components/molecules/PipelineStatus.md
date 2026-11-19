# PipelineStatus (Molecule)

The **PipelineStatus** component is a molecule that visualizes the execution progress and active phase of a bioinformatics inference pipeline, displaying percentages, human-readable labels, and semantic status badges.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/PipelineStatus.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PipelineStatus.tsx)
- **Domain Modeling:** Consumes pure domain model `PipelineStatus` from `@/domain/models/Experiment`.

## Dependencies

- `@/components/atoms/Badge`: Semantic status badge.
- `@/domain/models/Experiment`: `PipelineStatus` domain type.

## Exported Helper Functions

- `getFriendlyStepLabel(step?: string): string`: Translates internal pipeline keys to friendly labels (e.g. "BUILD_KNOWLEDGE_BASE" -> "Build Knowledge Base Graph").

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `status` | `PipelineStatus \| string` | No | `undefined` | Pipeline state payload or raw step string. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { PipelineStatus } from "@/components/molecules/PipelineStatus";
import type { PipelineStatus as PipelineStatusDomain } from "@/domain/models/Experiment";

export function ExperimentProgress({ pipelineData }: { pipelineData: PipelineStatusDomain }) {
  return <PipelineStatus status={pipelineData} />;
}
```
