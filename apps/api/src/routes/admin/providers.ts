/**
 * Provider Admin Routes — BATCH 6
 * Super admin CRUD for the platform provider registry.
 * Routes: GET/POST /admin/providers, GET/PATCH/POST/:id, etc.
 */

import { Hono } from 'hono';
import {
  createProvider, updateProvider, rotateCredentials,
  activateProvider, deactivateProvider, listProviders,
  getProvider, getProviderAuditLog, maskCredentials, encryptCredentials,
} from '@webwaka/provider-registry';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
import type { Env } from '../../env.js';
import type { ProviderCategory, ProviderInput } from '@webwaka/provider-registry';

function getActor(c: { get(k: string): unknown; req: { header(h: string): string | undefined } }) {
  const auth = c.get('auth') as { userId?: string; role?: string } | null;
  return {
    actorId: auth?.userId ?? 'system',
    actorRole: auth?.role ?? 'unknown',
    ipAddress: c.req.header('CF-Connecting-IP'),
  };
}

export const providerAdminRoutes = new Hono<{ Bindings: Env }>();

// Auth guard: super_admin only
providerAdminRoutes.use('*', async (c, next) => {
  const auth = c.get('auth') as { role?: string } | null;
  if (!auth || auth.role !== 'super_admin') {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Super admin access required for provider management.'), 403);
  }
  await next();
});

// GET /admin/providers — list all providers
providerAdminRoutes.get('/', async (c) => {
  const category = c.req.query('category') as ProviderCategory | undefined;
  const status = c.req.query('status') as 'active' | 'inactive' | undefined;
  const scope = c.req.query('scope');
  const providers = await listProviders(c.env.DB as never, {
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(scope ? { scope } : {}),
  });
  return c.json({ providers, count: providers.length });
});

// POST /admin/providers — create provider
providerAdminRoutes.post('/', async (c) => {
  const encryptionSecret = c.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) return c.json(errorResponse(ErrorCode.InternalError, 'ENCRYPTION_SECRET not configured.'), 500);
  const body = await c.req.json<ProviderInput>().catch(() => null);
  if (!body?.category || !body?.provider_name || !body?.display_name) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'category, provider_name, and display_name are required.'), 400);
  }
  const actor = getActor(c);
  const provider = await createProvider(c.env.DB as never, body, actor, encryptionSecret);
  return c.json({ provider }, 201);
});

// GET /admin/providers/:id
providerAdminRoutes.get('/:id', async (c) => {
  const provider = await getProvider(c.env.DB as never, c.req.param('id'));
  if (!provider) return c.json(errorResponse(ErrorCode.NotFound, 'Provider not found.'), 404);
  return c.json({ provider });
});

// PATCH /admin/providers/:id
providerAdminRoutes.patch('/:id', async (c) => {
  const body = await c.req.json<Partial<ProviderInput>>().catch(() => null);
  if (!body) return c.json(errorResponse(ErrorCode.BadRequest, 'Request body required.'), 400);
  const actor = getActor(c);
  const updated = await updateProvider(c.env.DB as never, c.req.param('id'), body, actor);
  if (!updated) return c.json(errorResponse(ErrorCode.NotFound, 'Provider not found.'), 404);
  return c.json({ provider: updated });
});

// POST /admin/providers/:id/credentials — rotate credentials
providerAdminRoutes.post('/:id/credentials', async (c) => {
  const encryptionSecret = c.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) return c.json(errorResponse(ErrorCode.InternalError, 'ENCRYPTION_SECRET not configured.'), 500);
  const body = await c.req.json<{ credentials: Record<string, string> }>().catch(() => null);
  if (!body?.credentials || Object.keys(body.credentials).length === 0) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'credentials object is required.'), 400);
  }
  const actor = getActor(c);
  await rotateCredentials(c.env.DB as never, c.req.param('id'), body.credentials, actor, encryptionSecret);
  return c.json({ message: 'Credentials rotated.', credential_keys: Object.keys(body.credentials), masked: maskCredentials(body.credentials) });
});

// POST /admin/providers/:id/activate
providerAdminRoutes.post('/:id/activate', async (c) => {
  const providerId = c.req.param('id');
  const existing = await getProvider(c.env.DB as never, providerId);
  if (!existing) return c.json(errorResponse(ErrorCode.NotFound, 'Provider not found.'), 404);
  await activateProvider(c.env.DB as never, providerId, getActor(c));
  if (c.env.RATE_LIMIT_KV) {
    await c.env.RATE_LIMIT_KV.delete(`provider:active:${existing.category}:${existing.scope}:${existing.scope_id ?? 'null'}`).catch(() => {});
  }
  return c.json({ message: `Provider '${existing.display_name}' activated.`, id: providerId });
});

// POST /admin/providers/:id/deactivate
providerAdminRoutes.post('/:id/deactivate', async (c) => {
  const providerId = c.req.param('id');
  const existing = await getProvider(c.env.DB as never, providerId);
  if (!existing) return c.json(errorResponse(ErrorCode.NotFound, 'Provider not found.'), 404);
  await deactivateProvider(c.env.DB as never, providerId, getActor(c));
  if (c.env.RATE_LIMIT_KV) {
    await c.env.RATE_LIMIT_KV.delete(`provider:active:${existing.category}:${existing.scope}:${existing.scope_id ?? 'null'}`).catch(() => {});
  }
  return c.json({ message: `Provider '${existing.display_name}' deactivated.`, id: providerId });
});

