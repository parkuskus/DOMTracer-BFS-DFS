// =============================================================================
// vite.config.ts — Konfigurasi Vite
// =============================================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy ke backend jika dijalankan lokal (opsional)
    // proxy: {
    //   "/api": "http://localhost:8000",
    // },
  },
});
