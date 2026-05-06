import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand farver — kan tweakes til whitelabel
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c2d0ff",
          300: "#9ab2ff",
          400: "#6d88ff",
          500: "#4a5fff",
          600: "#3340f5",
          700: "#2a30d8",
          800: "#242aae",
          900: "#232b89",
          950: "#151852",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
