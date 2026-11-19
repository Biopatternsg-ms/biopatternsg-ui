# PipelineStatus (Molecule)

The **PipelineStatus** component is a molecule that visualizes the execution progress and active phase of a bioinformatics inference pipeline, displaying percentages, human-readable labels, and semantic status badges.

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/PipelineStatus.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PipelineStatus.tsx)

## Dependencies

- `lucide-react`: `CheckCircle`, `Clock`, `AlertCircle`, `Loader` icons.
- `@/components/atoms/Badge`: Semantic status badge.
- `@/services/models/Experiment`: `PipelineStatus` type.

## Exported Helper Functions

- `getFriendlyStepLabel(step?: string): string`: Translates internal pipeline keys to friendly labels (e.g. "CONSTRUCTION" -> "Knowledge Graph Construction").

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `status` | `PipelineStatusType` | No | `undefined` | Pipeline state payload (status, step, percentage, error). |

## Usage Example

```tsx
import { PipelineStatus } from "@/components/molecules/PipelineStatus";

export function ExperimentProgress({ pipelineData }) {
  return <PipelineStatus status={pipelineData} />;
}
```
