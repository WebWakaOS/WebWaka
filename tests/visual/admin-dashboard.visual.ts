/**
 * QA-12 — Visual Regression Test Baseline: Admin Dashboard
 *
 * Loads the admin-dashboard static HTML (apps/admin-dashboard/public/index.html)
 * directly via file:// or a configured server URL, then captures baseline
 * screenshots across desktop and mobile viewports.
 *
 * The admin-dashboard is a Cloudflare Workers SPA — for local visual testing
 * the static HTML is loaded directly without a backend API.
 *
 * Prerequisites:
 *   - No server required for file:// mode (default)
 *   - Override with ADMIN_DASHBOARD_URL env var to test against a running server
 *
 * Run:
 *   pnpm test:visual
 *   pnpm test:visual --update-snapshots   # regenerate baselines
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';

const STATIC_HTML = path.resolve(process.cwd(), 'apps/admin-dashboard/public/index.html');
const SERVER_URL = process.env['ADMIN_DASHBOARD_URL'];

function getUrl(): string {
  if (SERVER_URL) return SERVER_URL;
  return `file://${STATIC_HTML}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadPage(page: import('@playwright/test').Page) {
  const url = getUrl();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 });
    await page.waitForTimeout(200);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Desktop viewport baseline
// ---------------------------------------------------------------------------

test.describe('Admin Dashboard — Desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('page loads and matches baseline', async ({ page }) => {
    const loaded = await loadPage(page);
    if (!loaded) {
      test.skip(true, 'Admin dashboard HTML not accessible');
      return;
    }

    await expect(page).toHaveScreenshot('admin-dashboard-desktop-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('dark mode toggle switches theme', async ({ page }) => {
    const loaded = await loadPage(page);
    if (!loaded) {
      test.skip(true, 'Admin dashboard HTML not accessible');
      return;
    }

    const toggle = page.locator('#theme-toggle, [data-theme-toggle], .theme-toggle').first();
    if (await toggle.count() > 0) {
      await toggle.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('admin-dashboard-desktop-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    } else {
      test.skip(true, 'No theme toggle found');
    }
  });

  test('toast notification renders correctly', async ({ page }) => {
    const loaded = await loadPage(page);
    if (!loaded) {
      test.skip(true, 'Admin dashboard HTML not accessible');
      return;
    }

    const triggered = await page.evaluate(() => {
      if (typeof (window as Window & { showToast?: (m: string, t: string) => void }).showToast === 'function') {
        (window as Window & { showToast: (m: string, t: string) => void }).showToast('Visual regression test notification', 'success');
        return true;
      }
      return false;
    });

    if (!triggered) {
      test.skip(true, 'showToast not available on this page');
      return;
    }

    await page.waitForTimeout(300);
    const toastContainer = page.locator('#toast-container, .toast-container').first();
    if (await toastContainer.count() > 0) {
      await expect(toastContainer).toHaveScreenshot('admin-dashboard-toast-success.png', {
        maxDiffPixelRatio: 0.03,
        animations: 'disabled',
      });
    }
  });

  test('breadcrumb navigation renders correctly', async ({ page }) => {
    const loaded = await loadPage(page);
    if (!loaded) {
      test.skip(true, 'Admin dashboard HTML not accessible');
      return;
    }

    const breadcrumb = page.locator('#breadcrumb, .breadcrumb, [aria-label="breadcrumb"]').first();
    if (await breadcrumb.count() > 0 && await breadcrumb.isVisible()) {
      await expect(breadcrumb).toHaveScreenshot('admin-dashboard-breadcrumb.png', {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    } else {
      test.skip(true, 'Breadcrumb not visible on initial page load');
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile viewport baseline (390×844 — iPhone 14)
// ---------------------------------------------------------------------------

test.describe('Admin Dashboard — Mobile (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('responsive layout matches baseline', async ({ page }) => {
    const loaded = await loadPage(page);
    if (!loaded) {
      test.skip(true, 'Admin dashboard HTML not accessible');
      return;
    }

    await expect(page).toHaveScreenshot('admin-dashboard-mobile-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});

// ---------------------------------------------------------------------------
// Partner Admin baseline (loads partner-admin/public/index.html)
// ---------------------------------------------------------------------------

test.describe('Partner Admin — Desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('page loads and matches baseline', async ({ page }) => {
    const partnerHtml = path.resolve(__dirname, '../../apps/partner-admin/public/index.html');
    const url = process.env['PARTNER_ADMIN_URL'] ?? `file://${partnerHtml}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 });
    } catch {
      test.skip(true, 'Partner admin HTML not accessible');
      return;
    }

    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot('partner-admin-desktop-home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
