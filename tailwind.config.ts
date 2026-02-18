import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        wobble: "wobble 0.5s ease-in-out",
        wobbleLeft: "wobbleLeft 0.3s ease-out",
        wobbleRight: "wobbleRight 0.3s ease-out",
        wobbleUp: "wobbleUp 0.3s ease-out",
        wobbleDown: "wobbleDown 0.3s ease-out",
        lightWobble: "lightWobble 0.3s ease-out",
      },
      keyframes: {
        wobble: {
          "0%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "25%": { transform: "translate(-50%, -50%) scale(1.25) rotate(5deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "75%": { transform: "translate(-50%, -50%) scale(1.25) rotate(-5deg)" },
          "100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
        },
        wobbleLeft: {
          "0%": { transform: "translate(-50%, -50%) rotate(-2deg)" },
          "50%": { transform: "translate(-50%, -50%) rotate(-5deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(-2deg)" },
        },
        wobbleRight: {
          "0%": { transform: "translate(-50%, -50%) rotate(2deg)" },
          "50%": { transform: "translate(-50%, -50%) rotate(5deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(2deg)" },
        },
        wobbleUp: {
          "0%": { transform: "translate(-50%, -50%) translateY(0)" },
          "50%": { transform: "translate(-50%, -50%) translateY(-4px)" },
          "100%": { transform: "translate(-50%, -50%) translateY(0)" },
        },
        wobbleDown: {
          "0%": { transform: "translate(-50%, -50%) translateY(0)" },
          "50%": { transform: "translate(-50%, -50%) translateY(4px)" },
          "100%": { transform: "translate(-50%, -50%) translateY(0)" },
        },
        lightWobble: {
          "0%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(2deg)" },
          "100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
        },
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
