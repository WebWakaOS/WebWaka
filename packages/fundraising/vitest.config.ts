import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@webwaka/types':        path.resolve(__dirname, '../types/src/index.ts'),
      '@webwaka/entitlements': path.resolve(__dirname, '../entitlements/src/index.ts'),
      '@webwaka/events':       path.resolve(__dirname, '../events/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
