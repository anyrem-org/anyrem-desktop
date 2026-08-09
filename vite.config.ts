import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Relative asset paths are required for Electron loadFile() in packaged builds.
  base: mode === "development" ? "/" : "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
