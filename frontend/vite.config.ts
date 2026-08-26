import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // Fail loudly instead of silently drifting to another port, which would
    // land outside the backend's CORS allowlist.
    strictPort: true,
  },
  preview: { port: 3000, strictPort: true },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
