import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        accent: "var(--accent)",
        textPrimary: "var(--text)",
        textMuted: "var(--text-muted)",
        border: "var(--border)",
        rating: "var(--rating)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)"],
        serif: ["var(--font-playfair)"],
        mono: ["var(--font-jetbrains)"],
      },
    },
  },
  plugins: [],
};
export default config;
