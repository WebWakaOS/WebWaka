/**
 * Tenant resolution middleware for brand-runtime.
 * (Pillar 2 — PV-1.1)
 *
 * Resolves the tenant from the request hostname or the :slug route param.
 * Priority:
 *   1. Custom domain match  (host header → tenant_branding.custom_domain)
 *   2. Subdomain slug       (brand-{slug}.webwaka.ng → slug)
 *   3. Route param :slug    (explicit slug in URL path)
 *
 * Sets `c.set('tenantSlug', slug)` for downstream handlers.
 * Returns 404 if tenant cannot be resolved.
 *
 * T3: tenant isolation — all downstream DB queries must bind tenantId.
 */

import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../env.js';

export const tenantResolve = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const host = c.req.header('host') ?? '';
    let slug: string | null = null;

    // 1. Custom domain lookup
    const customDomainRow = await c.env.DB
      .prepare(`SELECT tenant_slug FROM tenant_branding WHERE custom_domain = ? LIMIT 1`)
      .bind(host)
      .first<{ tenant_slug: string }>();
    if (customDomainRow) {
      slug = customDomainRow.tenant_slug;
    }

    // 2. Subdomain pattern: brand-{slug}.webwaka.ng
    if (!slug) {
      const subMatch = host.match(/^brand-([a-z0-9-]+)\.webwaka\.ng(?::\d+)?$/i);
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

    c.set('tenantSlug', slug);

    const tenantRow = await c.env.DB
      .prepare(`SELECT t.id AS tenant_id, tb.display_name, tb.primary_color
                FROM tenants t
                LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
                WHERE t.slug = ? LIMIT 1`)
      .bind(slug)
      .first<{ tenant_id: string; display_name: string | null; primary_color: string | null }>();

    if (tenantRow) {
      c.set('tenantId', tenantRow.tenant_id);
      if (tenantRow.display_name) c.set('tenantName', tenantRow.display_name);
      if (tenantRow.primary_color) c.set('themeColor', tenantRow.primary_color);
    }

    await next();
  },
);
