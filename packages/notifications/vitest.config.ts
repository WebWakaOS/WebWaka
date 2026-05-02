import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
    globals: true,
    environment: 'node',
    pool: 'vmForks',
    server: {
      deps: {
        inline: [/@webwaka\//],
      },
    },
    include: ['src/**/*.test.ts'],
  },,
});
