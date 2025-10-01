import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./",
  base: "",
  plugins: [zaloMiniApp(), react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
  define: {
    __DEFINES__: JSON.stringify({})
  }
});
