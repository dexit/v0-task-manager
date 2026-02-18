/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        wobbleLeft: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(var(--tilt-angle))" },
        },
        wobbleRight: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(var(--tilt-angle))" },
        },
        wobbleUp: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(var(--tilt-angle))" },
        },
        wobbleDown: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1.25) rotate(0deg)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.25) rotate(var(--tilt-angle))" },
        },
        lightWobble: {
          "0%, 100%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "25%": { transform: "translate(-50%, -50%) rotate(-3deg)" },
          "75%": { transform: "translate(-50%, -50%) rotate(3deg)" },
        },
      },
      animation: {
        wobbleLeft: "wobbleLeft 0.3s ease-in-out",
        wobbleRight: "wobbleRight 0.3s ease-in-out",
        wobbleUp: "wobbleUp 0.3s ease-in-out",
        wobbleDown: "wobbleDown 0.3s ease-in-out",
        lightWobble: "lightWobble 0.3s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

