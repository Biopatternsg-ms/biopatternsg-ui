/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Button — Atomic Component
 *
 * Botón reutilizable del sistema de diseño "The Clinical Lens".
 * Sigue el patrón Atomic Design como átomo base.
 *
 * Importación:
 *   import { Button } from "@/components/atoms/Button";
 *
 * Uso básico:
 *   <Button variant="primary" size="md" onClick={handleClick}>
 *     Crear Red
 *   </Button>
 *
 * Uso polimórfico (renderizar como <a> o <Link>):
 *   <Button variant="ghost" asChild>
 *     <Link to="/dashboard">Dashboard</Link>
 *   </Button>
 *
 * Variantes disponibles:
 *   - primary:        CTA principal (gradiente azul)
 *   - ghost:          Botón sutil sin fondo (acciones secundarias, cancelar)
 *   - surface:        Botón con fondo de superficie (énfasis medio)
 *   - outline:        Estilo glass con borde translúcido (sobre fondos oscuros)
 *   - link:           Apariencia de enlace de texto (navegación inline)
 *   - destructive:    Acción peligrosa (eliminar, desconectar)
 *   - icon:           Botón cuadrado solo-icono (color outline → primary)
 *   - icon-destructive: Botón cuadrado solo-icono (color outline → error)
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Utilidad de class-variance-authority (CVA) que genera clases de Tailwind
 * condicionales basadas en las props variant y size.
 *
 * Uso interno:
 *   buttonVariants({ variant: "primary", size: "md" })
 *   // => "inline-flex items-center ... pulse-gradient text-white ... px-5 py-2"
 *
 * También se exporta para tests, Storybook o composiciones avanzadas.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /** CTA principal. Gradiente azul (pulse-gradient) con texto blanco.
         *  Usar para acciones principales: submit de formularios, navegación primaria, crear.
         *  Aplica sombra glow (shadow-primary-glow) al hover. */
        primary:
          "pulse-gradient text-white shadow-md hover:shadow-primary-glow font-bold",

        /** Botón sutil sin fondo por defecto. Solo muestra background al hover
         *  (hover:bg-surface-container-low). Ideal para acciones secundarias, cancelar,
         *  o botones de icono en tablas. Sigue la regla "No-Line". */
        ghost:
          "text-on-surface hover:bg-surface-container-low font-medium",

        /** Botón con fondo de superficie (bg-surface-container-high).
         *  Usar para acciones secundarias que necesitan más énfasis visual que ghost
         *  pero menos que primary. */
        surface:
          "bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest",

        /** Estilo glass con borde blanco translúcido (border-white/20) y fondo primario al 20%.
         *  Incluye backdrop-blur. Diseñado para usarse sobre fondos oscuros o gradientes
         *  (ej. sección CTA). */
        outline:
          "bg-primary-container/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 font-bold",

        /** Apariencia de enlace de texto. Sin fondo ni borde; solo texto primary
         *  con subrayado al hover. Para navegación inline dentro de formularios o textos
         *  (ej. "¿Olvidaste tu contraseña?"). */
        link:
          "text-primary font-bold hover:underline decoration-2 underline-offset-4",

        /** Acción peligrosa o irreversible. Fondo rojo (bg-error) con texto blanco.
         *  Usar exclusivamente para: eliminar, desconectar, borrar. */
        destructive:
          "bg-error text-on-error hover:opacity-90 font-bold",

        /** Botón cuadrado solo-icono. Color outline → primary al hover.
         *  Combinar obligatoriamente con size="icon" para dimensiones correctas.
         *  Ej: <Button variant="icon" size="icon" title="Editar"><Pencil /></Button> */
        icon:
          "text-outline hover:text-primary transition-colors duration-300 p-1.5 hover:bg-surface-container-low",

        /** Botón cuadrado solo-icono destructivo. Color outline → error al hover.
         *  Combinar obligatoriamente con size="icon".
         *  Ej: <Button variant="icon-destructive" size="icon" title="Eliminar"><Trash2 /></Button> */
        iconDestructive:
          "text-outline hover:text-error transition-colors duration-300 p-1.5 hover:bg-surface-container-low",
      },
      size: {
        /** Pequeño. Para tablas densas o espacios reducidos. */
        sm: "px-4 py-2 text-xs rounded-lg",

        /** Medio (default). Tamaño estándar para la mayoría de botones. */
        md: "px-5 py-2 text-sm rounded-lg",

        /** Grande. Para CTAs en cards o formularios. */
        lg: "px-8 py-4 text-sm rounded-xl",

        /** Extra grande. Para hero sections o bloques CTA prominentes. */
        xl: "px-10 py-5 text-lg rounded-2xl font-black",

        /** Solo icono. Cuadrado (h-9 w-9) para botones que solo contienen un icono.
         *  Usar combinado con variant="icon" o variant="icon-destructive". */
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/**
 * Props del componente Button.
 *
 * Extiende todas las props nativas de HTMLButtonElement (onClick, disabled, type, etc.)
 * más las variantes de CVA (variant, size) y la prop asChild para polimorfismo.
 *
 * @property asChild — Cuando es true, renderiza el hijo directo (ej. <Link>) en lugar de <button>,
 *                     aplicando las clases de estilo vía Radix Slot. Útil para navegación con React Router.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Componente Button polimórfico con estilos del sistema de diseño "Clinical Lens".
 *
 * - Soporta ref forwarding.
 * - Las clases extra (className) se mergean de forma segura con cn() sin conflictos.
 * - Uso básico: <Button variant="primary" size="md">Texto</Button>
 * - Uso con asChild: <Button asChild><a href="...">Link</a></Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
