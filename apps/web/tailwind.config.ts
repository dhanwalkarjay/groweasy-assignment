import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        mist: "#eef4f0",
        leaf: "#247a4b",
        citrus: "#d9f26f",
        clay: "#cc6b49"
      }
    }
  },
  plugins: []
};

export default config;
