import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      entry: ["main.ts", "preload.ts"],
      vite: {
        build: {
          outDir: "dist-electron",
          rollupOptions: {
            external: ["electron"],
          },
        },
      },
    }),
    electronRenderer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