// POST /admin/providers/:id/test — safe connectivity test
providerAdminRoutes.post('/:id/test', async (c) => {
  const provider = await getProvider(c.env.DB as never, c.req.param('id'));
  if (!provider) return c.json(errorResponse(ErrorCode.NotFound, 'Provider not found.'), 404);
  const start = Date.now();
  let testResult: { ok: boolean; latencyMs?: number; message?: string; error?: string };
  try {
    if (provider.category === 'ai') {
      const baseUrl = (provider.config?.['baseUrl'] as string | undefined) ?? 'https://openrouter.ai/api/v1';
      const res = await fetch(`${baseUrl}/models`, { signal: AbortSignal.timeout(5000) });
      testResult = { ok: res.ok || res.status === 401, latencyMs: Date.now() - start, message: `HTTP ${res.status}` };
    } else if (provider.category === 'email') {
      const res = await fetch('https://api.resend.com', { signal: AbortSignal.timeout(5000) });
      testResult = { ok: res.status < 500, latencyMs: Date.now() - start, message: `HTTP ${res.status}` };
    } else {
      testResult = { ok: true, latencyMs: Date.now() - start, message: 'Test not implemented for this category' };
    }
  } catch (e) {
    testResult = { ok: false, latencyMs: Date.now() - start, error: e instanceof Error ? e.message : 'Test failed' };
  }
  return c.json({ provider: { id: provider.id, name: provider.provider_name, category: provider.category }, test: testResult });
});

// GET /admin/providers/:id/audit
providerAdminRoutes.get('/:id/audit', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 200);
  const audit = await getProviderAuditLog(c.env.DB as never, c.req.param('id'), limit);
  return c.json({ audit, count: (audit as unknown[]).length });
});

// GET /admin/providers/:id/keys — AI key pool (masked)
providerAdminRoutes.get('/:id/keys', async (c) => {
  const providerId = c.req.param('id');
  const result = await c.env.DB.prepare(
    `SELECT id, key_label, status, total_requests, successful_requests, failed_requests,
            last_used_at, rate_limited_until, created_at
     FROM ai_provider_keys WHERE provider_id = ? ORDER BY created_at ASC`,
  ).bind(providerId).all<{
    id: string; key_label: string; status: string; total_requests: number;
    successful_requests: number; failed_requests: number;
    last_used_at: number | null; rate_limited_until: number | null; created_at: number;
  }>();

  const statsResult = await c.env.DB.prepare(
    `SELECT status, COUNT(*) as count FROM ai_provider_keys WHERE provider_id = ? GROUP BY status`,
  ).bind(providerId).all<{ status: string; count: number }>();

  const health = { total: 0, active: 0, rateLimited: 0, disabled: 0 };
  for (const r of statsResult.results) {
    health.total += r.count;
    if (r.status === 'active') health.active += r.count;
    if (r.status === 'rate_limited') health.rateLimited += r.count;
    if (r.status === 'disabled') health.disabled += r.count;
  }

  return c.json({
    keys: result.results.map(k => ({ ...k, key_preview: `***...${k.id.slice(-4)}` })),
    pool_health: health,
  });
});

// POST /admin/providers/:id/keys — add API key to pool
providerAdminRoutes.post('/:id/keys', async (c) => {
  const encryptionSecret = c.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) return c.json(errorResponse(ErrorCode.InternalError, 'ENCRYPTION_SECRET not configured.'), 500);
  const body = await c.req.json<{ key: string; label?: string }>().catch(() => null);
  if (!body?.key?.trim()) return c.json(errorResponse(ErrorCode.BadRequest, 'key is required.'), 400);
  const label = body.label?.trim() ?? `key-${Date.now()}`;
  const { encrypted, iv } = await encryptCredentials({ api_key: body.key }, encryptionSecret);
  const keyId = `apk_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const providerId = c.req.param('id');
  await c.env.DB.prepare(
    `INSERT INTO ai_provider_keys (id, provider_id, key_label, key_encrypted, key_iv, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', unixepoch(), unixepoch())`,
  ).bind(keyId, providerId, label, encrypted, iv).run();
  const actor = getActor(c);
  await c.env.DB.prepare(
    `INSERT INTO provider_audit_log (id, provider_id, action, actor_id, actor_role, changes_json, created_at)
     VALUES (?, ?, 'key_added', ?, ?, ?, unixepoch())`,
  ).bind(crypto.randomUUID(), providerId, actor.actorId, actor.actorRole, JSON.stringify({ key_id: keyId, label })).run();
  return c.json({ id: keyId, label, status: 'active', message: 'API key added to pool.' }, 201);
});

// DELETE /admin/providers/:id/keys/:keyId
providerAdminRoutes.delete('/:id/keys/:keyId', async (c) => {
  const providerId = c.req.param('id');
  const keyId = c.req.param('keyId');
  const existing = await c.env.DB.prepare(
    'SELECT id FROM ai_provider_keys WHERE id = ? AND provider_id = ? LIMIT 1',
  ).bind(keyId, providerId).first<{ id: string }>();
  if (!existing) return c.json(errorResponse(ErrorCode.NotFound, 'API key not found in pool.'), 404);
  await c.env.DB.prepare(`UPDATE ai_provider_keys SET status = 'disabled', updated_at = unixepoch() WHERE id = ? AND provider_id = ?`).bind(keyId, providerId).run();
  const actor = getActor(c);
  await c.env.DB.prepare(
    `INSERT INTO provider_audit_log (id, provider_id, action, actor_id, actor_role, changes_json, created_at)
     VALUES (?, ?, 'key_removed', ?, ?, ?, unixepoch())`,
  ).bind(crypto.randomUUID(), providerId, actor.actorId, actor.actorRole, JSON.stringify({ key_id: keyId })).run();
  return c.json({ message: 'API key removed from pool.', id: keyId });
});
