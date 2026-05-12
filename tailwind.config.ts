import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      // ─── Design Token Colors (from HTML + Clinical Lens rules) ───────────
      colors: {
        // Brand primitives
        primary: "#0050cb",
        "primary-container": "#0066ff",
        secondary: "#425ca0",
        tertiary: "#a33200",

        // Surface / Depth (Tonal Architecture)
        "surface-base": "#f8f9ff",
        "surface-section": "#eff4ff",
        "surface-card": "#ffffff",

        // Material Color System tokens (extracted from HTML)
        "inverse-on-surface": "#f1effa",
        "inverse-primary": "#99c2ff",
        "on-primary-container": "#e0edff",
        "on-background": "#1a1b22",
        "secondary-fixed-dim": "#bec6e0",
        "surface-container-highest": "#e3e1ec",
        "tertiary-container": "#007650",
        "surface-container": "#eeedf7",
        "surface-bright": "#fbf8ff",
        "on-error-container": "#93000a",
        "secondary-fixed": "#dae2fd",
        error: "#ba1a1a",
        "on-surface": "#1a1b22",
        "surface-container-high": "#e8e7f1",
        "surface-container-low": "#f4f2fd",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#131b2e",
        background: "#fbf8ff",
        "on-tertiary-container": "#76ffc2",
        "on-tertiary": "#ffffff",
        "inverse-surface": "#2f3038",
        "primary-fixed": "#d9e8ff",
        surface: "#fbf8ff",
        "surface-tint": "#0066FF",
        "tertiary-fixed": "#6ffbbe",
        "on-tertiary-fixed-variant": "#005236",
        "on-secondary-fixed-variant": "#3f465c",
        "on-secondary-container": "#5c647a",
        "primary-fixed-dim": "#99c2ff",
        "secondary-container": "#dae2fd",
        "tertiary-fixed-dim": "#4edea3",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e3e1ec",
        "on-primary-fixed-variant": "#004db3",
        outline: "#7b7487",
        "on-tertiary-fixed": "#002113",
        "on-primary-fixed": "#001f4d",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "outline-variant": "#ccc3d8",
        "on-surface-variant": "#4a4455",
        "on-primary": "#ffffff",
        "surface-dim": "#dad9e3",

        // Shadcn UI CSS-variable bridge
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      // ─── Ambient Shadows (tinted, no grey defaults) ───────────────────────
      boxShadow: {
        sm: "0 2px 8px -2px rgba(13, 28, 46, 0.06)",
        DEFAULT: "0 4px 24px -4px rgba(13, 28, 46, 0.08)",
        md: "0 4px 24px -4px rgba(13, 28, 46, 0.08)",
        lg: "0 8px 40px -8px rgba(13, 28, 46, 0.12)",
        xl: "0 16px 64px -12px rgba(13, 28, 46, 0.14)",
        "primary-glow": "0 8px 32px -4px rgba(0, 80, 203, 0.20)",
        nav: "0 8px 32px 0 rgba(0, 102, 255, 0.04)",
      },

      // ─── Letter Spacing ───────────────────────────────────────────────────
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        widest: "0.3em",
      },

      // ─── Tracking for headings ────────────────────────────────────────────
      lineHeight: {
        none: "0.9",
      },
    },
  },
  plugins: [],
} satisfies Config;
