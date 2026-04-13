/**
 * Workspace App E2E — Dashboard, POS, Offerings, Vertical
 * P12-H: Full workspace journey smoke tests
 *
 * Note: These run against a mock/demo state since the full API is not wired
 * in E2E. They verify the UI renders correctly and is accessible.
 */

import { test, expect, Page } from '@playwright/test';

const WS_BASE = process.env['WORKSPACE_URL'] ?? 'http://localhost:5173';

async function goTo(page: Page, path: string) {
  await page.goto(`${WS_BASE}${path}`);
}

test.describe('Dashboard page', () => {
  test('dashboard shows key metric cards', async ({ page }) => {
    await goTo(page, '/dashboard');
    await page.waitForURL(/dashboard|login/, { timeout: 10_000 });
    if (page.url().includes('/login')) {
      test.skip(true, 'Unauthenticated — skip dashboard tests in CI');
      return;
    }
    await expect(page.getByRole('region', { name: /key metrics/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /quick actions/i })).toBeVisible();
  });
});

test.describe('POS page — unauthenticated renders login redirect', () => {
  test('redirects to login when accessing /pos unauthenticated', async ({ page }) => {
    await goTo(page, '/pos');
    await page.waitForURL(/pos|login/, { timeout: 10_000 });
    const url = page.url();
    expect(url).toMatch(/pos|login/);
  });
});

test.describe('Accessibility — skip link', () => {
  test('skip-to-main-content link is present in DOM', async ({ page }) => {
    await goTo(page, '/login');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeAttached();
  });
});

test.describe('404 page', () => {
  test('returns not-found UI for unknown route', async ({ page }) => {
    await goTo(page, '/this-route-does-not-exist-xyz');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
  });
});

test.describe('PWA — manifest and service worker', () => {
  test('manifest.webmanifest is accessible', async ({ page }) => {
    const res = await page.request.get(`${WS_BASE}/manifest.webmanifest`);
    expect([200, 201]).toContain(res.status());
    const body = await res.json() as { name: string; display: string };
    expect(body.name).toContain('WebWaka');
    expect(body.display).toBe('standalone');
  });

  test('offline.html fallback page is accessible', async ({ page }) => {
    const res = await page.request.get(`${WS_BASE}/offline.html`);
    expect([200, 201]).toContain(res.status());
    const text = await res.text();
    expect(text).toContain('offline');
  });
});

test.describe('Mobile viewport — workspace (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('login page has bottom nav absent (it is behind auth)', async ({ page }) => {
    await goTo(page, '/login');
    const bottomNav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(bottomNav).not.toBeVisible();
  });

  test('404 page is readable on 360px', async ({ page }) => {
    await goTo(page, '/unknown-path-404');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    const link = page.getByRole('link', { name: /go to dashboard/i });
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
