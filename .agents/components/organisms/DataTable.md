# DataTable (Organism)

The **DataTable** component is an interactive data table organism for dense collections of biological records, experiments, and measurements. It supports column sorting, pagination, row selection, loading spinners, and empty states.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/DataTable.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DataTable.tsx)

## Dependencies

- `lucide-react`: `ChevronLeft`, `ChevronRight`, `ArrowUpDown`, `ArrowUp`, `ArrowDown` icons.
- `@/components/atoms/LoadingSpinner`: Async loading indicator.
- `@/components/atoms/Button`: Pagination navigation buttons.

## Component Properties (Props)

### `ColumnDef<T>` Interface
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `key` | `string` | Yes | Unique column key identifier. |
| `header` | `string \| React.ReactNode` | Yes | Header title or custom node. |
| `sortable` | `boolean` | No | Enables ascending/descending sort. |
| `render` | `(item: T) => React.ReactNode` | No | Custom cell render function. |

### `DataTableProps<T>` Interface
| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `data` | `T[]` | Yes | - | Array of row items to render. |
| `columns` | `ColumnDef<T>[]` | Yes | - | Column definitions array. |
| `isLoading` | `boolean` | No | `false` | Displays centered loading spinner. |
| `emptyMessage` | `string` | No | `"No records found"` | Empty state fallback message. |
| `pageSize` | `number` | No | `10` | Rows per page. |
| `totalItems` | `number` | No | `data.length` | Total item count for server-side pagination. |
| `page` | `number` | No | `1` | Active page index (1-based). |
| `onPageChange` | `(page: number) => void` | No | `undefined` | Page change handler. |
| `onSort` | `(colKey: string, dir: "asc" \| "desc") => void` | No | `undefined` | Column sort handler. |
| `onRowClick` | `(item: T) => void` | No | `undefined` | Row click handler. |

## Usage Example

```tsx
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";

interface GeneItem {
  id: string;
  symbol: string;
  score: number;
}

const columns: ColumnDef<GeneItem>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "symbol", header: "Symbol", sortable: true },
  { key: "score", header: "Score", sortable: true, render: (g) => g.score.toFixed(3) }
];

export function GenesTable({ genes, loading }) {
  return (
    <DataTable
      data={genes}
      columns={columns}
      isLoading={loading}
      onRowClick={(gene) => console.log("Selected gene:", gene.symbol)}
    />
  );
}
```
