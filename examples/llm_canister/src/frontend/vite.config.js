import { fileURLToPath, URL } from 'url';
import react from '../../$node_modules/@vitejs/plugin-react/dist/index.mjs';
import { defineConfig } from '../../$node_modules/vite/dist/node/index.js';
import environment from '../../$node_modules/vite-plugin-environment/dist/index.js';
import dotenv from '../../$node_modules/dotenv/lib/main.js';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
