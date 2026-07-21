import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@music-chords/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
    }
  },
  server: {
    port: 5173
  },
  // `vite preview` otherwise binds 4173, but the Playwright e2e (and its baseURL) wait on 5173.
  // Pin it so the preview server the tests boot is the one they connect to.
  preview: {
    port: 5173,
    strictPort: true
  }
});
