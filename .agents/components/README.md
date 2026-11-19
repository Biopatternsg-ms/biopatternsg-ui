# BioPatternSG UI Component Catalog

Welcome to the official component catalog and design system documentation for **BioPatternSG UI**. This documentation resides in `.agents/components` as part of the **Spec-Driven Development (SDD)** infrastructure powered by SpecKit.

---

## 🏛️ Atomic Design Methodology

The components in this project are organized following the principles of **Atomic Design**, adapted to the modular architecture of BioPatternSG (*The Clinical Lens*):

```
.agents/components/
├── README.md                  # This master index
├── atoms/                     # Indivisible building blocks (15)
├── molecules/                 # Simple functional combinations of atoms (14)
└── organisms/                 # Complex sections, layouts, and standalone widgets (12)
```

1. **Atoms (`atoms/`):** Fundamental UI building blocks that cannot be broken down further without losing their functionality (buttons, inputs, labels, chips, avatars, canvas).
2. **Molecules (`molecules/`):** Groups of atoms bonded together into distinct functional units (form fields with validation, confirmation modals, autocomplete search inputs, step indicators).
3. **Organisms (`organisms/`):** Assemblies of molecules and atoms forming complex modules, full views, or advanced visualization engines (2D force graph viewer, dashboard layout, data table with pagination/sorting, dynamic forms).

---

## 📊 Catalog Summary

