/**
 * Playwright Configuration — WebWaka OS E2E + Visual Regression Tests
 * QA-04: 8 critical user journeys × 3+ assertions each
 * QA-12: Visual regression baseline for platform-admin and admin-dashboard
 *
 * Run the tests:
 *   pnpm test:e2e                     # all e2e journeys
 *   pnpm test:e2e --grep auth         # auth journey only
 *   pnpm test:visual                  # visual regression tests
 *   pnpm test:visual --update-snapshots  # regenerate baselines
 *   BASE_URL=https://staging.api.webwaka.com pnpm test:e2e
 *
 * Prerequisites:
 *   - API worker: wrangler dev (default port 8787)
 *   - Discovery worker: wrangler dev --port 8788 (in apps/public-discovery)
 *   - Platform-admin (visual tests): node apps/platform-admin/server.js (port 5000)
 *   Both workers can be running simultaneously in separate terminals.
 */

import { defineConfig, devices } from '@playwright/test';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:8787';
const DISCOVERY_BASE = process.env['DISCOVERY_BASE_URL'] ?? 'http://localhost:8788';
const PLATFORM_ADMIN_BASE = process.env['PLATFORM_ADMIN_URL'] ?? 'http://localhost:5000';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.{e2e,visual}.ts',
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
      name: 'workspace-e2e',
      testMatch: '**/workspace/*.e2e.ts',
      use: {
        baseURL: process.env['WORKSPACE_URL'] ?? 'http://localhost:5173',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'workspace-e2e-mobile',
      testMatch: '**/workspace/*.e2e.ts',
      use: {
        baseURL: process.env['WORKSPACE_URL'] ?? 'http://localhost:5173',
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'all-e2e',
      testMatch: '**/*.e2e.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visual',
      testMatch: '**/visual/*.visual.ts',
      snapshotDir: './tests/visual/snapshots',
      use: {
        baseURL: PLATFORM_ADMIN_BASE,
        ...devices['Desktop Chrome'],
        screenshot: 'only-on-failure',
      },
    },
  ],
});

// Export base URLs for use in tests
export { API_BASE, DISCOVERY_BASE, PLATFORM_ADMIN_BASE };
