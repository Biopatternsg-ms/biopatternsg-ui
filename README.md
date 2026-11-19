# BioPatternSG UI — The Clinical Lens for Biological Networks

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**BioPatternSG UI** is the official web application of the **BioPatternSG** biomedical platform. It provides an intuitive, high-performance clinical workspace ("*The Clinical Lens*") for biological network analysis, ontology alignment, experiment configuration, and machine learning inference visualization.

---

## 📑 Table of Contents

- [Core Capabilities](#-core-capabilities)
- [Architecture & Governance Documentation](#-architecture--governance-documentation)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Execution Profiles & Environments](#-execution-profiles--environments)
- [Visual & Biological Contrast Profiles](#-visual--biological-contrast-profiles)
- [User Roles & RBAC](#-user-roles--rbac)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [License](#-license)

---

## 🔬 Core Capabilities

- **Interactive Knowledge Graph Explorer:** High-density 2D (HTML5 Canvas) and 3D (Three.js) graph visualization with continuous physical force simulation, real-time node searching, and subgraph inspection.
- **Guided Experimentation Wizard:** Multi-step wizard (`createExperiment/`) for configuring dataset inputs, embedding models (TransE, RotatE, ComplEx), and ontology parameters.
- **Pipeline Monitoring:** Real-time visual tracking of bioinformatics inference execution (`PipelineStatus`) with percentage indicators and human-readable stage descriptions.
- **Pathway & Biological Role Analysis:** Deep inspection of signaling/metabolic pathways (`PathwayDetailModal`) and inferred biological roles (`BiologicalRolesModal`) backed by PubMed and Reactome references.

---

## 🏛️ Architecture & Governance Documentation

This project follows **Clean / Hexagonal Architecture** combined with **Atomic Design** and **Spec-Driven Development (SDD)** via SpecKit.

For in-depth architectural specifications and component guides, refer to:

- 📐 **[Software Architecture Specification](.agents/architecture.md):** Comprehensive breakdown of architectural layers (Domain, Adapters, Services, Core HTTP, Atomic Design, and Modules), data flow, and deployment diagrams.
- 🛡️ **[Architecture Rules & Guidelines](.agents/architecture-rules.md):** Authoritative rules governing component composition, mandatory adapter patterns, domain isolation, and Zod form validation.
- 🧩 **[Atomic Design Component Catalog](.agents/components/README.md):** Complete catalog with dedicated documentation for all **41 components**:
  - [Atoms (15)](.agents/components/README.md#-atoms-15)
  - [Molecules (14)](.agents/components/README.md#-molecules-14)
  - [Organisms (12)](.agents/components/README.md#-organisms-12)
- 📜 **[SpecKit Constitution](.specify/memory/constitution.md):** Ratified governance rules (`v1.0.0`) enforcing non-negotiable standards and quality gates for autonomous agents and contributors.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (tested with Node 22+ / 24)
- **npm**: `v10.x` or higher

### Installation

Clone the repository and install dependencies:

```bash
cd services/biopatternsg-ui
npm install
```

### Running Locally (Development Mode)

```bash
npm run dev
```

The application will start at `http://localhost:5173`. In development mode, Vite's local reverse proxy forwards API requests seamlessly to avoid CORS issues.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) under `development` mode. |
| `npm run prod` | Runs the Vite dev server simulating the `production` environment profile. |
| `npm run build` | Type-checks with TypeScript (`tsc -b`) and builds production assets into `dist/`. |
| `npm run build:local` | Builds the application using development environment configuration (`--mode development`). |
| `npm run build:prod` | Builds optimized static assets for production deployment (`--mode production`). |
| `npm run preview` | Locally serves the pre-built `dist/` directory for release verification. |
| `npm run lint` | Runs ESLint across all TypeScript and TSX files. |

---

## ⚙️ Execution Profiles & Environments

The application supports multiple execution modes governed by environment files:

### 1. Development Profile (`.env.development`)
- Activated via `npm run dev`.
- **Identity Emulation:** Injects simulated user context headers (`x-user-id` and `x-user-roles=["researcher"]`) through request interceptors, enabling frontend development without mandatory OAuth2/Keycloak redirects.
- **Local Proxying:** `vite.config.ts` transparently proxies `/config-and-control`, `/pubmed`, and `/inferences` to backend endpoints (`https://bioai.redclara.net/api` or local services) to bypass browser CORS preflight.

### 2. Production Profile (`.env.production`)
- Activated via `npm run build:prod` or `npm run prod`.
- **API Resolution:** Routes all requests through the unified KrakenD API Gateway endpoint (`VITE_API_URL=/api`).
- Strict authentication tokens (JWT) are extracted and refreshed dynamically via `src/core/http/httpClient.ts`.

---

## 🎨 Visual & Biological Contrast Profiles

The biological graph visualization engine (`ForceGraphViewer`) provides three specialized color and contrast profiles:

| Profile | Background | Best Suited For |
| :--- | :--- | :--- |
| **`black`** | High-contrast black (`#000000`) | Fluorescence-style biological entity highlighting and dark-mode workstations. |
| **`white`** | Clean crisp white (`#ffffff`) | Publication-grade figures, print reports, and scientific papers. |
| **`skyblue`** | Soft blue tone (`#e0f2fe`) | Minimizing visual fatigue during extended discovery and research sessions. |

Biological entities (`PROTEIN`, `GENE`, `PATHWAY`, `CHEMICAL`, `DISEASE`) are styled using standardized clinical tokens defined in [`src/config/biologicalCategories.ts`](src/config/biologicalCategories.ts).

---

## 👥 User Roles & RBAC

BioPatternSG UI enforces Role-Based Access Control (RBAC) via route guards (`src/core/router/ProtectedRoute.tsx`) and configuration mappings (`src/config/roles.ts`):

- **`admin`**: Full system administration, role provisioning, and user management.
- **`admin-user`**: Operational user account management and researcher support.
- **`researcher`**: End-to-end biological research workspace (experiment creation, ontology mapping, inference runs, and graph analysis).

---

## 🐳 Docker & Containerized Deployment

A production-ready `Dockerfile` and `nginx.conf` are included in the repository.

### CI/CD Deployment Mode (Default)
Optimized for pipelines (e.g., Jenkins). Assumes assets have been pre-compiled to `dist/`:

```bash
# 1. Build the production bundle
npm run build:prod

# 2. Build the lightweight Nginx container
docker build -t biopatternsg-ui:latest .

# 3. Run the container
docker run -d -p 80:80 --name biopatternsg-ui biopatternsg-ui:latest
```

### Nginx SPA Routing
The included [`nginx.conf`](nginx.conf) specifies:
```nginx
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}
```
This ensures that deep URL paths handled by React Router (HTML5 History API) resolve properly without 404 errors on browser reload.

---

## 📄 License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for full license text.
