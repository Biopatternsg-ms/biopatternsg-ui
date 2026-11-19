# HeroSection (Organism)

The **HeroSection** is the primary welcome organism on the landing page. It introduces the clinical value proposition (*"Build Gene Regulatory Networks with AI"*) and embeds the authentication card via `DataForm`.

## Overview

- **Level:** Organism
- **Source Code:** [`src/components/organisms/HeroSection.tsx`](file:///home/yacson/Proyectos/biopatternsg-ms/services/biopatternsg-ui/src/components/organisms/HeroSection.tsx)
- **Architecture:** Pure presentational organism decoupled from direct service calls and adapters. The enclosing feature module (`Landing.tsx`) supplies the configured `loginConfig`.

## Dependencies

- `zod`: Validation schema `loginSchema`.
- `@/components/organisms/DataForm`: Declarative form organism.
- `@/components/organisms/DataFormConfig`: Form configuration contracts.
- `@/domain/models/Auth`: `LoginFormValues` domain type.

## Component Properties (Props)

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `loginConfig` | `DataFormConfig<LoginFormValues>` | Yes | - | Configured login form contract containing fields, submit handler, and modal callbacks. |

## Usage Example

```tsx
import { HeroSection } from "@/components/organisms/HeroSection";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";
import type { LoginFormValues } from "@/domain/models/Auth";

export function LandingPage({ loginConfig }: { loginConfig: DataFormConfig<LoginFormValues> }) {
  return (
    <section>
      <HeroSection loginConfig={loginConfig} />
    </section>
  );
}
```
