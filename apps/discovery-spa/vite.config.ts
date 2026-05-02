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
    port: 5176,
    allowedHosts: true,
    proxy: {
      '/discover': {
        target: process.env.VITE_DISCOVERY_API ?? 'http://localhost:8788',
        changeOrigin: true,
        rewrite: path => path,
      },
    },
  },
});
