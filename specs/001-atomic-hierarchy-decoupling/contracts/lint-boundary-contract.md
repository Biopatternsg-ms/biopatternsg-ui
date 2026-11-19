# Boundary Lint Contract: ESLint Architectural Rules

**Feature**: `001-atomic-hierarchy-decoupling`  
**Status**: Completed  
**Date**: 2026-11-18  

---

## 1. Boundary Enforcement Matrix

The following table summarizes prohibited and permitted import origins across the UI architectural hierarchy.

| Directory Layer | Permitted Import Origins | Prohibited Import Origins |
|-----------------|--------------------------|---------------------------|
| **Atoms** (`src/components/atoms/**`) | External UI utilities (`clsx`, `tailwind-merge`, `lucide-react`, Radix UI primitives), `@/lib/*` | `@/components/atoms/*`, `@/components/molecules/*`, `@/components/organisms/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, `react-router-dom`, `@/modules/*` |
| **Molecules** (`src/components/molecules/**`) | `@/components/atoms/*`, other `@/components/molecules/*`, `@/domain/models/*`, `@/config/*`, `@/lib/*` | `@/components/organisms/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, `react-router-dom`, `@/modules/*` |
| **Organisms** (`src/components/organisms/**`) | `@/components/atoms/*`, `@/components/molecules/*`, `@/domain/models/*`, `@/config/*`, `@/context/*`, `@/lib/*` | `@/services/*`, `@/adapters/*`, `@/modules/*` |
| **Domain Models** (`src/domain/models/**`) | Pure TypeScript utility types | `@/components/*`, `@/modules/*`, `@/services/*`, `@/adapters/*`, `@/context/*`, UI framework packages |

---

## 2. ESLint Configuration Pattern (`eslint.config.js`)

In modern Flat Config (`defineConfig`), the boundary rules are configured via `no-restricted-imports`:

```javascript
// Atom boundary rules
{
  files: ['src/components/atoms/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/components/atoms/*'], message: 'Atoms must not import other atoms.' },
          { group: ['@/components/molecules/*'], message: 'Atoms must not import molecules.' },
          { group: ['@/components/organisms/*'], message: 'Atoms must not import organisms.' },
          { group: ['@/services/*', '@/services'], message: 'Atoms must not import services.' },
          { group: ['@/adapters/*', '@/adapters'], message: 'Atoms must not import adapters.' },
          { group: ['@/context/*', '@/context'], message: 'Atoms must not import React context.' },
          { group: ['react-router-dom'], message: 'Atoms must not import router hooks.' },
        ],
      },
    ],
  },
},

// Molecule boundary rules
{
  files: ['src/components/molecules/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/components/organisms/*'], message: 'Molecules must not import organisms.' },
          { group: ['@/services/*', '@/services'], message: 'Molecules must not import services.' },
          { group: ['@/adapters/*', '@/adapters'], message: 'Molecules must not import adapters.' },
          { group: ['@/context/*', '@/context'], message: 'Molecules must not import React context.' },
          { group: ['react-router-dom'], message: 'Molecules must not import router hooks.' },
        ],
      },
    ],
  },
},

// Organism boundary rules
{
  files: ['src/components/organisms/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/services/*', '@/services'], message: 'Organisms must not import concrete services.' },
          { group: ['@/adapters/*', '@/adapters'], message: 'Organisms must not import adapters directly.' },
        ],
      },
    ],
  },
},

// Domain layer boundary rules
{
  files: ['src/domain/models/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@/components/*'], message: 'Domain models must not import UI components.' },
          { group: ['@/services/*'], message: 'Domain models must not import service DTOs.' },
          { group: ['@/adapters/*'], message: 'Domain models must not import adapters.' },
          { group: ['@/context/*'], message: 'Domain models must not import context.' },
        ],
      },
    ],
  },
}
```
