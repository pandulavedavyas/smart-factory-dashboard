import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Firebase is loaded through optional, `@vite-ignore` dynamic imports in
// src/firebase/firebaseClient.js and src/services/authService.js. We keep those
// specifiers external so the build never fails when the package is absent
// (or when it is served from a CDN via the import map in index.html).
const firebaseExternal = [/^firebase\//];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  optimizeDeps: {
    exclude: firebaseExternal,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '..', 'frontend', 'static', 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: firebaseExternal,
    },
  },
});
