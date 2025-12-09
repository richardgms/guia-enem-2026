import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
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
        // Cores de matérias customizadas
        // Cores de matérias customizadas
        mat: {
          matematica: "hsl(var(--mat-matematica))",
          portugues: "hsl(var(--mat-portugues))",
          fisica: "hsl(var(--mat-fisica))",
          quimica: "hsl(var(--mat-quimica))",
          biologia: "hsl(var(--mat-biologia))",
          historia: "hsl(var(--mat-historia))",
          geografia: "hsl(var(--mat-geografia))",
          redacao: "hsl(var(--mat-redacao))",
        },
        // Ocean Blue Theme Specifics
        'header-bg': "hsl(var(--header-bg))",
        'accent-green': {
          bg: "hsl(var(--accent))", // maps to --accent
          text: "hsl(var(--accent-foreground))", // maps to --accent-foreground
          button: "hsl(var(--accent-green-button))",
        },
        'tag': {
          math: { bg: "hsl(var(--mat-math-bg))", text: "hsl(var(--mat-math-text))" },
          bio: { bg: "hsl(var(--mat-bio-bg))", text: "hsl(var(--mat-bio-text))" },
          hist: { bg: "hsl(var(--mat-hist-bg))", text: "hsl(var(--mat-hist-text))" },
          easy: { bg: "hsl(var(--mat-easy-bg))", text: "hsl(var(--mat-easy-text))" },
          red: { bg: "hsl(var(--mat-red-bg))", text: "hsl(var(--mat-red-text))" },
          rev: { bg: "hsl(var(--mat-rev-bg))", text: "hsl(var(--mat-rev-text))" },
          port: { bg: "hsl(var(--mat-port-bg))", text: "hsl(var(--mat-port-text))" },
        }
      },
      backgroundImage: {
        'streak-gradient': 'linear-gradient(145deg, hsl(var(--streak-start)), hsl(var(--streak-end)))',
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
