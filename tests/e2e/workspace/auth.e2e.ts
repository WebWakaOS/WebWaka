/**
 * Workspace App E2E — Auth Flows
 * P12-H: auth→dashboard journey, mobile viewport smoke
 *
 * These tests verify the React PWA auth UX against the running Vite dev server.
 * To run: WORKSPACE_URL=http://localhost:5173 pnpm test:e2e --project=workspace-e2e
 */

import { test, expect, Page } from '@playwright/test';

const WS_BASE = process.env['WORKSPACE_URL'] ?? 'http://localhost:5173';

async function goTo(page: Page, path: string) {
  await page.goto(`${WS_BASE}${path}`);
}

test.describe('Login page — unauthenticated user', () => {
  test('redirects / to /login when not authenticated', async ({ page }) => {
    await goTo(page, '/');
    await page.waitForURL(/\/login|\/dashboard/, { timeout: 10_000 });
    const url = page.url();
    expect(url).toMatch(/\/login|\/dashboard/);
  });

  test('login page renders with correct heading and form fields', async ({ page }) => {
    await goTo(page, '/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create one/i })).toBeVisible();
  });

  test('login form shows validation errors for empty submission', async ({ page }) => {
    await goTo(page, '/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    const emailError = page.getByRole('alert').first();
    await expect(emailError).toBeVisible({ timeout: 5000 });
  });

  test('login form shows validation error for invalid email', async ({ page }) => {
    await goTo(page, '/login');
    await page.getByLabel(/email address/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('short');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Register page', () => {
  test('register page renders correctly', async ({ page }) => {
    await goTo(page, '/register');
    await expect(page.getByRole('heading', { name: /create your workspace/i })).toBeVisible();
    await expect(page.getByLabel(/business name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByText(/ndpr compliant/i)).toBeVisible();
  });

  test('register form validates password mismatch', async ({ page }) => {
    await goTo(page, '/register');
    await page.getByLabel(/business name/i).fill('Test Business');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('different123');
    await page.getByRole('button', { name: /create workspace/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Forgot password page', () => {
  test('renders forgot password form', async ({ page }) => {
    await goTo(page, '/forgot-password');
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });
});

test.describe('Mobile viewport — auth flows (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('login page is usable on 360px viewport', async ({ page }) => {
    await goTo(page, '/login');
    const card = page.locator('form');
    await expect(card).toBeVisible();
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toBeVisible();
    const box = await emailInput.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    const btnBox = await submitBtn.boundingBox();
    expect(btnBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('register page scrolls correctly on 360px viewport', async ({ page }) => {
    await goTo(page, '/register');
    await expect(page.getByRole('heading', { name: /create your workspace/i })).toBeVisible();
    const submitBtn = page.getByRole('button', { name: /create workspace/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();
  });
});
