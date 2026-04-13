/**
 * Playwright Configuration — WebWaka OS E2E Tests
 * QA-04: 8 critical user journeys × 3+ assertions each
 *
 * Run the tests:
 *   pnpm test:e2e                     # all journeys
 *   pnpm test:e2e --grep auth         # auth journey only
 *   BASE_URL=https://staging.api.webwaka.com pnpm test:e2e
 *
 * Prerequisites:
 *   - API worker: wrangler dev (default port 8787)
 *   - Discovery worker: wrangler dev --port 8788 (in apps/public-discovery)
 *   Both workers can be running simultaneously in separate terminals.
 */

import { defineConfig, devices } from '@playwright/test';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:8787';
const DISCOVERY_BASE = process.env['DISCOVERY_BASE_URL'] ?? 'http://localhost:8788';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e/reports', open: 'never' }],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: DISCOVERY_BASE,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'api-e2e',
      testMatch: '**/api/*.e2e.ts',
      use: {
        baseURL: API_BASE,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'discovery-e2e',
      testMatch: '**/discovery/*.e2e.ts',
      use: {
        baseURL: DISCOVERY_BASE,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'all-e2e',
      testMatch: '**/*.e2e.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});

// Export base URLs for use in tests
export { API_BASE, DISCOVERY_BASE };
