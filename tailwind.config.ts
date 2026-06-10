import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#f7f6f2",
        line: "#dedbd2",
        signal: "#2563eb",
        mint: "#0f766e"
      }
    }
  },
  plugins: []
};

export default config;
