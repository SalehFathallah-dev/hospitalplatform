import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    ink: "#14232E", paper: "#F6F8F9", line: "#D8E0E5", brand: { DEFAULT: "var(--brand, #0B5C7A)", dark: "var(--brand-dark, #08465C)" },
    critical: "#C62828", urgent: "#C46A00", ok: "#2E7D32", idle: "#6B7A85" },
    fontFamily: { sans: ["var(--font-plex)", "system-ui", "sans-serif"] } } },
} satisfies Config;
