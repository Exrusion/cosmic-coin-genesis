import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Cosmic Color System
        space: {
          deep: "hsl(var(--space-deep))",
          medium: "hsl(var(--space-medium))",
          light: "hsl(var(--space-light))",
        },
        life: {
          birth: "hsl(var(--life-birth))",
          growth: "hsl(var(--life-growth))",
          energy: "hsl(var(--life-energy))",
        },
        death: {
          fire: "hsl(var(--death-fire))",
          explosion: "hsl(var(--death-explosion))",
          void: "hsl(var(--death-void))",
        },
        nebula: {
          purple: "hsl(var(--nebula-purple))",
          blue: "hsl(var(--nebula-blue))",
          pink: "hsl(var(--nebula-pink))",
        },
        star: {
          glow: "hsl(var(--star-glow))",
        },
      },
      backgroundImage: {
        'cosmic': 'var(--gradient-cosmic)',
        'life': 'var(--gradient-life)',
        'death': 'var(--gradient-death)',
        'nebula': 'var(--gradient-nebula)',
        // Planet textures
        'planet-earth': 'var(--planet-earth)',
        'planet-mars': 'var(--planet-mars)',
        'planet-venus': 'var(--planet-venus)',
        'planet-gas': 'var(--planet-gas)',
        'planet-ice': 'var(--planet-ice)',
        'planet-volcanic': 'var(--planet-volcanic)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // Cosmic Animations
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "twinkle": {
          "0%, 50%, 100%": { opacity: "1" },
          "25%, 75%": { opacity: "0.3" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--star-glow) / 0.5)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--star-glow)), 0 0 60px hsl(var(--star-glow) / 0.3)" },
        },
        "birth": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "destruction": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        "nebula-drift": {
          "0%": { transform: "translateX(-100px) rotate(0deg)" },
          "100%": { transform: "translateX(100px) rotate(360deg)" },
        },
        "cosmic-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "energy-pulse": {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.1)", filter: "brightness(1.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Cosmic Animations
        "float": "float 6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "birth": "birth 2s ease-out",
        "destruction": "destruction 1.5s ease-in",
        "nebula-drift": "nebula-drift 20s linear infinite",
        "cosmic-rotate": "cosmic-rotate 30s linear infinite",
        "energy-pulse": "energy-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
