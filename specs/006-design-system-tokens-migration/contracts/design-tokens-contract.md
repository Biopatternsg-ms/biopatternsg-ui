# Interface Contract: Design Tokens & Styling Normalization

**Feature**: `006-design-system-tokens-migration`  
**Date**: 2026-11-19  
**Status**: Completed  
**Spec Reference**: [spec.md](../spec.md)

---

## 1. Module Export Contract: `src/config/biologicalCategories.ts`

```typescript
/**
 * Canonical dictionary mapping biological role keys to clinical hex colors.
 */
export const ROLE_COLORS: Record<string, string>;

/**
 * Fallback color used when a role is unknown or undefined.
 */
export const DEFAULT_ROLE_COLOR: string;

/**
 * Resolves the canonical hex color for a given biological role.
 * Sanitizes input (lowercasing, trimming, replacing hyphens/spaces with underscores).
 *
 * @param role Raw role string (e.g. "Transcription Factor", "tf", "protein")
 * @returns Hex color string (e.g. "#ec4899", "#ff6b35")
 */
export function getRoleColor(role?: string): string;

/**
 * Formats a biological role string into a human-readable title.
 *
 * @param role Raw role string
 * @returns Human-friendly name (e.g. "Transcription Factor", "Adaptor Protein")
 */
export function formatRoleName(role?: string): string;
```

---

## 2. Tailwind CSS Token Extension Contract: `tailwind.config.ts`

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: "#0050cb",
        "surface-sidebar": "#eef3ff",
      },
      backgroundImage: {
        "grid-dots": "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
      },
    },
  },
};
```

---

## 3. Component Styling Normalization Rules

| Component | Target File | Former Violation | Compliant Replacement |
|---|---|---|---|
| `Sidebar` | `src/components/organisms/Sidebar.tsx` | `bg-[#eef3ff]` | `bg-surface-sidebar` |
| `Register` | `src/modules/public/Register.tsx` | `style={{ backgroundImage: "...", backgroundSize: "..." }}` | `className="... bg-grid-dots bg-[size:40px_40px]"` |
| `RecoveryPassword` | `src/modules/public/RecoveryPassword.tsx` | `style={{ backgroundImage: "...", backgroundSize: "..." }}` | `className="... bg-grid-dots bg-[size:40px_40px]"` |
| `Stepper` | `src/components/molecules/Stepper.tsx` | Static layout in `style` | All layout in Tailwind classes; `style={{ width: `${percent}%` }}` allowed exclusively for dynamic bar width |
| `NodeDetailPanel` | `src/components/molecules/NodeDetailPanel.tsx` | `style={{ backgroundColor: `${color}20`, color }}` | Layout in Tailwind; `style={{ backgroundColor: `${color}20`, color }}` allowed exclusively for data color |
| `NodeSearchSelect` | `src/components/molecules/NodeSearchSelect.tsx` | `style={{ backgroundColor: color }}` | Layout in Tailwind; `style={{ backgroundColor: color }}` allowed exclusively for swatch dot |
| `PathwayDetailModal` | `src/components/molecules/PathwayDetailModal.tsx` | Local `ROLE_COLORS` array + inline styles | Import from `biologicalCategories.ts`; all static layout in Tailwind |
| `PathwayListView` | `src/modules/dashboard/experiments/PathwayListView.tsx` | Local `ROLE_COLORS` array | Import from `biologicalCategories.ts` |
| `PathwayGraphView` | `src/modules/dashboard/experiments/PathwayGraphView.tsx` | Hardcoded `#87ceeb`, `#ffffff` | `GRAPH_PROFILES[profile].background` |
| `ResultsGraph` | `src/modules/public/ResultsGraph.tsx` | Hardcoded `#87ceeb`, `#ffffff` | `GRAPH_PROFILES[profile].background` |

---

## 4. Documentation Synchronization Contract

Per Constitution Principle II, each modified component must have its markdown documentation verified and synchronized in:
- `.agents/components/molecules/Stepper.md`
- `.agents/components/molecules/NodeDetailPanel.md`
- `.agents/components/molecules/NodeSearchSelect.md`
- `.agents/components/molecules/PathwayDetailModal.md`
- `.agents/components/organisms/Sidebar.md`
