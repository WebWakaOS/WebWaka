/**
 * Tenant resolution middleware for brand-runtime.
 * (Pillar 2 — PV-1.1)
 *
 * Resolves the tenant from the request hostname or the :slug route param.
 * Priority:
 *   1. Custom domain match  (tenant_branding.custom_domain → organization slug)
 *   2. Subdomain slug       (brand-{slug}.webwaka.com → slug)
 *   3. Route param :slug    (explicit slug in URL path)
 *
 * Sets `c.set('tenantSlug', slug)` and `c.set('tenantId', id)` for downstream.
 * Returns 404 if tenant cannot be resolved.
 *
 * T3: tenant isolation — all downstream DB queries must bind tenantId.
 *
 * Schema notes:
 *   - Tenant identity lives in `organizations` (0002_init_entities)
 *   - `tenant_branding` table may not yet exist; queries are wrapped defensively
 *   - `organizations.slug` column is expected (added by vertical scaffolding)
 */

import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../env.js';

export const tenantResolve = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    if (c.get('tenantSlug')) {
      await next();
      return;
    }

    const host = c.req.header('host') ?? '';
    let slug: string | null = null;

    // 1. Custom domain lookup (tenant_branding may not be migrated yet)
    try {
      const customDomainRow = await c.env.DB
        .prepare(`SELECT o.slug FROM tenant_branding tb JOIN organizations o ON o.id = tb.tenant_id WHERE tb.custom_domain = ? LIMIT 1`)
        .bind(host)
        .first<{ slug: string }>();
      if (customDomainRow) {
        slug = customDomainRow.slug;
      }
    } catch {
      // tenant_branding table may not exist yet — skip custom domain resolution
    }

    // 2. Subdomain pattern: brand-{slug}.webwaka.com
    if (!slug) {
      const subMatch = host.match(/^brand-([a-z0-9-]+)\.webwaka\.com(?::\d+)?$/i);
      if (subMatch) {
        slug = subMatch[1] ?? null;
      }
    }

    // 3. Route param :slug
    if (!slug) {
      slug = c.req.param('slug') ?? null;
    }

    if (!slug) {
      return c.text('Tenant not found', 404);
    }

    // Resolve tenant ID from organizations (the canonical tenant entity)
    const orgRow = await c.env.DB
      .prepare(`SELECT id, name FROM organizations WHERE slug = ? LIMIT 1`)
      .bind(slug)
      .first<{ id: string; name: string }>();

    if (!orgRow) {
      return c.text('Tenant not found', 404);
    }

    c.set('tenantSlug', slug);
    c.set('tenantId', orgRow.id);
    c.set('tenantName', orgRow.name);

    // Optionally load theme color from tenant_branding if table exists
    try {
      const brandRow = await c.env.DB
        .prepare(`SELECT primary_color FROM tenant_branding WHERE tenant_id = ? LIMIT 1`)
        .bind(orgRow.id)
        .first<{ primary_color: string | null }>();
      if (brandRow?.primary_color) {
        c.set('themeColor', brandRow.primary_color);
      }
    } catch {
      // tenant_branding not migrated yet — use defaults
    }

    await next();
  },
);