| Level | Component Count | Source Directory | Documentation |
| :--- | :---: | :--- | :--- |
| **Atoms** | 15 | [`src/components/atoms/`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms) | [View Atoms](#-atoms-15) |
| **Molecules** | 14 | [`src/components/molecules/`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules) | [View Molecules](#-molecules-14) |
| **Organisms** | 12 | [`src/components/organisms/`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms) | [View Organisms](#-organisms-12) |
| **Total** | **41** | `src/components/` | Fully Documented |

---

## 🧩 Atoms (15)

Fundamental, indivisible interface building blocks:

| Component | Description | Documentation | Source Code |
| :--- | :--- | :--- | :--- |
| **Avatar** | Displays user initials or fallback researcher profile icon. | [Avatar.md](atoms/Avatar.md) | [Avatar.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Avatar.tsx) |
| **Badge** | Compact pill badge with semantic clinical variants (success, warning, error). | [Badge.md](atoms/Badge.md) | [Badge.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Badge.tsx) |
| **Breadcrumb** | Hierarchical navigation breadcrumb with link routing and home button. | [Breadcrumb.md](atoms/Breadcrumb.md) | [Breadcrumb.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Breadcrumb.tsx) |
| **Button** | Clinical interactive button with variants, sizes, loading spinners, and icons. | [Button.md](atoms/Button.md) | [Button.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Button.tsx) |
| **Checkbox** | Accessible binary selector with label and error support. | [Checkbox.md](atoms/Checkbox.md) | [Checkbox.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Checkbox.tsx) |
| **DropdownMenu** | Interactive floating menu with outside click detection and keyboard escape. | [DropdownMenu.md](atoms/DropdownMenu.md) | [DropdownMenu.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/DropdownMenu.tsx) |
| **ForceGraphCanvas** | HTML5 2D Canvas rendering engine for high-density graph simulation. | [ForceGraphCanvas.md](atoms/ForceGraphCanvas.md) | [ForceGraphCanvas.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/ForceGraphCanvas.tsx) |
| **Input** | Accessible text input with embedded icons and error states. | [Input.md](atoms/Input.md) | [Input.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Input.tsx) |
| **Label** | Form label with red asterisk required indicator and error styling. | [Label.md](atoms/Label.md) | [Label.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Label.tsx) |
| **LoadingSpinner** | Animated circular spinner with multiple size and color variants. | [LoadingSpinner.md](atoms/LoadingSpinner.md) | [LoadingSpinner.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/LoadingSpinner.tsx) |
| **NavLink** | Navigation bar link with active route indicators and smooth transitions. | [NavLink.md](atoms/NavLink.md) | [NavLink.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/NavLink.tsx) |
| **RolePillBadge** | Specialized biological role pill badge with standardized category styling. | [RolePillBadge.md](atoms/RolePillBadge.md) | [RolePillBadge.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/RolePillBadge.tsx) |
| **Select** | Accessible dropdown selector wrapping `<select>` with custom chevron icon. | [Select.md](atoms/Select.md) | [Select.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Select.tsx) |
| **SynonymChip** | Entity alias chip with literature citation counts and removal handlers. | [SynonymChip.md](atoms/SynonymChip.md) | [SynonymChip.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/SynonymChip.tsx) |
| **Textarea** | Multiline text area with clinical focus rings and controlled resizing. | [Textarea.md](atoms/Textarea.md) | [Textarea.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/atoms/Textarea.tsx) |

---

## 🔬 Molecules (14)

Functional combinations of atoms solving distinct interface interactions:

| Component | Description | Documentation | Source Code |
| :--- | :--- | :--- | :--- |
| **BenefitCard** | Card presenting platform capabilities with leading thematic icons. | [BenefitCard.md](molecules/BenefitCard.md) | [BenefitCard.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/BenefitCard.tsx) |
| **BiologicalRolesModal** | Dialog for reviewing and managing inferred biological roles across entities. | [BiologicalRolesModal.md](molecules/BiologicalRolesModal.md) | [BiologicalRolesModal.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/BiologicalRolesModal.tsx) |
| **ErrorModal** | Alert dialog for notifying users of critical errors and execution failures. | [ErrorModal.md](molecules/ErrorModal.md) | [ErrorModal.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/ErrorModal.tsx) |
| **FormField** | Molecule bundling `Label`, input control, and validation error messages. | [FormField.md](molecules/FormField.md) | [FormField.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/FormField.tsx) |
| **GraphDataUploadModal** | Drag-and-drop modal for uploading biological dataset files (`.txt`). | [GraphDataUploadModal.md](molecules/GraphDataUploadModal.md) | [GraphDataUploadModal.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/GraphDataUploadModal.tsx) |
| **ManualStepHeader** | Header for multi-stage experiment wizards with back navigation. | [ManualStepHeader.md](molecules/ManualStepHeader.md) | [ManualStepHeader.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/ManualStepHeader.tsx) |
| **NodeDetailPanel** | Collapsible lateral panel exhibiting attributes of the active biological node. | [NodeDetailPanel.md](molecules/NodeDetailPanel.md) | [NodeDetailPanel.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeDetailPanel.tsx) |
| **NodeSearchSelect** | Real-time autocomplete search bar to locate nodes in dense networks. | [NodeSearchSelect.md](molecules/NodeSearchSelect.md) | [NodeSearchSelect.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/NodeSearchSelect.tsx) |
| **PathwayDetailModal** | Inspection modal for grouped metabolic pathways and participant genes. | [PathwayDetailModal.md](molecules/PathwayDetailModal.md) | [PathwayDetailModal.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PathwayDetailModal.tsx) |
| **PipelineStatus** | Live status indicator showing percentage progress for inference pipelines. | [PipelineStatus.md](molecules/PipelineStatus.md) | [PipelineStatus.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/PipelineStatus.tsx) |
| **StepStatsBar** | Horizontal metric bar displaying quantitative stats and performance deltas. | [StepStatsBar.md](molecules/StepStatsBar.md) | [StepStatsBar.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/StepStatsBar.tsx) |
| **Stepper** | Sequential wizard stage indicator with completed and active visual states. | [Stepper.md](molecules/Stepper.md) | [Stepper.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/Stepper.tsx) |
| **SuccessModal** | Success confirmation dialog celebrating completed workflows. | [SuccessModal.md](molecules/SuccessModal.md) | [SuccessModal.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/SuccessModal.tsx) |
| **UserMenu** | Dropdown menu for active user session with avatar, settings, and logout. | [UserMenu.md](molecules/UserMenu.md) | [UserMenu.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/molecules/UserMenu.tsx) |

---

## 🏢 Organisms (12)

Autonomous modular structures and complex interface sections:

| Component | Description | Documentation | Source Code |
| :--- | :--- | :--- | :--- |
| **BenefitsSection** | Landing page section showcasing features in a responsive card grid. | [BenefitsSection.md](organisms/BenefitsSection.md) | [BenefitsSection.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/BenefitsSection.tsx) |
| **DashboardLayout** | Master layout assembling `Sidebar`, `TopBar`, and React Router `<Outlet />`. | [DashboardLayout.md](organisms/DashboardLayout.md) | [DashboardLayout.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DashboardLayout.tsx) |
| **DataForm** | Declarative form generator powered by React Hook Form and Zod schemas. | [DataForm.md](organisms/DataForm.md) | [DataForm.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DataForm.tsx) |
| **DataTable** | Generic data table organism with column sorting, pagination, and selection. | [DataTable.md](organisms/DataTable.md) | [DataTable.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/DataTable.tsx) |
| **Footer** | Institutional footer with columnized navigation links and ASF copyright. | [Footer.md](organisms/Footer.md) | [Footer.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Footer.tsx) |
| **ForceGraphViewer** | Interactive 2D/3D biological network visualization and search workspace. | [ForceGraphViewer.md](organisms/ForceGraphViewer.md) | [ForceGraphViewer.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/forceGraph/ForceGraphViewer.tsx) |
| **Header** | Public landing page header with logo, navigation links, and login CTA. | [Header.md](organisms/Header.md) | [Header.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Header.tsx) |
| **HeroSection** | Hero banner highlighting value proposition with embedded login form. | [HeroSection.md](organisms/HeroSection.md) | [HeroSection.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/HeroSection.tsx) |
| **Sidebar** | Collapsible lateral navigation panel for dashboard workspaces. | [Sidebar.md](organisms/Sidebar.md) | [Sidebar.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/Sidebar.tsx) |
| **TopBar** | Top dashboard bar embedding breadcrumbs, mobile toggles, and user menu. | [TopBar.md](organisms/TopBar.md) | [TopBar.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/TopBar.tsx) |
| **TrustBadges** | Scientific trust badges showcasing verified data source integrations. | [TrustBadges.md](organisms/TrustBadges.md) | [TrustBadges.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/TrustBadges.tsx) |
| **WorkflowSection** | Visual diagram explaining the 4-phase scientific pipeline of BioPatternSG. | [WorkflowSection.md](organisms/WorkflowSection.md) | [WorkflowSection.tsx](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/WorkflowSection.tsx) |

---

## 🛠️ Best Practices & Lifecycle Rules (SDD & Atomic Design)

1. **Mandatory Documentation Synchronization (Continuous SDD Rule):**
   - Whenever a new component is created, its corresponding markdown documentation must be created immediately in `.agents/components/<level>/<ComponentName>.md`, and added to this `README.md`.
   - Whenever an existing component is updated (props modified, new variants, behavior changes), its corresponding documentation file must be updated in tandem.
2. **Strict Single Responsibility:** Atoms must never contain business logic, external API calls, or global state mutations.
3. **Progressive Composition:** Molecules compose atoms; organisms compose molecules and atoms. Organisms must never be imported into molecules.
4. **Domain Independence:** Components must never define internal business models. All domain entities belong in `src/domain/models/`.
