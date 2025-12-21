import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: true,
    port: 8080,
    strictPort: true,

    // allow all ngrok subdomains
    allowedHosts: [
      ".ngrok-free.dev"
    ],

    proxy: {
      "/auth": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false
      },
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
