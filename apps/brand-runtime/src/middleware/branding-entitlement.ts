/**
 * ENT-003: Branding entitlement middleware for brand-runtime.
 *
 * After tenant resolution, verifies the tenant's workspace subscription
 * includes branding rights (Pillar 2). If not, serves an upgrade prompt page.
 *
 * Exempt: /health endpoint (handled before this middleware in index.ts).
 *
 * Platform Invariants: T5 — Subscription-Gated Features
 */

import type { Context, Next } from 'hono';
import type { Env, Variables } from '../env.js';

interface WorkspaceRow {
  subscription_plan: string;
  subscription_status: string;
}

const PLANS_WITH_BRANDING = new Set([
  'starter',
  'growth',
  'pro',
  'enterprise',
  'partner',
  'sub_partner',
]);

const UPGRADE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Branding Not Activated</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100dvh; margin: 0; background: #f9fafb; color: #111827; }
    .card { max-width: 420px; padding: 2rem; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; margin-bottom: 1.5rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #1a6b3a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Branding Not Activated</h1>
    <p>Your current plan does not include branded website features. Upgrade to Starter or above to unlock your custom branded portal.</p>
    <a href="https://webwaka.com/pricing">View Plans &amp; Upgrade</a>
  </div>
</body>
</html>`;

export async function brandingEntitlementMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next): Promise<Response | void> {
  const tenantId = c.get('tenantId') as string | undefined;

  if (!tenantId) {
    return next();
  }

  const row = await c.env.DB
    .prepare(
      `SELECT s.plan AS subscription_plan, s.status AS subscription_status
       FROM workspaces w
       JOIN subscriptions s ON s.workspace_id = w.id AND s.tenant_id = w.tenant_id
       WHERE w.tenant_id = ?
       AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
    )
    .bind(tenantId)
    .first<WorkspaceRow>();

  if (!row || !PLANS_WITH_BRANDING.has(row.subscription_plan)) {
    return c.html(UPGRADE_HTML, 403);
  }

  await next();
}
