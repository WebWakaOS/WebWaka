import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: true,
    proxy: {
      '/partners': {
        target: process.env.VITE_API_BASE ?? 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
