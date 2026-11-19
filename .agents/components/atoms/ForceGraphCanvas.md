# ForceGraphCanvas (Atom)

The **ForceGraphCanvas** component is a high-performance 2D rendering canvas atom built on HTML5 `<canvas>`. It visualizes dense biological networks with smooth physical force simulation, node dragging, zooming, and panning.

## Overview

- **Level:** Atom
- **Source Code:** [`src/components/atoms/ForceGraphCanvas.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/ForceGraphCanvas.tsx)
- **Performance:** Driven by `requestAnimationFrame` and direct 2D Canvas context rendering to support thousands of entities smoothly.

## Dependencies

- Integrated physical simulation engine.
- Types imported from `forceGraphTypes.ts` and `forceGraphProfiles.ts`.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `nodes` | `GraphNode[]` | Yes | - | Biological nodes to render with coordinates and metadata. |
| `links` | `GraphLink[]` | Yes | - | Graph edges representing biological relations. |
| `profile` | `GraphVisualProfile` | Yes | - | Visual profile defining background, node, edge, and label colors. |
| `width` | `number` | No | `800` | Canvas width in pixels. |
| `height` | `number` | No | `600` | Canvas height in pixels. |
| `selectedNodeId` | `string \| null` | No | `null` | Active node ID highlighted in the viewport. |
| `onNodeClick` | `(node: GraphNode) => void` | No | `undefined` | Node selection click callback. |
| `onNodeHover` | `(node: GraphNode \| null) => void` | No | `undefined` | Hover event callback. |
| `colorMap` | `Record<string, string>` | No | `{}` | Dynamic biological type to HEX color mapping. |

## Capabilities

- **Viewport Coordinates:** Zoom scaling and panning transforms.
- **Hit Detection:** Proximity calculations matching cursor coordinates to the nearest node.
- **Contextual Dimming:** Highlights connected subgraphs while dimming unrelated nodes.
