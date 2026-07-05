import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Relative asset paths are required for Electron loadFile() in packaged builds.
  base: mode === "development" ? "/" : "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
