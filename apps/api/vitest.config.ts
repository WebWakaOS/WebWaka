import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@webwaka/types':         path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@webwaka/auth':          path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@webwaka/geography':     path.resolve(__dirname, '../../packages/core/geography/src/index.ts'),
      '@webwaka/entities':      path.resolve(__dirname, '../../packages/entities/src/index.ts'),
      '@webwaka/entitlements':  path.resolve(__dirname, '../../packages/entitlements/src/index.ts'),
      '@webwaka/relationships': path.resolve(__dirname, '../../packages/relationships/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
