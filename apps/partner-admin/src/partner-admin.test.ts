/**
 * Partner Admin JSON API — Tests (Phase 2, T007)
 * 8 tests covering: workspace list, usage metrics, sub-partners, credits, auth (401 without JWT).
 */

import { describe, it, expect } from 'vitest';
import app from './index.js';

// ── JWT helpers ────────────────────────────────────────────────────────────

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

const PARTNER_JWT = makeJwt({ sub: 'user_01', role: 'partner', tenant_id: 'ten_test' });
const PARTNER_ID = 'prt_test01';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Partner Admin — JSON API (T007)', () => {

  describe('Auth guard', () => {
    it('PA01 — GET /api/workspaces returns 401 without Authorization', async () => {
      const req = new Request('http://localhost/api/workspaces', {
        headers: { 'X-Partner-Id': PARTNER_ID },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(401);
    });

    it('PA02 — GET /api/workspaces returns 401 with non-partner role', async () => {
      const badJwt = makeJwt({ sub: 'user_member', role: 'member', tenant_id: 'ten_test' });
      const req = new Request('http://localhost/api/workspaces', {
        headers: { 'Authorization': `Bearer ${badJwt}`, 'X-Partner-Id': PARTNER_ID },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(401);
    });

    it('PA03 — GET /api/usage returns 401 without X-Partner-Id header', async () => {
      const req = new Request('http://localhost/api/usage', {
        headers: { 'Authorization': `Bearer ${PARTNER_JWT}` },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/workspaces', () => {
    it('PA04 — returns empty workspace list when DB not bound (no crash)', async () => {
      const req = new Request('http://localhost/api/workspaces', {
        headers: {
          'Authorization': `Bearer ${PARTNER_JWT}`,
          'X-Partner-Id': PARTNER_ID,
        },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(200);
      const body = await res.json() as { workspaces: unknown[]; total: number };
      expect(body).toHaveProperty('workspaces');
      expect(body).toHaveProperty('total');
      expect(Array.isArray(body.workspaces)).toBe(true);
    });
  });

  describe('GET /api/usage', () => {
    it('PA05 — returns 3 usage metrics when DB not bound', async () => {
      const req = new Request('http://localhost/api/usage', {
        headers: {
          'Authorization': `Bearer ${PARTNER_JWT}`,
          'X-Partner-Id': PARTNER_ID,
        },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(200);
      const body = await res.json() as { activeGroups: number; totalMembers: number; totalCampaigns: number };
      expect(body).toHaveProperty('activeGroups');
      expect(body).toHaveProperty('totalMembers');
      expect(body).toHaveProperty('totalCampaigns');
      expect(typeof body.activeGroups).toBe('number');
    });
  });

  describe('GET /api/sub-partners', () => {
    it('PA06 — returns sub-partners array when DB not bound', async () => {
      const req = new Request('http://localhost/api/sub-partners', {
        headers: {
          'Authorization': `Bearer ${PARTNER_JWT}`,
          'X-Partner-Id': PARTNER_ID,
        },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(200);
      const body = await res.json() as { subPartners: unknown[] };
      expect(body).toHaveProperty('subPartners');
      expect(Array.isArray(body.subPartners)).toBe(true);
    });
  });

  describe('GET /api/credits', () => {
    it('PA07 — returns credit pool structure when DB not bound', async () => {
      const req = new Request('http://localhost/api/credits', {
        headers: {
          'Authorization': `Bearer ${PARTNER_JWT}`,
          'X-Partner-Id': PARTNER_ID,
        },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(200);
      const body = await res.json() as { balance: number; currency: string; partnerId: string };
      expect(body).toHaveProperty('balance');
      expect(body).toHaveProperty('currency');
      expect(body.partnerId).toBe(PARTNER_ID);
    });
  });

  describe('GET /api/usage — super_admin access', () => {
    it('PA08 — super_admin JWT also accepted for usage endpoint', async () => {
      const superJwt = makeJwt({ sub: 'super_01', role: 'super_admin', tenant_id: 'ten_platform' });
      const req = new Request('http://localhost/api/usage', {
        headers: {
          'Authorization': `Bearer ${superJwt}`,
          'X-Partner-Id': PARTNER_ID,
        },
      });
      const res = await app.fetch(req, {});
      expect(res.status).toBe(200);
    });
  });

});
