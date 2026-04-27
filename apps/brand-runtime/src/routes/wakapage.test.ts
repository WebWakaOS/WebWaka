/* eslint-disable @typescript-eslint/require-await */
/**
 * WakaPage public renderer — integration test suite.
 * (Phase 2 — ADR-0041 D2)
 *
 * T30 — T45: WakaPage route contracts
 *
 * Test strategy:
 *  - Full Hono app mount (all middleware fires: tenantResolve, brandingEntitlement,
 *    whiteLabelDepth).
 *  - Mock D1 + KV environment via makeWakaEnv().
 *  - Request pattern: brandReq(path, slug) — Host: brand-{slug}.webwaka.com.
 *
 * Platform Invariants tested:
 *  T3 — tenant isolation (own tenantId from middleware, never from URL)
 *  P2 — Nigeria First (page shell rendered, mobile-first HTML)
 *  P9 — price_kobo shown as ₦ in offerings block
 *  NDPR — wakapage_leads INSERT path does not echo PII in response
 */

import { describe, it, expect } from 'vitest';
import app from '../index.js';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const ACME = {
  id: 'org_acme_001',
  slug: 'acme',
  name: 'Acme Nigeria Ltd',
  description: 'A test company in Nigeria.',
};

const PAGE: Record<string, unknown> = {
  id: 'wkp_page_001',
  tenant_id: ACME.id,
  workspace_id: 'ws_001',
  profile_id: 'prf_001',
  slug: 'acme-page',
  slug_source: 'derived_from_display_name',
  publication_state: 'published',
  title: 'Acme WakaPage',
  meta_description: 'Our official profile page.',
  og_image_url: null,
  analytics_enabled: 1,
  custom_theme_json: null,
  template_installation_id: null,
  published_at: 1700000000,
  created_at: 1700000000,
  updated_at: 1700000000,
};

const PROFILE: Record<string, unknown> = {
  id: 'prf_001',
  display_name: 'Acme Nigeria Ltd',
  avatar_url: null,
  headline: 'Quality services in Lagos',
  content: 'We are Acme Nigeria, a leading provider.',
  verification_state: 'verified',
  claim_status: 'verified',
};

