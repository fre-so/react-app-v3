import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    allowedHosts: [".e2b.app", ".bespoker.ai"],
  },
  envPrefix: ["VITE_", "MAPBOX_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})