/**
 * Developer Info Routes — Phase 6 / E33 integration tests
 *
 * Invariants under test:
 *   ADR-0018 — X-API-Version: 1 header present on every response
 *   E33      — GET /developer returns API metadata
 *   E33      — GET /developer/openapi redirects to /openapi.json
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { developerRoutes } from './developer.js';

function makeApp(): Hono {
  const app = new Hono();
  app.route('/developer', developerRoutes);
  return app;
}

describe('Phase 6 (E33) — Developer Info Endpoint', () => {
  it('GET /developer returns 200 with API metadata', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    expect(res.status).toBe(200);
  });

  it('GET /developer returns correct api name and version', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as {
      api: string;
      version: { current: string; api_version_header: string; min_supported: string };
    };
    expect(json.api).toBe('WebWaka OS API');
    expect(json.version.current).toBe('1.0.1');
    expect(json.version.api_version_header).toBe('X-API-Version: 1');
    expect(json.version.min_supported).toBe('1');
  });

  it('GET /developer returns platform invariants', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { platform_invariants: Record<string, string> };
    expect(json.platform_invariants).toHaveProperty('T3');
    expect(json.platform_invariants).toHaveProperty('P9');
    expect(json.platform_invariants).toHaveProperty('P13');
    expect(json.platform_invariants).toHaveProperty('G23');
  });

  it('GET /developer returns capabilities array', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { capabilities: string[] };
    expect(Array.isArray(json.capabilities)).toBe(true);
    expect(json.capabilities.length).toBeGreaterThan(0);
    expect(json.capabilities).toContain('multi-tenant-isolation');
    expect(json.capabilities).toContain('webhook-subscriptions');
    expect(json.capabilities).toContain('ndpr-compliance');
  });

  it('GET /developer returns changelog with Phase 6 entry', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { changelog: Array<{ phase: string }> };
    expect(Array.isArray(json.changelog)).toBe(true);
    const phase6 = json.changelog.find((c) => c.phase.includes('Phase 6'));
    expect(phase6).toBeDefined();
  });

  it('GET /developer returns authentication info', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { authentication: { type: string; issue: string } };
    expect(json.authentication.type).toBe('Bearer JWT');
    expect(json.authentication.issue).toBe('POST /auth/login');
  });

  it('GET /developer returns rate_limits info', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { rate_limits: Record<string, string> };
    expect(json.rate_limits).toHaveProperty('login');
    expect(json.rate_limits).toHaveProperty('otp');
  });

  it('GET /developer returns endpoints map', async () => {
    const app = makeApp();
    const res = await app.request('/developer');
    const json = await res.json() as { endpoints: Record<string, string> };
    expect(json.endpoints.openapi_spec).toBe('/developer/openapi');
    expect(json.endpoints.health).toBe('/health');
  });

  it('GET /developer/openapi returns 301 redirect to /openapi.json', async () => {
    const app = makeApp();
    const res = await app.request('/developer/openapi');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('/openapi.json');
  });
});
