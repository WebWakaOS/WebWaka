/**
 * brand-runtime — Comprehensive test suite
 * (Pillar 2 — CODE-1/PV-3)
 *
 * Covers:
 *  - Liveness probe + SEO static assets (robots.txt, manifest.json)
 *  - Tenant resolution via Host header subdomain pattern
 *  - Branding-entitlement gate (ENT-003 / T5)
 *  - Branded public pages: home, about, services, contact (GET + POST)
 *  - Portal login shell
 *  - Slug-path fallback route
 *  - 404 for unknown tenants
 *  - Theme CSS custom properties injected into HTML output
 *  - Price rendering in integer kobo (P9)
 *
 * Strategy: mount the full Hono app (so middleware chains fire), supply a mock
 * D1 + KV env, send requests with `Host: brand-<slug>.webwaka.ng` to trigger
 * subdomain-based tenant resolution.
 *
 * NOTE: Hono `app.request(requestOrUrl, requestInit, env)` — env is the 3rd arg.
 */

import { describe, it, expect } from 'vitest';
import app from './index.js';
import type { Env } from './env.js';

// ---------------------------------------------------------------------------
// DB mock helpers
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

interface MockOpts {
  org?: { id: string; slug: string; name: string; description?: string } | null;
  primaryColor?: string | null;
  subscription?: { plan: string; status: string } | null;
  offerings?: Row[];
}

/**
 * Build a minimal D1-compatible mock that routes queries by SQL pattern.
 * All query shapes used by brand-runtime middleware and route handlers are handled.
 */
function makeDB(opts: MockOpts = {}): D1Database {
  const {
    org = null,
    primaryColor = '#1a6b3a',
    subscription = { plan: 'starter', status: 'active' },
    offerings = [],
  } = opts;

  function bindResult(sql: string) {
    const lo = sql.toLowerCase();
    return {
      all: async <T>(): Promise<{ results: T[] }> => {
        if (lo.includes('offerings')) return { results: offerings as T[] };
        return { results: [] as T[] };
      },
      first: async <T>(): Promise<T | null> => {
        // getBrandTokens — most specific first: SELECT ... AS tenantId, AS tenantSlug ...
        // The alias "AS tenantId" lowercases to "as tenantid" (no underscore).
        if (lo.includes('as tenantid') || lo.includes('as tenantslug')) {
          if (!org) return null;
          return {
            tenantId: org.id,
            tenantSlug: org.slug,
            displayName: org.name,
            primary_color: primaryColor ?? null,
            secondary_color: null,
            accent_color: null,
            font_family: null,
            logo_url: null,
            favicon_url: null,
            border_radius_px: null,
            custom_domain: null,
          } as T;
        }

        // Custom-domain lookup: "WHERE tb.custom_domain = ?"
        // (This query filters BY custom_domain, unlike getBrandTokens which SELECTs it)
        if (lo.includes('custom_domain') && lo.includes('join')) return null;

        // tenantResolve: SELECT id, name FROM organizations WHERE slug = ?
        if (lo.includes('from organizations') && lo.includes('slug')) {
          if (!org) return null;
          return { id: org.id, name: org.name } as T;
        }

        // Theme color hint: SELECT primary_color FROM tenant_branding WHERE tenant_id = ?
        if (lo.includes('primary_color') && lo.includes('tenant_branding')) {
          return primaryColor ? { primary_color: primaryColor } as T : null;
        }

        // Entitlement gate: workspaces JOIN subscriptions
        if (lo.includes('workspaces') || lo.includes('subscription_plan')) {
          if (!subscription) return null;
          return {
            subscription_plan: subscription.plan,
            subscription_status: subscription.status,
          } as T;
        }

        // fetchProfile: organizations LEFT JOIN entity_profiles
        if (lo.includes('entity_profiles') || lo.includes('ep.phone')) {
          return {
            description: org?.description ?? null,
            phone: null,
            email: null,
            website: null,
            place_name: 'Lagos',
            category: 'Restaurant',
          } as T;
        }

        return null;
      },
      run: async () => ({ success: true, meta: {} as D1Meta }),
    };
  }

  return {
    prepare: (sql: string) => ({
      bind: (..._args: unknown[]) => bindResult(sql),
      ...bindResult(sql),
    }),
    batch: async (stmts: D1PreparedStatement[]) =>
      stmts.map(() => ({ success: true, results: [], meta: {} as D1Meta })),
    exec: async (_sql: string) => ({ count: 0, duration: 0 }),
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database;
}

const stubKV: KVNamespace = {
  get: async (_key: string) => null,
  put: async () => undefined,
  delete: async () => undefined,
  list: async () => ({ keys: [], list_complete: true, cacheStatus: null }),
  getWithMetadata: async () => ({ value: null, metadata: null, cacheStatus: null }),
} as unknown as KVNamespace;

function makeEnv(opts: MockOpts = {}): Env {
  return {
    DB: makeDB(opts),
    THEME_CACHE: stubKV,
    JWT_SECRET: 'test-jwt-secret-min-32-chars-pad!!',
    LOG_PII_SALT: 'test-pii-salt-min-32-chars-padding!',
    INTER_SERVICE_SECRET: 'inter-service-test-secret-minimum32c',
    ENVIRONMENT: 'development',
  };
}

/** Build a Request with Host header set to brand-<slug>.webwaka.ng */
function brandReq(path: string, slug: string, init: RequestInit = {}): Request {
  const { headers: extraHeaders, ...rest } = init;
  return new Request(`http://brand-${slug}.webwaka.ng${path}`, {
    headers: {
      host: `brand-${slug}.webwaka.ng`,
      ...(extraHeaders as Record<string, string> ?? {}),
    },
    ...rest,
  });
}

const ACME = {
  id: 'org_acme_001',
  slug: 'acme',
  name: 'Acme Nigeria Ltd',
  description: 'A test company in Nigeria.',
};

// ---------------------------------------------------------------------------
// T01 — Liveness probe
// ---------------------------------------------------------------------------
describe('T01: GET /health', () => {
  it('returns 200 with worker name — no env required', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.worker).toBe('brand-runtime');
  });
});