const BLOCK_HERO: Record<string, unknown> = {
  id: 'blk_001',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'hero',
  sort_order: 0,
  is_visible: 1,
  config_json: JSON.stringify({ tagline: 'Quality you can trust' }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_BIO: Record<string, unknown> = {
  id: 'blk_002',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'bio',
  sort_order: 1,
  is_visible: 1,
  config_json: JSON.stringify({ body: 'We are a trusted Nigerian business.' }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_SOCIAL: Record<string, unknown> = {
  id: 'blk_003',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'social_links',
  sort_order: 2,
  is_visible: 1,
  config_json: JSON.stringify({
    links: [{ platform: 'whatsapp', url: 'https://wa.me/2348012345678', label: 'Chat us' }],
    style: 'buttons',
  }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_CTA: Record<string, unknown> = {
  id: 'blk_004',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'cta_button',
  sort_order: 3,
  is_visible: 1,
  config_json: JSON.stringify({ label: 'Book Now', url: 'https://wa.me/2348012345678', variant: 'primary' }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_CONTACT: Record<string, unknown> = {
  id: 'blk_005',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'contact_form',
  sort_order: 4,
  is_visible: 1,
  config_json: JSON.stringify({ heading: 'Send us a message', fields: ['name', 'phone', 'message'] }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_OFFERINGS: Record<string, unknown> = {
  id: 'blk_006',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'offerings',
  sort_order: 5,
  is_visible: 1,
  config_json: JSON.stringify({ heading: 'Services', maxItems: 6 }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const BLOCK_FAQ: Record<string, unknown> = {
  id: 'blk_007',
  tenant_id: ACME.id,
  page_id: 'wkp_page_001',
  block_type: 'faq',
  sort_order: 6,
  is_visible: 1,
  config_json: JSON.stringify({ items: [{ question: 'Do you deliver?', answer: 'Yes, nationwide.' }] }),
  created_at: 1700000000,
  updated_at: 1700000000,
};

const SAMPLE_OFFERINGS = [
  { id: 'off_001', name: 'Premium Wash', description: 'Full car wash', price_kobo: 500000 },
];

const SAMPLE_BLOG_POSTS = [
  {
    id: 'post_001',
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'First post',
    cover_image_url: null,
    published_at: 1700000000,
    author_name: 'Jane Doe',
  },
];

// ---------------------------------------------------------------------------
// Mock DB builder — extends the existing makeDB pattern for wakapage tables
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

interface WakaMockOpts {
  org?: { id: string; slug: string; name: string; description?: string } | null;
  primaryColor?: string | null;
  subscription?: { plan: string; status: string } | null;
  page?: Row | null;
  blocks?: Row[];
  profile?: Row | null;
  offerings?: Row[];
  blogPosts?: Row[];
  wakaPageLeadsInsertFail?: boolean;
}

function makeWakaDB(opts: WakaMockOpts = {}): D1Database {
  const {
    org = null,
    primaryColor = '#1a6b3a',
    subscription = { plan: 'starter', status: 'active' },
    page = null,
    blocks = [],
    profile = null,
    offerings = [],
    blogPosts = [],
    wakaPageLeadsInsertFail = false,
  } = opts;

  function bindResult(sql: string) {
    const lo = sql.toLowerCase();
    return {
      all: async <T>(): Promise<{ results: T[] }> => {
        if (lo.includes('wakapage_blocks')) return { results: blocks as T[] };
        if (lo.includes('blog_posts')) return { results: blogPosts as T[] };
        if (lo.includes('offerings')) return { results: offerings as T[] };
        return { results: [] as T[] };
      },
      first: async <T>(): Promise<T | null> => {
        // getBrandTokens — tenantId/tenantSlug aliases
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

        // Custom domain lookup
        if (lo.includes('custom_domain') && lo.includes('join')) return null;

        // sub_partners / partner_entitlements (ENT-004)
        if (lo.includes('sub_partners')) return null;
        if (lo.includes('partner_entitlements')) return null;

        // manifest
        if (lo.includes('business_name')) {
          if (!org) return null;
          return { business_name: org.name, primary_color: primaryColor ?? null, logo_url: null } as T;
        }

        // tenantResolve
        if (lo.includes('from organizations') && lo.includes('slug')) {
          if (!org) return null;
          return { id: org.id, name: org.name } as T;
        }

        // Theme color hint
        if (lo.includes('primary_color') && lo.includes('tenant_branding')) {
          return primaryColor ? { primary_color: primaryColor } as T : null;
        }

        // Entitlement gate
        if (lo.includes('workspaces') || lo.includes('subscription_plan')) {
          if (!subscription) return null;
          return { subscription_plan: subscription.plan, subscription_status: subscription.status } as T;
        }

        // fetchProfile in branded-page (JOIN entity_profiles)
        if (lo.includes('entity_profiles') || lo.includes('ep.phone')) {
          return {
            description: org?.description ?? null,
            phone: null,
            email: null,
            website: null,
            place_name: 'Lagos',
            category: 'Services',
          } as T;
        }

        // WakaPage: published page lookup
        if (lo.includes('wakapage_pages') && !lo.includes('and id')) {
          return (page ?? null) as T | null;
        }

        // wakapage_leads: verify page belongs to tenant
        if (lo.includes('wakapage_pages') && lo.includes('and id')) {
          if (page && lo.includes(String(page['id'] ?? '').toLowerCase().slice(0, 4))) {
            return { id: page['id'] } as T;
          }
          return null;
        }

        // WakaPage: profile lookup (display_name, headline, verification_state)
        if (lo.includes('from profiles') && lo.includes('headline')) {
          return (profile ?? null) as T | null;
        }

        // tenant_branding social_links_json
        if (lo.includes('social_links_json')) {
          return { social_links_json: null } as T;
        }

        // blog_posts single lookup
        if (lo.includes('blog_posts') && lo.includes('limit 1')) {
          if (blogPosts.length > 0) return blogPosts[0] as T;
          return null;
        }

        // shop offering single lookup
        if (lo.includes('offerings') && lo.includes('and id')) {
          if (offerings.length > 0) return offerings[0] as T;
          return null;
        }

        return null;
      },
      run: async () => {
        if (wakaPageLeadsInsertFail && lo.includes('wakapage_leads')) {
          throw new Error('DB write failure');
        }
        return { success: true, meta: {} as D1Meta };
      },
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

function makeWakaEnv(opts: WakaMockOpts = {}): Env {
  return {
    DB: makeWakaDB(opts),
    THEME_CACHE: stubKV,
    CART_KV: stubKV,
    JWT_SECRET: 'test-jwt-secret-min-32-chars-pad!!',
    LOG_PII_SALT: 'test-pii-salt-min-32-chars-padding!',
    INTER_SERVICE_SECRET: 'inter-service-test-secret-minimum32c',
    ENVIRONMENT: 'development',
  };
}

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

// ---------------------------------------------------------------------------
// T30 — GET /wakapage — no published page → 404
// ---------------------------------------------------------------------------

describe('T30: GET /wakapage — no published page returns 404', () => {
  it('returns 404 when tenant has no published WakaPage', async () => {
    const env = makeWakaEnv({ org: ACME, page: null });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    expect(res.status).toBe(404);
  });

  it('returns 404 when tenant does not exist', async () => {
    const env = makeWakaEnv({ org: null });
    const res = await app.request(brandReq('/wakapage', 'ghost'), {}, env);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// T31 — GET /wakapage — happy path
// ---------------------------------------------------------------------------

describe('T31: GET /wakapage — renders published WakaPage', () => {
  it('returns 200 with DOCTYPE html', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('renders display name in page header', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Acme Nigeria Ltd');
  });

  it('sets page title from page.title field', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Acme WakaPage');
  });

  it('includes schema.org JSON-LD', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('application/ld+json');
    expect(html).toContain('schema.org');
  });

  it('includes canonical link tag', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('rel="canonical"');
  });

  it('includes Open Graph meta tags', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
  });

  it('includes PWA manifest link', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('manifest.json');
  });

  it('includes WebWaka attribution in footer', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('webwaka.com');
  });

  it('injects CSS custom properties from brand theme', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, primaryColor: '#2d6a4f' });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('--ww-primary');
    expect(html).toContain('#2d6a4f');
  });
});

// ---------------------------------------------------------------------------
// T32 — ENT-003: branding entitlement gate applies to /wakapage
// ---------------------------------------------------------------------------

describe('T32: ENT-003 branding entitlement gate on /wakapage', () => {
  it('returns non-200 when tenant has no active subscription', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, subscription: null });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    expect(res.status).not.toBe(200);
    const html = await res.text();
    expect(html).toContain('Branding Not Activated');
  });

  it('serves page when tenant has active starter subscription', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, subscription: { plan: 'starter', status: 'active' } });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// T33 — Block rendering: hero block
// ---------------------------------------------------------------------------

describe('T33: hero block renders correctly', () => {
  it('renders hero tagline from block config', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_HERO], profile: PROFILE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Quality you can trust');
  });

  it('renders display name in hero', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_HERO], profile: PROFILE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Acme Nigeria Ltd');
  });
});

// ---------------------------------------------------------------------------
// T34 — Block rendering: bio block
// ---------------------------------------------------------------------------

describe('T34: bio block renders correctly', () => {
  it('renders bio body text', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_BIO] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('We are a trusted Nigerian business.');
  });
});

// ---------------------------------------------------------------------------
// T35 — Block rendering: social_links block
// ---------------------------------------------------------------------------

describe('T35: social_links block renders correctly', () => {
  it('renders WhatsApp link', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_SOCIAL] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('wa.me');
    expect(html).toContain('Chat us');
  });
});

