import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'vmForks',
    server: {
      deps: {
        inline: [/@webwaka\//],
      },
    },
    include: ['tests/chaos/**/*.test.ts'],
  },
});
