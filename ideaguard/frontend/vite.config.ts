import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The FastAPI backend serves the built app from backend/static (see backend/main.py:
// "/" -> static/index.html and "/static" -> this folder), so assets live under /static/.
export default defineConfig({
  base: "/static/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { outDir: "../backend/static", emptyOutDir: true, chunkSizeWarningLimit: 900 },
  server: {
    port: 5173,
    // dev: forward API calls to the FastAPI server started by backend/run.bat
    proxy: { "/api": "http://127.0.0.1:8000", "/health": "http://127.0.0.1:8000" },
  },
});