// ---------------------------------------------------------------------------
// T36 — Block rendering: cta_button block
// ---------------------------------------------------------------------------

describe('T36: cta_button block renders correctly', () => {
  it('renders CTA button with label and href', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_CTA] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Book Now');
    expect(html).toContain('wa.me');
  });
});

// ---------------------------------------------------------------------------
// T37 — Block rendering: contact_form block
// ---------------------------------------------------------------------------

describe('T37: contact_form block renders correctly', () => {
  it('renders form that POSTs to /wakapage/leads', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_CONTACT] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('/wakapage/leads');
    expect(html).toContain('<form');
    expect(html).toContain('Send us a message');
  });

  it('includes page_id as hidden field', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_CONTACT] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('page_id');
    expect(html).toContain(String(PAGE['id']));
  });
});

// ---------------------------------------------------------------------------
// T38 — Block rendering: offerings block (P9 kobo→naira)
// ---------------------------------------------------------------------------

describe('T38: offerings block renders with P9 kobo→naira price conversion', () => {
  it('renders offering names and ₦ prices', async () => {
    const env = makeWakaEnv({
      org: ACME,
      page: PAGE,
      blocks: [BLOCK_OFFERINGS],
      offerings: SAMPLE_OFFERINGS,
    });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Premium Wash');
    expect(html).toContain('5,000.00');
    expect(html).toContain('₦');
  });

  it('renders nothing when no offerings (silent empty)', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_OFFERINGS], offerings: [] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).not.toContain('Services</h2>');
  });
});

