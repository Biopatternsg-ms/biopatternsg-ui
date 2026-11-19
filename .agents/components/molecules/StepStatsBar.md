# StepStatsBar (Molecule)

The **StepStatsBar** component is a horizontal metrics bar molecule presenting key numerical indicators and deltas for an experimental phase (e.g., nodes identified, edges filtered, inference latency).

## Overview

- **Level:** Molecule
- **Source Code:** [`src/components/molecules/StepStatsBar.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/StepStatsBar.tsx)

## Dependencies

- `@/lib/utils`: `cn` class utility.

## Component Properties (Props)

### `StepStatItem` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `label` | `string` | Yes | Metric name label (e.g. "Identified Nodes"). |
| `value` | `string \| number` | Yes | Quantitative or percentage value. |
| `change` | `string` | No | Percentage variation or delta compared to previous run. |
| `isPositive` | `boolean` | No | Styles variation in green (positive) or red (negative). |

### `StepStatsBarProps` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `stats` | `StepStatItem[]` | Yes | - | Array of metric items to render. |
| `className` | `string` | No | `undefined` | Additional Tailwind CSS classes. |

## Usage Example

```tsx
import { StepStatsBar } from "@/components/molecules/StepStatsBar";

export function MetricsHeader() {
  return (
    <StepStatsBar
      stats={[
        { label: "Loaded Nodes", value: 1250 },
        { label: "Inferred Edges", value: 3410, change: "+15%", isPositive: true },
        { label: "Average Latency", value: "1.2s" }
      ]}
    />
  );
}
```
