import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'vmForks',
    include: ['**/*.test.ts'],
    testTimeout: 10_000,
  },
});