// ---------------------------------------------------------------------------
// T39 — Block rendering: faq block
// ---------------------------------------------------------------------------

describe('T39: faq block renders accordion', () => {
  it('renders FAQ question and answer', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [BLOCK_FAQ] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Do you deliver?');
    expect(html).toContain('Yes, nationwide.');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });
});

// ---------------------------------------------------------------------------
// T40 — Block rendering: blog_post block
// ---------------------------------------------------------------------------

describe('T40: blog_post block renders latest posts', () => {
  it('renders blog post titles and dates', async () => {
    const env = makeWakaEnv({
      org: ACME,
      page: PAGE,
      blocks: [{
        ...BLOCK_HERO,
        id: 'blk_blog',
        block_type: 'blog_post',
        config_json: JSON.stringify({ heading: 'From the Blog', maxPosts: 3 }),
      }],
      blogPosts: SAMPLE_BLOG_POSTS,
    });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Hello World');
    expect(html).toContain('From the Blog');
  });
});

// ---------------------------------------------------------------------------
// T41 — All 17 block types render without crash
// ---------------------------------------------------------------------------

describe('T41: all 17 MVP block types render without crash', () => {
  const ALL_BLOCK_TYPES = [
    { block_type: 'hero', config: { tagline: 'Test' } },
    { block_type: 'bio', config: { body: 'Test body' } },
    { block_type: 'offerings', config: { heading: 'Services' } },
    { block_type: 'contact_form', config: { fields: ['name', 'phone', 'message'] } },
    { block_type: 'social_links', config: { links: [{ platform: 'whatsapp', url: 'https://wa.me/234' }] } },
    { block_type: 'gallery', config: { images: [{ url: 'https://example.com/img.jpg', alt: 'Test' }] } },
    { block_type: 'cta_button', config: { label: 'Click', url: 'https://example.com' } },
    { block_type: 'map', config: { lat: 6.5244, lng: 3.3792 } },
    { block_type: 'testimonials', config: { items: [{ name: 'Ada', text: 'Great!' }] } },
    { block_type: 'faq', config: { items: [{ question: 'Q?', answer: 'A.' }] } },
    { block_type: 'countdown', config: { targetDate: '2030-01-01T00:00:00Z' } },
    { block_type: 'media_kit', config: { files: [{ label: 'Press Kit', url: 'https://example.com/kit.pdf', fileType: 'pdf' }] } },
    { block_type: 'trust_badges', config: { showVerificationBadge: true, showClaimBadge: true } },
    { block_type: 'social_feed', config: {} },
    { block_type: 'blog_post', config: { heading: 'Posts', maxPosts: 2 } },
    { block_type: 'community', config: { joinCta: 'Join us' } },
    { block_type: 'event_list', config: { heading: 'Events' } },
  ];

  it('renders all 17 block types and returns 200', async () => {
    const blocks = ALL_BLOCK_TYPES.map((bt, idx) => ({
      id: `blk_all_${idx}`,
      tenant_id: ACME.id,
      page_id: 'wkp_page_001',
      block_type: bt.block_type,
      sort_order: idx,
      is_visible: 1,
      config_json: JSON.stringify(bt.config),
      created_at: 1700000000,
      updated_at: 1700000000,
    }));

    const env = makeWakaEnv({
      org: ACME,
      page: PAGE,
      blocks,
      profile: PROFILE,
      offerings: SAMPLE_OFFERINGS,
      blogPosts: SAMPLE_BLOG_POSTS,
    });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
  });
});

