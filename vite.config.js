import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // This ensures your assets (JS, CSS) load correctly on GitHub Pages
  base: "/TypeMatch/",
  plugins: [tailwindcss()],
});