// ---------------------------------------------------------------------------
// T02 — robots.txt SEO directive compliance (SEO-01)
// ---------------------------------------------------------------------------
describe('T02: GET /robots.txt', () => {
  it('returns 200 with User-agent, Allow, and Disallow directives', async () => {
    const res = await app.request('/robots.txt');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /portal/');
    expect(text).toContain('Disallow: /health');
  });

  it('sets long-lived cache-control header', async () => {
    const res = await app.request('/robots.txt');
    expect(res.headers.get('cache-control')).toContain('max-age=86400');
  });
});

// ---------------------------------------------------------------------------
// T03 — PWA manifest (tenant-dynamic after tenant resolution)
// ---------------------------------------------------------------------------
describe('T03: GET /manifest.json', () => {
  it('returns 200 JSON manifest with tenant display name', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/manifest.json', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const manifest = await res.json() as Record<string, unknown>;
    expect(manifest.name).toBe('Acme Nigeria Ltd');
    expect(manifest.start_url).toBe('/');
    expect(manifest.lang).toBe('en-NG');
  });

  it('returns 404 when no tenant is resolved (manifest requires tenant context)', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request('/manifest.json', {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T04 — Tenant resolution + branded home page
// ---------------------------------------------------------------------------
describe('T04: GET / — branded home page', () => {
  it('returns 200 with tenant display name in HTML', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Acme Nigeria Ltd');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('injects CSS custom properties from theme into the page', async () => {
    const env = makeEnv({ org: ACME, primaryColor: '#2d6a4f' });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('--ww-primary');
    expect(html).toContain('#2d6a4f');
  });

  it('returns 404 when tenant org does not exist in DB', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/', 'unknown-tenant'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T05 — Offerings on home page rendered with kobo→naira conversion (P9)
// ---------------------------------------------------------------------------
describe('T05: Offerings kobo→naira price rendering on home page', () => {
  it('renders offering name and correct ₦ price from integer kobo', async () => {
    const offerings = [
      {
        name: 'Premium Wash',
        description: 'Full car wash',
        price_kobo: 500000,
        sort_order: 0,
        created_at: '2025-01-01',
        tenant_id: ACME.id,
        is_published: 1,
      },
    ];
    const env = makeEnv({ org: ACME, offerings });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Premium Wash');
    expect(html).toContain('5,000.00');
  });
});

// ---------------------------------------------------------------------------
// T06 — Branding entitlement gate (ENT-003 / T5)
// ---------------------------------------------------------------------------
describe('T06: ENT-003 branding entitlement gate', () => {
  it('serves upgrade page (403) when tenant has no active subscription', async () => {
    const env = makeEnv({ org: ACME, subscription: null });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(403);
    const html = await res.text();
    expect(html).toContain('Branding Not Activated');
    expect(html).toContain('webwaka.com/pricing');
  });

  it('passes through with starter plan subscription', async () => {
    const env = makeEnv({ org: ACME, subscription: { plan: 'starter', status: 'active' } });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
  });

  it('passes through with enterprise plan subscription', async () => {
    const env = makeEnv({ org: ACME, subscription: { plan: 'enterprise', status: 'active' } });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// T07 — GET /about
// ---------------------------------------------------------------------------
describe('T07: GET /about', () => {
  it('returns 200 with "About <TenantName>" heading', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/about', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('About Acme Nigeria Ltd');
  });

  it('returns 404 when tenant not found', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/about', 'ghost'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T08 — GET /services
// ---------------------------------------------------------------------------
describe('T08: GET /services', () => {
  it('returns 200 with services heading', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/services', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Services');
  });

  it('shows empty-state message when no offerings', async () => {
    const env = makeEnv({ org: ACME, offerings: [] });
    const res = await app.request(brandReq('/services', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('No offerings listed yet');
  });

  it('renders offering cards when offerings exist', async () => {
    const offerings = [
      {
        name: 'Hair Braiding',
        description: null,
        price_kobo: 800000,
        sort_order: 0,
        created_at: '2025-01-01',
        tenant_id: ACME.id,
        is_published: 1,
      },
      {
        name: 'Cornrows',
        description: 'Traditional style',
        price_kobo: 350000,
        sort_order: 1,
        created_at: '2025-01-01',
        tenant_id: ACME.id,
        is_published: 1,
      },
    ];
    const env = makeEnv({ org: ACME, offerings });
    const res = await app.request(brandReq('/services', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Hair Braiding');
    expect(html).toContain('Cornrows');
    expect(html).toContain('8,000.00');
  });
});

// ---------------------------------------------------------------------------
// T09 — GET /contact
// ---------------------------------------------------------------------------
describe('T09: GET /contact', () => {
  it('returns 200 with contact form pointing to POST /contact', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/contact', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Contact');
    expect(html).toContain('<form');
    expect(html).toContain('action="/contact"');
  });
});

// ---------------------------------------------------------------------------
// T10 — POST /contact
// ---------------------------------------------------------------------------
describe('T10: POST /contact', () => {
  it('accepts valid JSON and returns { ok: true }', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(
      brandReq('/contact', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Chidi Okeke', phone: '+2348012345678', message: 'Hello world' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(
      brandReq('/contact', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Chidi Okeke' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBeTruthy();
  });

  it('returns 404 when no tenant resolved during contact submission', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(
      new Request('http://brand-ghost.webwaka.ng/contact', {
        method: 'POST',
        headers: { host: 'brand-ghost.webwaka.ng', 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'X', phone: '+234', message: 'Hi' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T11 — Portal login shell
// ---------------------------------------------------------------------------
describe('T11: GET /portal/login', () => {
  it('returns 200 with tenant-branded sign-in form', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/portal/login', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Sign in to Acme Nigeria Ltd');
    expect(html).toContain('<form');
    expect(html).toContain('action="/portal/login"');
  });

  it('returns 404 when tenant not found on portal login', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/portal/login', 'nobody'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T12 — Slug-path fallback: GET /:slug
// ---------------------------------------------------------------------------
describe('T12: GET /:slug — path-based tenant fallback', () => {
  it('returns 200 with tenant display name when accessed via slug path', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/acme', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Acme Nigeria Ltd');
  });
});

// ---------------------------------------------------------------------------
// T13 — 404 for unknown tenants
// ---------------------------------------------------------------------------
describe('T13: Unknown tenants return 404', () => {
  it('returns 404 when tenant is not in DB', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/', 'nosuchslug'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T14 — SEO OG / meta tags on home page
// ---------------------------------------------------------------------------
describe('T14: SEO meta tags on branded home page', () => {
  it('includes og:title, og:description, og:type, and canonical link', async () => {
    const env = makeEnv({
      org: { ...ACME, description: 'Providing quality service.' },
    });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('og:type');
    expect(html).toContain('rel="canonical"');
  });
});

// ---------------------------------------------------------------------------
// T15 — Attribution rendered on pages (GAP-003 — White-Label Policy §4)
// ---------------------------------------------------------------------------
describe('T15: Attribution rendered when subscription does not remove it', () => {
  it('includes "Powered by WebWaka" attribution on home page', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('webwaka.ng');
  });
});
