import type { Config } from "tailwindcss";

// NOTE: This project uses Tailwind CSS v4, whose primary configuration
// mechanism is CSS-first via the `@theme` block in app/globals.css (see the
// `--color-brand-*` custom properties there). Tailwind v4 does not load
// this file automatically (no PostCSS `tailwindcss({ config })` step and no
// `@config` directive is used). It is kept here for documentation/back-compat
// so the brand palette is visible in one place for tooling/IDEs that expect
// a config file, and mirrors the tokens defined in globals.css.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0a0a0a",
          blackSoft: "#121212",
          red: "#c8102e",
          gold: "#d4af37",
          whatsapp: "#25D366",
        },
      },
    },
  },
};

export default config;
