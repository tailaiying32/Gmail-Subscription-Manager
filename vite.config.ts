import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: 'src/assets/*', dest: 'assets' }],
    }),
    webExtension({
      manifest: './manifest.json',
      watchFilePaths: ['manifest.json'],
      additionalInputs: ['src/dashboard/dashboard.html'],
      disableAutoImport: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
