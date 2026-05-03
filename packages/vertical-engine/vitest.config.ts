import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@webwaka/vertical-engine': path.resolve(__dirname, './src'),
      '@webwaka/types': path.resolve(__dirname, '../types/src'),
      '@webwaka/entitlements': path.resolve(__dirname, '../entitlements/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    server: {
      deps: {
        inline: [/@webwaka\//],
      },
    },
    include: ['src/**/*.test.ts'],
  },
});