// ---------------------------------------------------------------------------
// T42 — is_visible=0 blocks are not rendered
// ---------------------------------------------------------------------------

describe('T42: is_visible=0 blocks are excluded from rendered output', () => {
  it('does not render hidden block content', async () => {
    const hiddenBlock = {
      ...BLOCK_BIO,
      id: 'blk_hidden',
      is_visible: 0,
      config_json: JSON.stringify({ body: 'HIDDEN_CONTENT_SHOULD_NOT_APPEAR' }),
    };
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [hiddenBlock] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).not.toContain('HIDDEN_CONTENT_SHOULD_NOT_APPEAR');
  });
});

// ---------------------------------------------------------------------------
// T43 — POST /wakapage/leads — lead capture
// ---------------------------------------------------------------------------

describe('T43: POST /wakapage/leads — lead capture', () => {
  it('accepts valid JSON lead and returns { ok: true }', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(
      brandReq('/wakapage/leads', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          page_id: String(PAGE['id']),
          name: 'Chidi Okeke',
          phone: '+2348012345678',
          message: 'Hello',
        }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json<{ ok: boolean }>();
    expect(body.ok).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(
      brandReq('/wakapage/leads', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page_id: String(PAGE['id']), name: 'Ada' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when page_id is missing', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(
      brandReq('/wakapage/leads', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Ada', phone: '+234', message: 'Hi' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when no tenant resolved', async () => {
    const env = makeWakaEnv({ org: null });
    const res = await app.request(
      new Request('http://brand-ghost.webwaka.com/wakapage/leads', {
        method: 'POST',
        headers: { host: 'brand-ghost.webwaka.com', 'content-type': 'application/json' },
        body: JSON.stringify({ page_id: 'wkp_page_001', name: 'X', phone: '+234', message: 'Hi' }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(404);
  });

  it('does not echo PII in success response (NDPR)', async () => {
    const env = makeWakaEnv({ org: ACME, page: PAGE });
    const res = await app.request(
      brandReq('/wakapage/leads', 'acme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          page_id: String(PAGE['id']),
          name: 'Chidi Okeke',
          phone: '+2348012345678',
          message: 'Sensitive message content',
        }),
      }),
      {},
      env,
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain('Chidi Okeke');
    expect(text).not.toContain('+2348012345678');
    expect(text).not.toContain('Sensitive message content');
  });
});

// ---------------------------------------------------------------------------
// T44 — trust_badges: verified profile shows badge
// ---------------------------------------------------------------------------

describe('T44: trust_badges block shows verified badge for verified profile', () => {
  it('renders verified badge when profile.verification_state = verified', async () => {
    const block = {
      id: 'blk_badges',
      tenant_id: ACME.id,
      page_id: 'wkp_page_001',
      block_type: 'trust_badges',
      sort_order: 0,
      is_visible: 1,
      config_json: JSON.stringify({ showVerificationBadge: true }),
      created_at: 1700000000,
      updated_at: 1700000000,
    };
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [block], profile: PROFILE });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Verified Business');
  });
});

// ---------------------------------------------------------------------------
// T45 — countdown block renders timer scaffold
// ---------------------------------------------------------------------------

describe('T45: countdown block renders JS-powered timer', () => {
  it('renders countdown units for a future date', async () => {
    const block = {
      id: 'blk_countdown',
      tenant_id: ACME.id,
      page_id: 'wkp_page_001',
      block_type: 'countdown',
      sort_order: 0,
      is_visible: 1,
      config_json: JSON.stringify({ heading: 'Launch in', targetDate: '2030-01-01T00:00:00Z' }),
      created_at: 1700000000,
      updated_at: 1700000000,
    };
    const env = makeWakaEnv({ org: ACME, page: PAGE, blocks: [block] });
    const res = await app.request(brandReq('/wakapage', 'acme'), {}, env);
    const html = await res.text();
    expect(html).toContain('Launch in');
    expect(html).toContain('Days');
    expect(html).toContain('Hours');
  });
});
