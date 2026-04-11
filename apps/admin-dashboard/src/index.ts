/**
 * apps/admin-dashboard — Cloudflare Workers entry point for the admin dashboard.
 *
 * Renders the admin layout model and exposes management endpoints.
 * Authentication is required for all routes via JWT (SEC-001).
 *
 * Routes:
 *   GET  /health               — liveness probe (no auth)
 *   GET  /layout               — admin layout model (JWT required, admin+ role)
 *   GET  /billing              — workspace billing history (JWT required, admin+ role)
 *
 * Milestone 6 — Frontend Composition Layer
 * SEC-001: JWT auth replaces x-workspace-id header trust (2026-04-11)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import {
  getTenantManifestById,
  buildAdminLayout,
} from '@webwaka/frontend';
import {
  resolveAuthContext,
  requireRole,
} from '@webwaka/auth';
import { Role } from '@webwaka/types';
import type { AuthContext } from '@webwaka/types';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface BillingRow {
  id: string;
  workspace_id: string;
  paystack_ref: string | null;
  amount_kobo: number;
  status: string;
  metadata: string;
  created_at: string;
}

interface SubscriptionRow {
  plan: string;
  status: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
app.use('*', cors({
  origin: ['https://*.webwaka.com', 'http://localhost:5173'],
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
}));

// ---------------------------------------------------------------------------
// Health — no auth required
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ status: 'ok', app: 'admin-dashboard' }));

// ---------------------------------------------------------------------------
// JWT Authentication middleware — applied to all routes below this point
// SEC-001: Replaces untrusted x-workspace-id header with JWT-verified identity
// ---------------------------------------------------------------------------

app.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization') ?? null;
  const result = await resolveAuthContext(authHeader, c.env.JWT_SECRET);

  if (!result.success) {
    return c.json({ error: result.message }, result.status);
  }

  c.set('auth', result.context);
  await next();
});

// ---------------------------------------------------------------------------
// Layout model — GET /layout
// SEC-001: workspace_id derived from JWT, role must be admin or above
// ---------------------------------------------------------------------------

app.get('/layout', async (c) => {
  const auth = c.get('auth');

  try {
    requireRole(auth, Role.Admin);
  } catch {
    return c.json({ error: 'Access denied. Admin role required.' }, 403);
  }

  const workspaceId = auth.workspaceId;
  const db = c.env.DB as unknown as D1Like;
  const manifest = await getTenantManifestById(db, workspaceId);
  if (!manifest) return c.json({ error: 'Workspace not found' }, 404);

  const sub = await db
    .prepare(
      'SELECT plan, status FROM subscriptions WHERE workspace_id = ? AND tenant_id = ?',
    )
    .bind(workspaceId, auth.tenantId)
    .first<SubscriptionRow>();

  const plan = sub?.plan ?? 'free';
  const layout = buildAdminLayout(manifest, plan);

  return c.json({ layout, plan, subscriptionStatus: sub?.status ?? 'inactive' });
});

// ---------------------------------------------------------------------------
// Billing — GET /billing
// SEC-001: workspace_id derived from JWT, role must be admin or above
// ---------------------------------------------------------------------------

app.get('/billing', async (c) => {
  const auth = c.get('auth');

  try {
    requireRole(auth, Role.Admin);
  } catch {
    return c.json({ error: 'Access denied. Admin role required.' }, 403);
  }

  const workspaceId = auth.workspaceId;
  const db = c.env.DB as unknown as D1Like;
  const rows = await db
    .prepare(
      `SELECT id, workspace_id, paystack_ref, amount_kobo, status, metadata,
              datetime(created_at,'unixepoch') AS created_at
       FROM billing_history
       WHERE workspace_id = ? AND tenant_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .bind(workspaceId, auth.tenantId)
    .all<BillingRow>();

  const records = rows.results.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    paystackRef: r.paystack_ref,
    amountKobo: r.amount_kobo,
    status: r.status,
    metadata: (() => { try { return JSON.parse(r.metadata) as Record<string, unknown>; } catch { return {}; } })(),
    createdAt: r.created_at,
  }));

  return c.json({ workspaceId, records, total: records.length });
});

export default app;
