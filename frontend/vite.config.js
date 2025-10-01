import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./",
  base: "/",
  plugins: [zaloMiniApp(), react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          zmp: ['zmp-ui']
        }
      }
    }
  },
  define: {
    __DEFINES__: JSON.stringify({}),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
