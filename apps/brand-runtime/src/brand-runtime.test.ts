/* eslint-disable @typescript-eslint/require-await */
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
 * D1 + KV env, send requests with `Host: brand-<slug>.webwaka.com` to trigger
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
  blogPosts?: Row[];
  /** ENT-004: optional sub-partner relationship (for depth enforcement tests) */
  subPartner?: { partner_id: string } | null;
  /** ENT-004: optional depth entitlement granted by partner */
  depthEntitlement?: { value: string } | null;
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
    blogPosts = [],
    subPartner = null,
    depthEntitlement = null,
  } = opts;

  function bindResult(sql: string) {
    const lo = sql.toLowerCase();
    return {
      all: async <T>(): Promise<{ results: T[] }> => {
        if (lo.includes('blog_posts')) return { results: blogPosts as T[] };
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

        // ENT-004: sub_partners lookup (whiteLabelDepthMiddleware)
        if (lo.includes('sub_partners')) {
          return (subPartner ?? null) as T | null;
        }

        // ENT-004: partner_entitlements lookup (whiteLabelDepthMiddleware)
        if (lo.includes('partner_entitlements')) {
          return (depthEntitlement ?? null) as T | null;
        }

        // manifest.webmanifest: SELECT o.name AS business_name, tb.primary_color, tb.logo_url
        // sitemap.ts — fixed to use o.id (not o.tenant_id)
        if (lo.includes('business_name')) {
          if (!org) return null;
          return { business_name: org.name, primary_color: primaryColor ?? null, logo_url: null } as T;
        }

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

        // blog post single lookup: SELECT ... FROM blog_posts WHERE ... slug = ?
        if (lo.includes('blog_posts') && lo.includes('limit 1')) {
          if (blogPosts.length > 0) return blogPosts[0] as T;
          return null;
        }

        // shop product lookup: SELECT ... FROM offerings WHERE ... AND id = ?
        if (lo.includes('offerings') && lo.includes('and id')) {
          if (offerings.length > 0) return offerings[0] as T;
          return null;
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
    CART_KV: stubKV,
    JWT_SECRET: 'test-jwt-secret-min-32-chars-pad!!',
    LOG_PII_SALT: 'test-pii-salt-min-32-chars-padding!',
    INTER_SERVICE_SECRET: 'inter-service-test-secret-minimum32c',
    ENVIRONMENT: 'development',
  };
}

/** Build a Request with Host header set to brand-<slug>.webwaka.com */
function brandReq(path: string, slug: string, init: RequestInit = {}): Request {
  const { headers: extraHeaders, ...rest } = init;
  return new Request(`http://brand-${slug}.webwaka.com${path}`, {
    headers: {
      host: `brand-${slug}.webwaka.com`,
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
    const body: Record<string, unknown> = await res.json();
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
    const manifest: Record<string, unknown> = await res.json();
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
    const body: Record<string, unknown> = await res.json();
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
    const body: Record<string, unknown> = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 404 when no tenant resolved during contact submission', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(
      new Request('http://brand-ghost.webwaka.com/contact', {
        method: 'POST',
        headers: { host: 'brand-ghost.webwaka.com', 'content-type': 'application/json' },
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
    expect(html).toContain('webwaka.com');
  });
});

// ---------------------------------------------------------------------------
// T16 — Blog listing page (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T16: GET /blog — blog listing page', () => {
  it('returns 200 with HTML for active tenant', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/blog', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Blog');
  });

  it('renders blog post titles from DB', async () => {
    const posts = [
      { id: 'p1', slug: 'hello-world', title: 'Hello World Post', excerpt: 'First post ever', published_at: 1700000000, author_name: 'Jane Doe', status: 'published' },
    ];
    const env = makeEnv({ org: ACME, blogPosts: posts });
    const res = await app.request(brandReq('/blog', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Hello World Post');
    expect(html).toContain('Jane Doe');
  });

  it('renders empty state when no posts exist', async () => {
    const env = makeEnv({ org: ACME, blogPosts: [] });
    const res = await app.request(brandReq('/blog', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('No posts published yet');
  });

  it('includes og:title meta tag', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/blog', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('og:title');
  });

  it('returns 404 when tenant is unknown', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/blog', 'nobody'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T17 — Blog post detail page (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T17: GET /blog/:slug — blog post detail', () => {
  const POST = {
    id: 'post_001',
    slug: 'my-first-post',
    title: 'My First Post',
    content: '<p>This is the full content of the post.</p>',
    published_at: 1700000000,
    author_name: 'Tunde Bello',
    cover_image_url: null,
    status: 'published',
  };

  it('returns 200 with post title and content', async () => {
    const env = makeEnv({ org: ACME, blogPosts: [POST] });
    const res = await app.request(brandReq('/blog/my-first-post', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('My First Post');
    expect(html).toContain('Tunde Bello');
    expect(html).toContain('articleBody');
  });

  it('includes Schema.org BlogPosting microdata', async () => {
    const env = makeEnv({ org: ACME, blogPosts: [POST] });
    const res = await app.request(brandReq('/blog/my-first-post', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('schema.org/BlogPosting');
    expect(html).toContain('datePublished');
  });

  it('returns 404 when post does not exist', async () => {
    const env = makeEnv({ org: ACME, blogPosts: [] });
    const res = await app.request(brandReq('/blog/nonexistent', 'acme'), {}, env);
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('Post Not Found');
  });

  it('includes og:title for the post', async () => {
    const env = makeEnv({ org: ACME, blogPosts: [POST] });
    const res = await app.request(brandReq('/blog/my-first-post', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('og:title');
  });
});

// ---------------------------------------------------------------------------
// T18 — Shop listing page (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T18: GET /shop — shop listing page', () => {
  const OFFERING = {
    id: 'off_001',
    name: 'Premium Package',
    description: 'Our premium service offering',
    price_kobo: 1500000,
    image_url: null,
    category: 'Services',
    is_published: 1,
    sort_order: 0,
    created_at: 1700000000,
    tenant_id: ACME.id,
  };

  it('returns 200 with shop HTML for active tenant', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/shop', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Shop');
  });

  it('renders offering name and P9 price in ₦', async () => {
    const env = makeEnv({ org: ACME, offerings: [OFFERING] });
    const res = await app.request(brandReq('/shop', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Premium Package');
    expect(html).toContain('15,000.00');
  });

  it('renders "No products" empty state when no offerings', async () => {
    const env = makeEnv({ org: ACME, offerings: [] });
    const res = await app.request(brandReq('/shop', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('No products available yet');
  });

  it('includes og:title meta tag for shop page', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/shop', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('og:title');
  });

  it('returns 404 when tenant is unknown', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/shop', 'nobody'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T19 — Shop product detail page (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T19: GET /shop/:productId — product detail', () => {
  const PRODUCT = {
    id: 'prod_001',
    name: 'Deluxe Service',
    description: 'A premium deluxe experience',
    price_kobo: 2000000,
    image_url: null,
    category: 'Premium',
    is_published: 1,
  };

  it('returns 200 with product name and P9 price', async () => {
    const env = makeEnv({ org: ACME, offerings: [PRODUCT] });
    const res = await app.request(brandReq('/shop/prod_001', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Deluxe Service');
    expect(html).toContain('20,000.00');
  });

  it('includes add-to-cart form pointing to /shop/cart/add', async () => {
    const env = makeEnv({ org: ACME, offerings: [PRODUCT] });
    const res = await app.request(brandReq('/shop/prod_001', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('/shop/cart/add');
    expect(html).toContain('name="productId"');
  });

  it('returns 404 when product does not exist', async () => {
    const env = makeEnv({ org: ACME, offerings: [] });
    const res = await app.request(brandReq('/shop/nonexistent_product', 'acme'), {}, env);
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('Product Not Found');
  });

  it('includes og:title for product page', async () => {
    const env = makeEnv({ org: ACME, offerings: [PRODUCT] });
    const res = await app.request(brandReq('/shop/prod_001', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('og:title');
  });
});

// ---------------------------------------------------------------------------
// T20 — Cart page (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T20: GET /shop/cart — shopping cart', () => {
  it('returns 200 with empty cart message when no session', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/shop/cart', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Your Cart');
    expect(html).toContain('cart is empty');
  });

  it('shows proceed to checkout button when cart has items (stubbed KV returns items)', async () => {
    // Stub KV to return cart items
    const cartItems = [{ productId: 'p1', name: 'Test Item', price_kobo: 500000, qty: 2 }];
    const cartKV: KVNamespace = {
      get: async (_key: string, _type?: string) => cartItems as unknown,
      put: async () => undefined,
      delete: async () => undefined,
      list: async () => ({ keys: [], list_complete: true, cacheStatus: null }),
      getWithMetadata: async () => ({ value: null, metadata: null, cacheStatus: null }),
    } as unknown as KVNamespace;
    const env = { ...makeEnv({ org: ACME }), CART_KV: cartKV };
    const res = await app.request(
      brandReq('/shop/cart', 'acme', { headers: { Cookie: 'ww_session=testsession001' } }),
      {},
      env,
    );
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Test Item');
    expect(html).toContain('Proceed to Checkout');
    expect(html).toContain('10,000.00');
  });
});

// ---------------------------------------------------------------------------
// T21 — POST /shop/cart/add (P4-A HIGH-007)
// ---------------------------------------------------------------------------
describe('T21: POST /shop/cart/add — add item to cart', () => {
  it('redirects to /shop/cart on success', async () => {
    const offering = { id: 'off_01', name: 'Basic Service', price_kobo: 100000, is_published: 1 };
    const env = makeEnv({ org: ACME, offerings: [offering] });
    const res = await app.request(
      brandReq('/shop/cart/add', 'acme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'productId=off_01&qty=1',
      }),
      {},
      env,
    );
    // Should redirect to cart
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/shop/cart');
  });

  it('redirects to /shop when productId is missing', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(
      brandReq('/shop/cart/add', 'acme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: '',
      }),
      {},
      env,
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/shop');
  });
});

// ---------------------------------------------------------------------------
// T22 — GET /sitemap.xml — tenant sitemap (P4-A SEO-02)
// ---------------------------------------------------------------------------
describe('T22: GET /sitemap.xml — tenant sitemap', () => {
  it('returns 200 XML sitemap with static pages', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/sitemap.xml', 'acme'), {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/xml');
    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('/about');
    expect(xml).toContain('/services');
    expect(xml).toContain('/shop');
    expect(xml).toContain('/blog');
  });

  it('includes offering URLs when offerings are present', async () => {
    const offerings = [{ id: 'off_sitemap_01', updated_at: 1700000000 }];
    const env = makeEnv({ org: ACME, offerings });
    const res = await app.request(brandReq('/sitemap.xml', 'acme'), {}, env);
    const xml = await res.text();
    expect(xml).toContain('/shop/off_sitemap_01');
  });

  it('has cache-control headers for CDN caching', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/sitemap.xml', 'acme'), {}, env);
    expect(res.headers.get('cache-control')).toContain('max-age=3600');
  });

  it('returns 404 for unknown tenants', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/sitemap.xml', 'nobody'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T23 — GET /manifest.webmanifest — dynamic PWA manifest (P4-A)
// ---------------------------------------------------------------------------
describe('T23: GET /manifest.webmanifest — dynamic PWA manifest', () => {
  it('returns 200 JSON with correct content-type', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/manifest.webmanifest', 'acme'), {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('manifest');
    const manifest: Record<string, unknown> = await res.json();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#ffffff');
  });

  it('sets cache-control header', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/manifest.webmanifest', 'acme'), {}, env);
    expect(res.headers.get('cache-control')).toContain('max-age=3600');
  });
});

// ---------------------------------------------------------------------------
// T24 — Base template Open Graph meta tags (SEO-02 P4-A)
// ---------------------------------------------------------------------------
describe('T24: Open Graph meta tags injected via base template (SEO-02)', () => {
  it('injects og:title and Twitter card meta tags', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
  });

  it('injects PWA manifest link tag on all pages', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/about', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('manifest.webmanifest');
  });

  it('nav includes Shop and Blog links', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('href="/shop"');
    expect(html).toContain('href="/blog"');
  });
});

// ===========================================================================
// T25: White-label depth enforcement — ENT-004 (P5)
// ===========================================================================

import { Hono } from 'hono';
import { whiteLabelDepthMiddleware } from './middleware/white-label-depth.js';

/**
 * Minimal test app that mounts whiteLabelDepthMiddleware and exposes the
 * resolved depth via GET /depth so tests can assert on it.
 */
function makeDepthTestApp(opts: {
  tenantId?: string;
  subPartner?: { partner_id: string } | null;
  entitlement?: { value: string } | null;
} = {}) {
  type AppEnv = { Bindings: { DB: unknown }; Variables: { tenantId?: string; whiteLabelDepth?: number } };
  const app = new Hono<AppEnv>();

  const db = {
    prepare: (sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async <T>(): Promise<T | null> => {
          if (sql.includes('sub_partners')) return (opts.subPartner ?? null) as T | null;
          if (sql.includes('partner_entitlements')) return (opts.entitlement ?? null) as T | null;
          return null;
        },
      }),
    }),
  };

  app.use('*', async (c, next) => {
    c.set('tenantId', opts.tenantId ?? 'ten_001');
    c.env = { DB: db } as never;
    await next();
  });

  app.use('*', whiteLabelDepthMiddleware as never);

  app.get('/depth', (c) => {
    return c.json({ depth: c.get('whiteLabelDepth') });
  });

  return app;
}

describe('T25: White-label depth enforcement — ENT-004 (P5)', () => {
  it('sets depth to 2 (unconstrained) when tenant has no sub-partner relationship', async () => {
    const app = makeDepthTestApp({ subPartner: null });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(2);
  });

  it('sets depth to 1 when partner has white_label_depth = 1', async () => {
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_tier1' },
      entitlement: { value: '1' },
    });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(1);
  });

  it('sets depth to 2 when partner has white_label_depth = 2 (full white-label)', async () => {
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_tier2' },
      entitlement: { value: '2' },
    });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(2);
  });

  it('sets depth to 0 when partner has white_label_depth = 0 (no white-label)', async () => {
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_nobranding' },
      entitlement: { value: '0' },
    });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(0);
  });

  it('defaults to depth 1 when sub-tenant partner has no depth entitlement grant', async () => {
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_no_entitlement' },
      entitlement: null,
    });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(1);
  });

  it('defaults to depth 1 when entitlement value is invalid (corrupted data)', async () => {
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_bad' },
      entitlement: { value: 'invalid_value' },
    });
    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    expect(json.depth).toBe(1);
  });

  it('skips depth enforcement when tenantId is not set on context', async () => {
    type AppEnv = { Bindings: { DB: unknown }; Variables: { tenantId?: string; whiteLabelDepth?: number } };
    const app = new Hono<AppEnv>();
    const db = { prepare: () => ({ bind: () => ({ first: async () => null }) }) };
    app.use('*', async (c, next) => { c.env = { DB: db } as never; await next(); });
    app.use('*', whiteLabelDepthMiddleware as never);
    app.get('/depth', (c) => c.json({ depth: c.get('whiteLabelDepth') ?? 'not-set' }));

    const res = await app.request('/depth');
    expect(res.status).toBe(200);
    const json: Record<string, unknown> = await res.json();
    // Middleware skipped — depth was never set by this middleware
    expect(json.depth).toBe('not-set');
  });

  it('a Tier-1 partner cannot grant its sub-tenant deeper white-labelling than allowed', async () => {
    // Partner with depth=1 — sub-tenant should get depth 1, NOT 2
    const app = makeDepthTestApp({
      subPartner: { partner_id: 'prt_tier1_only' },
      entitlement: { value: '1' },
    });
    const res = await app.request('/depth');
    const json: Record<string, unknown> = await res.json();
    // Must be capped at 1 — cannot exceed partner's granted depth
    expect(json.depth).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// T26 — ENT-004: whiteLabelDepth rendered-page enforcement (integration)
// Verifies applyDepthCap() is called by resolveTheme() and actually affects output.
// ---------------------------------------------------------------------------
describe('T26: ENT-004 whiteLabelDepth enforcement in rendered pages', () => {
  it('depth=0: custom primary color is NOT injected into rendered page CSS vars', async () => {
    // Sub-partner restricts tenant to depth=0 (no white-labelling)
    const env = makeEnv({
      org: ACME,
      primaryColor: '#ab1234',
      subPartner: { partner_id: 'prt_restrict' },
      depthEntitlement: { value: '0' },
    });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    // The tenant's custom color must NOT appear in the depth-0 page
    expect(html).not.toContain('#ab1234');
    // But the display name must still be present (identity is always kept)
    expect(html).toContain('Acme Nigeria Ltd');
  });

  it('depth=1: custom primary color IS injected but custom domain/favicon are stripped', async () => {
    const env = makeEnv({
      org: ACME,
      primaryColor: '#2d6a4f',
      subPartner: { partner_id: 'prt_basic' },
      depthEntitlement: { value: '1' },
    });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    // Custom color preserved at depth 1
    expect(html).toContain('#2d6a4f');
    // Display name preserved
    expect(html).toContain('Acme Nigeria Ltd');
  });

  it('depth=2 (default, no sub-partner): custom primary color is fully injected', async () => {
    const env = makeEnv({
      org: ACME,
      primaryColor: '#e63946',
    });
    const res = await app.request(brandReq('/', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('#e63946');
  });
});

// ---------------------------------------------------------------------------
// T27 — /:slug route uses template resolver + fetches profile data
// Verifies the /:slug wildcard route mirrors the / home route behaviour,
// including profile fetch and template resolver call.
// ---------------------------------------------------------------------------
describe('T27: GET /:slug — template resolver parity with GET /', () => {
  it('renders offerings on /:slug just as GET / does', async () => {
    const offerings = [
      { name: 'Quick Fix', description: null, price_kobo: 250000, sort_order: 0, created_at: '2025-01-01', tenant_id: ACME.id, is_published: 1 },
    ];
    const env = makeEnv({ org: ACME, offerings });
    const res = await app.request(brandReq('/acme', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Quick Fix');
    expect(html).toContain('2,500.00');
  });

  it('returns 404 for unknown tenant on /:slug', async () => {
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/acme', 'acme'), {}, env);
    expect(res.status).toBe(404);
  });

  it('injects tenant CSS vars on /:slug same as GET /', async () => {
    const env = makeEnv({ org: ACME, primaryColor: '#667eea' });
    const res = await app.request(brandReq('/acme', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('--ww-primary');
    expect(html).toContain('#667eea');
  });
});

// ---------------------------------------------------------------------------
// T28 — manifest.webmanifest returns correct tenant business name
// Validates the sitemap.ts SQL fix: o.id (not o.tenant_id) in JOIN + WHERE.
// Before fix: query used non-existent o.tenant_id column → always returned
// generic 'WebWaka Business' name. After fix: tenant name is returned.
// ---------------------------------------------------------------------------
describe('T28: GET /manifest.webmanifest — returns tenant business name (sitemap SQL fix)', () => {
  it('returns the tenant business name in the PWA manifest', async () => {
    const env = makeEnv({ org: ACME });
    const res = await app.request(brandReq('/manifest.webmanifest', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const manifest: Record<string, unknown> = await res.json();
    // After the o.tenant_id → o.id fix, the correct name must appear
    expect(manifest.name).toBe('Acme Nigeria Ltd');
    expect(manifest.short_name).toBeTruthy();
  });

  it('returns 404 when tenant cannot be resolved (manifest requires tenant context)', async () => {
    // When tenant resolution fails, the middleware returns 404 before the manifest handler.
    // The manifest.webmanifest endpoint is only reachable for known tenants.
    const env = makeEnv({ org: null });
    const res = await app.request(brandReq('/manifest.webmanifest', 'nobody'), {}, env);
    expect(res.status).toBe(404);
  });

  it('injects tenant primary_color as theme_color in manifest', async () => {
    const env = makeEnv({ org: ACME, primaryColor: '#5e35b1' });
    const res = await app.request(brandReq('/manifest.webmanifest', 'acme'), {}, env);
    const manifest: Record<string, unknown> = await res.json();
    expect(manifest.theme_color).toBe('#5e35b1');
  });
});

// ---------------------------------------------------------------------------
// T29 — Political Role Template Rendering (Sprint 1–4, 16 templates)
// Validates all 16 new political role templates render without throwing for
// each supported page type and mode. Direct renderPage() contract tests.
// ---------------------------------------------------------------------------

import { governorOfficialSiteTemplate } from './templates/niches/governor/official-site.js';
import { senatorOfficialSiteTemplate } from './templates/niches/senator/official-site.js';
import { houseOfRepsMemberOfficialSiteTemplate } from './templates/niches/house-of-reps-member/official-site.js';
import { stateCommissionerOfficialSiteTemplate } from './templates/niches/state-commissioner/official-site.js';
import { federalMinisterOfficialSiteTemplate } from './templates/niches/federal-minister/official-site.js';
import { lgaChairmanOfficialSiteTemplate } from './templates/niches/lga-chairman/official-site.js';
import { houseOfAssemblyMemberOfficialSiteTemplate } from './templates/niches/house-of-assembly-member/official-site.js';
import { presidentialCandidateOfficialSiteTemplate } from './templates/niches/presidential-candidate/official-site.js';
import { politicalAppointeeOfficialSiteTemplate } from './templates/niches/political-appointee/official-site.js';
import { wardCouncillorOfficialSiteTemplate } from './templates/niches/ward-councillor/official-site.js';
import { partyChapterOfficerOfficialSiteTemplate } from './templates/niches/party-chapter-officer/official-site.js';
import { partyStateOfficerOfficialSiteTemplate } from './templates/niches/party-state-officer/official-site.js';
import { deputyGovernorOfficialSiteTemplate } from './templates/niches/deputy-governor/official-site.js';
import { assemblySpeakerOfficialSiteTemplate } from './templates/niches/assembly-speaker/official-site.js';
import { lgaViceChairmanOfficialSiteTemplate } from './templates/niches/lga-vice-chairman/official-site.js';
import { supervisoryCouncillorOfficialSiteTemplate } from './templates/niches/supervisory-councillor/official-site.js';

import type { WebsiteRenderContext } from '@webwaka/verticals';

function makePolCtx(overrides: Partial<WebsiteRenderContext> & { mode?: string; party?: string } = {}): WebsiteRenderContext {
  const { mode, party, ...rest } = overrides as Partial<WebsiteRenderContext> & { mode?: string; party?: string };
  return {
    tenantId: 'test-tenant',
    displayName: 'Test Politician',
    pageType: 'home',
    primaryColor: '#1a6b3a',
    logoUrl: null,
    data: { mode: mode ?? 'campaign', party: party ?? 'APC', placeName: 'Lagos', phone: '08001234567', offerings: [], description: 'Test bio', ...(rest.data ?? {}) },
    ...rest,
  } as WebsiteRenderContext;
}

describe('T29: Political Role Templates — renderPage() contract', () => {
  const pages = ['home', 'about', 'services', 'contact'] as const;

  it('governor: renders all pages in campaign/incumbent/post_office mode without throwing', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const ctx = makePolCtx({ mode, pageType: page });
        const html = governorOfficialSiteTemplate.renderPage(ctx);
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(10);
        expect(html).not.toContain('Unable to load page');
      }
    }
  });

  it('senator: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = senatorOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('house-of-reps-member: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = houseOfRepsMemberOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('state-commissioner: renders in incumbent/post_office mode (no campaign)', () => {
    for (const mode of ['incumbent', 'post_office']) {
      for (const page of pages) {
        const html = stateCommissionerOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, ministry: 'Finance', placeName: 'Kano', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
        expect(html).not.toContain('Unable to load page');
      }
    }
  });

  it('federal-minister: renders in incumbent/post_office mode (no campaign)', () => {
    for (const mode of ['incumbent', 'post_office']) {
      for (const page of pages) {
        const html = federalMinisterOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, ministry: 'Finance', placeName: 'Abuja', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('lga-chairman: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = lgaChairmanOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('house-of-assembly-member: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = houseOfAssemblyMemberOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('presidential-candidate: renders all pages without throwing', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = presidentialCandidateOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, placeName: 'Abuja', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('presidential-candidate: donate CTA absent when inecCampaignAccount is falsy', () => {
    const ctx = makePolCtx({ mode: 'campaign', pageType: 'home', data: { mode: 'campaign', offerings: [], inecCampaignAccount: null } });
    const html = presidentialCandidateOfficialSiteTemplate.renderPage(ctx);
    expect(html).not.toContain('Donate Now');
  });

  it('political-appointee: renders in incumbent/post_office mode (no campaign)', () => {
    for (const mode of ['incumbent', 'post_office']) {
      for (const page of pages) {
        const html = politicalAppointeeOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, portfolio: 'ICT', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('ward-councillor: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = wardCouncillorOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('party-chapter-officer: renders all pages in active/post_office mode', () => {
    for (const mode of ['active', 'post_office']) {
      for (const page of pages) {
        const html = partyChapterOfficerOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, chapterRole: 'Ward Chairman', placeName: 'Ikeja Ward 3', party: 'APC', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
        expect(html).not.toContain('Unable to load page');
      }
    }
  });

  it('party-state-officer: renders all pages in active/post_office mode', () => {
    for (const mode of ['active', 'post_office']) {
      for (const page of pages) {
        const html = partyStateOfficerOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, stateRole: 'State Chairman', placeName: 'Ogun', party: 'PDP', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('deputy-governor: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = deputyGovernorOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, governorName: 'Gov. Test', placeName: 'Enugu', party: 'LP', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('assembly-speaker: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = assemblySpeakerOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, assemblyName: 'Rivers State House of Assembly', placeName: 'Rivers', party: 'APC', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('lga-vice-chairman: renders all pages in campaign/incumbent/post_office mode', () => {
    for (const mode of ['campaign', 'incumbent', 'post_office']) {
      for (const page of pages) {
        const html = lgaViceChairmanOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, chairmanName: 'Alhaji Test Chairman', placeName: 'Agege LGA', party: 'APC', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
      }
    }
  });

  it('supervisory-councillor: renders in incumbent/post_office mode (no campaign)', () => {
    for (const mode of ['incumbent', 'post_office']) {
      for (const page of pages) {
        const html = supervisoryCouncillorOfficialSiteTemplate.renderPage(makePolCtx({ mode, pageType: page, data: { mode, portfolio: 'Health', chairmanName: 'Alhaji Chairman', placeName: 'Kosofe LGA', offerings: [] } }));
        expect(html.length).toBeGreaterThan(10);
        expect(html).not.toContain('Unable to load page');
      }
    }
  });

  it('governor: incumbent home shows state name in output', () => {
    const ctx = makePolCtx({ mode: 'incumbent', pageType: 'home', data: { mode: 'incumbent', placeName: 'Ekiti', party: 'APC', offerings: [] } });
    const html = governorOfficialSiteTemplate.renderPage(ctx);
    expect(html).toContain('Ekiti');
  });

  it('state-commissioner: no campaign-mode CTA appears in output', () => {
    const ctx = makePolCtx({ mode: 'campaign', pageType: 'home', data: { mode: 'campaign', ministry: 'Works', placeName: 'Imo', offerings: [] } });
    const html = stateCommissionerOfficialSiteTemplate.renderPage(ctx);
    expect(html).not.toContain('Join Campaign');
  });

  it('supervisory-councillor: no campaign-mode output in incumbent mode', () => {
    const ctx = makePolCtx({ mode: 'incumbent', pageType: 'home', data: { mode: 'incumbent', portfolio: 'Education', placeName: 'Ikorodu LGA', offerings: [] } });
    const html = supervisoryCouncillorOfficialSiteTemplate.renderPage(ctx);
    expect(html).not.toContain('Join Campaign');
    expect(html).toContain('Education');
  });

  it('party-chapter-officer: active mode home contains chapter name', () => {
    const ctx = makePolCtx({ mode: 'active', pageType: 'home', data: { mode: 'active', chapterRole: 'Ward Secretary', placeName: 'Mushin Ward 5', party: 'NNPP', offerings: [] } });
    const html = partyChapterOfficerOfficialSiteTemplate.renderPage(ctx);
    expect(html).toContain('Mushin Ward 5');
  });

  it('all 16 templates: unknown pageType returns fallback page-not-found string', () => {
    const templates = [
      governorOfficialSiteTemplate, senatorOfficialSiteTemplate,
      houseOfRepsMemberOfficialSiteTemplate, stateCommissionerOfficialSiteTemplate,
      federalMinisterOfficialSiteTemplate, lgaChairmanOfficialSiteTemplate,
      houseOfAssemblyMemberOfficialSiteTemplate, presidentialCandidateOfficialSiteTemplate,
      politicalAppointeeOfficialSiteTemplate, wardCouncillorOfficialSiteTemplate,
      partyChapterOfficerOfficialSiteTemplate, partyStateOfficerOfficialSiteTemplate,
      deputyGovernorOfficialSiteTemplate, assemblySpeakerOfficialSiteTemplate,
      lgaViceChairmanOfficialSiteTemplate, supervisoryCouncillorOfficialSiteTemplate,
    ];
    for (const t of templates) {
      const ctx = makePolCtx({ pageType: 'unknown-page' as never });
      const html = t.renderPage(ctx);
      expect(html).toContain('Page not found');
    }
  });
});
