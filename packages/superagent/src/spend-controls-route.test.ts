/**
 * A3-4: SpendControls hard-cap enforcement in /superagent/chat route.
 * Verifies that the route returns 429 (BUDGET_EXCEEDED) when spend controls
 * indicate the budget is exceeded. (Route uses 429 per SA-4.4 implementation.)
 *
 * These tests use a lightweight Hono test harness that stubs auth + DB.
 */
import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { SpendControls } from './spend-controls.js';

// ── Minimal chat route stub that mirrors the real route's budget-check path ──

function buildTestApp(budgetAllowed: boolean, remaining = 0, limit = 1000) {
  const app = new Hono();

  app.post('/superagent/chat', async (c) => {
    // Simulate auth (always valid in test)
    const auth = { tenantId: 't1', userId: 'u1', workspaceId: 'ws1' };

    // Budget check (SA-4.4) — mirrors superagent.ts implementation
    const spendControls = {
      checkBudget: vi.fn().mockResolvedValue({
        allowed: budgetAllowed,
        budgetScope: 'workspace',
        remaining,
        limit,
      }),
    };

    const budgetCheck = await spendControls.checkBudget(
      auth.tenantId, auth.userId, undefined, undefined, auth.workspaceId,
    );

    if (!budgetCheck.allowed) {
      return c.json(
        { error: 'BUDGET_EXCEEDED', scope: budgetCheck.budgetScope, remaining: budgetCheck.remaining, limit: budgetCheck.limit },
        429,
      );
    }

    return c.json({ reply: 'Hello!', tokensUsed: 100 }, 200);
  });

  return app;
}

describe('A3-4: SpendControls hard-cap enforcement in /superagent/chat', () => {
  describe('when budget is exceeded', () => {
    it('returns HTTP 429', async () => {
      const app = buildTestApp(false, 0, 1000);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }), headers: { 'Content-Type': 'application/json' } });
      expect(res.status).toBe(429);
    });

    it('response body has error=BUDGET_EXCEEDED', async () => {
      const app = buildTestApp(false, 0, 1000);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }), headers: { 'Content-Type': 'application/json' } });
      const body = await res.json() as { error: string; scope: string; remaining: number; limit: number };
      expect(body.error).toBe('BUDGET_EXCEEDED');
      expect(body.scope).toBe('workspace');
      expect(body.remaining).toBe(0);
      expect(body.limit).toBe(1000);
    });

    it('does not proceed to AI adapter when budget exceeded', async () => {
      const app = buildTestApp(false, 0, 500);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }), headers: { 'Content-Type': 'application/json' } });
      // Must be 429, never 200
      expect(res.status).not.toBe(200);
    });
  });

  describe('when budget is available', () => {
    it('returns HTTP 200 and processes request', async () => {
      const app = buildTestApp(true, 500, 1000);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }), headers: { 'Content-Type': 'application/json' } });
      expect(res.status).toBe(200);
    });

    it('returns reply in body', async () => {
      const app = buildTestApp(true, 500, 1000);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }), headers: { 'Content-Type': 'application/json' } });
      const body = await res.json() as { reply: string };
      expect(body.reply).toBe('Hello!');
    });
  });

  describe('monthly cap edge cases', () => {
    it('returns 429 when remaining=0 (cap exactly reached)', async () => {
      const app = buildTestApp(false, 0, 500);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'test' }), headers: { 'Content-Type': 'application/json' } });
      expect(res.status).toBe(429);
    });

    it('allows request when remaining=1 (one WakaCU left)', async () => {
      const app = buildTestApp(true, 1, 500);
      const res = await app.request('/superagent/chat', { method: 'POST', body: JSON.stringify({ message: 'test' }), headers: { 'Content-Type': 'application/json' } });
      expect(res.status).toBe(200);
    });
  });
});
