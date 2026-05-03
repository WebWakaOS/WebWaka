import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@webwaka/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@webwaka/auth':  path.resolve(__dirname, '../../packages/auth/src/index.ts'),
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
