/**
 * Brand Settings API
 * Wave 2 — Batch 2 (C2-1 through C2-5)
 *
 * Routes:
 *   GET   /brand-settings/:workspaceId         — fetch brand profile
 *   PATCH /brand-settings/:workspaceId         — update brand profile fields
 *   POST  /brand-settings/logo                 — upload logo (multipart)
 */
import { Hono } from 'hono';

type Env = { DB: D1Database };
const brandSettingsRoutes = new Hono<{ Bindings: Env }>();

interface Auth { userId: string; tenantId: string; email?: string }

// ─── GET brand profile ────────────────────────────────────────────────────────
brandSettingsRoutes.get('/:workspaceId', async (c) => {
  const auth = c.get('auth') as Auth;
  const { workspaceId } = c.req.param();
  const db = c.env.DB;

  try {
    const row = await db.prepare(
      'SELECT * FROM brand_settings WHERE tenant_id = ? AND workspace_id = ?'
    ).bind(auth.tenantId, workspaceId).first();

    if (!row) return c.json({}); // no brand settings yet — return empty
    return c.json(row);
  } catch {
    return c.json({});
  }
});

// ─── PATCH brand profile ──────────────────────────────────────────────────────
brandSettingsRoutes.patch('/:workspaceId', async (c) => {
  const auth = c.get('auth') as Auth;
  const { workspaceId } = c.req.param();

  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }

  const ALLOWED = [
    'theme_key', 'primary_color', 'logo_url', 'custom_domain',
    'social_whatsapp', 'social_instagram', 'social_twitter',
    'social_facebook', 'social_tiktok', 'social_youtube',
    'seo_title', 'seo_description', 'seo_keywords',
  ];

  const filtered = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED.includes(k))
  );
  if (!Object.keys(filtered).length) return c.json({ error: 'No valid fields provided' }, 400);

  const db = c.env.DB;
  const now = Math.floor(Date.now() / 1000);

  try {
    // Upsert pattern: try update first, then insert
    const existing = await db.prepare(
      'SELECT id FROM brand_settings WHERE tenant_id = ? AND workspace_id = ?'
    ).bind(auth.tenantId, workspaceId).first<{ id: string }>();

    if (existing) {
      const setClauses = Object.keys(filtered).map(k => `${k} = ?`).join(', ');
      await db.prepare(
        `UPDATE brand_settings SET ${setClauses}, updated_at = ? WHERE tenant_id = ? AND workspace_id = ?`
      ).bind(...Object.values(filtered), now, auth.tenantId, workspaceId).run();
    } else {
      const allFields = { ...filtered, tenant_id: auth.tenantId, workspace_id: workspaceId, id: crypto.randomUUID(), created_at: now, updated_at: now };
      const cols = Object.keys(allFields).join(', ');
      const vals = Object.values(allFields);
      const placeholders = vals.map(() => '?').join(', ');
      await db.prepare(`INSERT INTO brand_settings (${cols}) VALUES (${placeholders})`).bind(...vals).run();
    }

    return c.json({ success: true, updated: Object.keys(filtered) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return c.json({ error: msg }, 400);
  }
});

// ─── POST logo upload ─────────────────────────────────────────────────────────
// NOTE: Logo upload to R2/CDN is handled by a separate upload service.
// This endpoint receives an already-uploaded URL and saves it.
brandSettingsRoutes.post('/logo', async (c) => {
  const auth = c.get('auth') as Auth;
  let body: { url?: string; workspace_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid body' }, 400); }
  if (!body.url) return c.json({ error: 'url is required' }, 400);
  if (!body.workspace_id) return c.json({ error: 'workspace_id is required' }, 400);

  const db = c.env.DB;
  const now = Math.floor(Date.now() / 1000);

  try {
    const existing = await db.prepare(
      'SELECT id FROM brand_settings WHERE tenant_id = ? AND workspace_id = ?'
    ).bind(auth.tenantId, body.workspace_id).first<{ id: string }>();

    if (existing) {
      await db.prepare(
        'UPDATE brand_settings SET logo_url = ?, updated_at = ? WHERE tenant_id = ? AND workspace_id = ?'
      ).bind(body.url, now, auth.tenantId, body.workspace_id).run();
    } else {
      await db.prepare(
        'INSERT INTO brand_settings (id, tenant_id, workspace_id, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), auth.tenantId, body.workspace_id, body.url, now, now).run();
    }
    return c.json({ success: true, url: body.url });
  } catch (err: unknown) {
    return c.json({ error: err instanceof Error ? err.message : 'Failed' }, 500);
  }
});

export { brandSettingsRoutes };
