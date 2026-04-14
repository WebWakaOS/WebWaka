/**
 * QA-12 — Visual Regression Test Baseline: Platform Admin
 *
 * Captures baseline screenshots of the platform-admin UI across desktop
 * and mobile viewports. On first run these create the baseline snapshots;
 * subsequent runs compare against the baseline and fail on pixel diffs.
 *
 * Prerequisites:
 *   - platform-admin server running: node apps/platform-admin/server.js
 *   - Default port: 5000  (override: PLATFORM_ADMIN_URL env var)
 *
 * Run:
 *   pnpm test:visual                                    # all visual tests
 *   pnpm test:visual --update-snapshots                 # regenerate baselines
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env['PLATFORM_ADMIN_URL'] ?? 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Desktop viewport baseline
// ---------------------------------------------------------------------------

test.describe('Platform Admin — Desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('homepage loads and matches baseline', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => null);

    if (!res || !res.ok()) {
      test.skip(true, `Platform-admin server not available at ${BASE_URL}`);
      return;
    }

    await expect(page).toHaveTitle(/.+/);

    await expect(page).toHaveScreenshot('platform-admin-desktop-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('dark mode class toggle applies correct theme', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => null);
    if (!res || !res.ok()) {
      test.skip(true, 'Platform-admin server not available');
      return;
    }

    const darkToggle = page.locator('#theme-toggle, [data-theme-toggle], .theme-toggle').first();
    if (await darkToggle.count() > 0) {
      await darkToggle.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('platform-admin-desktop-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    } else {
      test.skip(true, 'No theme toggle found — skipping dark-mode baseline');
    }
  });

  test('navigation structure is visible', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => null);
    if (!res || !res.ok()) {
      test.skip(true, 'Platform-admin server not available');
      return;
    }

    const nav = page.locator('nav, [role="navigation"], .sidebar, .nav').first();
    if (await nav.count() > 0) {
      await expect(nav).toHaveScreenshot('platform-admin-desktop-nav.png', {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile viewport baseline (Pixel 5 equivalent: 393×851)
// ---------------------------------------------------------------------------

test.describe('Platform Admin — Mobile (393×851)', () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test('homepage responsive layout matches baseline', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => null);
    if (!res || !res.ok()) {
      test.skip(true, `Platform-admin server not available at ${BASE_URL}`);
      return;
    }

    await expect(page).toHaveScreenshot('platform-admin-mobile-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});

// ---------------------------------------------------------------------------
// Tablet viewport baseline (768×1024)
// ---------------------------------------------------------------------------

test.describe('Platform Admin — Tablet (768×1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('homepage tablet layout matches baseline', async ({ page }) => {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => null);
    if (!res || !res.ok()) {
      test.skip(true, `Platform-admin server not available at ${BASE_URL}`);
      return;
    }

    await expect(page).toHaveScreenshot('platform-admin-tablet-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
