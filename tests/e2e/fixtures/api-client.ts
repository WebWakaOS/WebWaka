/**
 * Shared API client utilities for WebWaka OS E2E tests.
 * QA-04 — wraps Playwright's APIRequestContext with WebWaka auth headers.
 *
 * Platform invariants enforced in helpers:
 *   T3  — every request includes x-tenant-id
 *   P9  — money amounts validated as integers
 */

import type { APIRequestContext } from '@playwright/test';

export const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:8787';
export const DISCOVERY_BASE = process.env['DISCOVERY_BASE_URL'] ?? 'http://localhost:8788';

export const TEST_TENANT_ID = process.env['E2E_TENANT_ID'] ?? 'tenant_e2e_001';
export const TEST_API_KEY = process.env['E2E_API_KEY'] ?? 'e2e-test-key-not-for-production';
export const TEST_WORKSPACE_ID = process.env['E2E_WORKSPACE_ID'] ?? 'ws_e2e_001';

/** Standard headers that satisfy T3 + auth middleware */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': TEST_TENANT_ID,
    'x-api-key': TEST_API_KEY,
    ...extra,
  };
}

/** Make an authenticated GET request and return parsed JSON */
export async function apiGet(
  request: APIRequestContext,
  path: string,
  extra: Record<string, string> = {},
): Promise<{ status: number; body: unknown }> {
  const res = await request.get(`${API_BASE}${path}`, {
    headers: authHeaders(extra),
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status(), body };
}

/** Make an authenticated POST request and return parsed JSON */
export async function apiPost(
  request: APIRequestContext,
  path: string,
  data: unknown,
  extra: Record<string, string> = {},
): Promise<{ status: number; body: unknown }> {
  const res = await request.post(`${API_BASE}${path}`, {
    headers: authHeaders(extra),
    data,
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status(), body };
}

/** Make an authenticated DELETE request */
export async function apiDelete(
  request: APIRequestContext,
  path: string,
  extra: Record<string, string> = {},
): Promise<{ status: number; body: unknown }> {
  const res = await request.delete(`${API_BASE}${path}`, {
    headers: authHeaders(extra),
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status(), body };
}

/** Make an unauthenticated GET request (for testing auth rejection) */
export async function unauthGet(
  request: APIRequestContext,
  path: string,
): Promise<{ status: number; body: unknown }> {
  const res = await request.get(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  let body: unknown;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status: res.status(), body };
}

/** Assert P9: a value is an integer (not a float) */
export function assertIntegerKobo(value: unknown, fieldName: string): void {
  if (typeof value !== 'number') return; // null/undefined — skip
  if (!Number.isInteger(value)) {
    throw new Error(`P9 violation: ${fieldName} must be integer kobo, got ${value}`);
  }
}
