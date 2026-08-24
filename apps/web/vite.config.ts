import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
    build: {
    // Budget S-10 : tout chunk JavaScript doit rester sous 400 kB brut.
    // Les chunks de route restent lazy ; le budget gzip cible est d’environ 110 kB.
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react-router")) return "vendor-react"
          if (id.includes("/node_modules/lucide-react/") || id.includes("/node_modules/@radix-ui/") || id.includes("/node_modules/framer-motion/")) return "vendor-ui"
          return undefined
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
