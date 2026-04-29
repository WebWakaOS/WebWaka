/**
 * WakaPage route tests — Phase 1 (ADR-0041)
 *
 * Invariants under test:
 *   T3  — tenant_id and workspace_id from JWT auth; no cross-tenant access
 *   SEC — auth required on every route; admin/super_admin required for writes
 *   ENT — WakaPage entitlement guard (wakaPagePublicPage boolean) on create + publish
 *   MVP — one page per workspace (409 on second create)
 *   PUB — publish updates publication_state + emits event (non-fatal queue)
 *
 * Phase 1 — WakaPage entities, API contracts, event instrumentation.
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { wakaPageRoutes } from './wakapage.js';

// ---------------------------------------------------------------------------
// State and mock helpers
// ---------------------------------------------------------------------------

interface DBState {
  pages: Record<string, Record<string, unknown>>;
  blocks: Record<string, Record<string, unknown>>;
  workspaces: Record<string, Record<string, unknown>>;
  profiles: Record<string, Record<string, unknown>>;
}

function makeMockDB(state: DBState) {
  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const sqlLower = sql.toLowerCase();
      const stmt = {
        _binds: [] as unknown[],
        bind(...args: unknown[]) {
          stmt._binds = args;
          return stmt;
        },
        async run() {
          if (sqlLower.includes('insert into wakapage_pages')) {
            const binds = stmt._binds as [string, string, string, string, string, string, string, string];
            const [id, tenantId, workspaceId, profileId, slugVal, slugSrc, title, metaDesc] = binds;
            state.pages[id] = {
              id, tenant_id: tenantId, workspace_id: workspaceId, profile_id: profileId,
              slug: slugVal, slug_source: slugSrc, publication_state: 'draft',
              title: title ?? null, meta_description: metaDesc ?? null,
              analytics_enabled: 1, published_at: null, created_at: 1714214400, updated_at: 1714214400,
            };
            return { success: true };
          }
          if (sqlLower.includes('insert into wakapage_blocks')) {
            const [id, pageId, tenantId, blockType, sortOrder, isVisible, configJson] = stmt._binds;
            state.blocks[id as string] = {
              id, page_id: pageId, tenant_id: tenantId, block_type: blockType,
              sort_order: sortOrder, is_visible: isVisible, config_json: configJson,
              created_at: 1714214400, updated_at: 1714214400,
            };
            return { success: true };
          }
          if (sqlLower.includes('update wakapage_pages') && sqlLower.includes("'published'")) {
            const [publishedAt, pageId, tenantId] = stmt._binds;
            const pg = Object.values(state.pages).find(p => p['id'] === pageId && p['tenant_id'] === tenantId);
            if (pg) { pg['publication_state'] = 'published'; pg['published_at'] = publishedAt; }
            return { success: true };
          }
          if (sqlLower.includes('update wakapage_pages') || sqlLower.includes('update wakapage_blocks')) {
            return { success: true };
          }
          if (sqlLower.includes('delete from wakapage_blocks')) {
            const [blockId] = stmt._binds as [string, ...unknown[]];
            delete state.blocks[blockId];
            return { success: true };
          }
          if (sqlLower.includes('insert or replace into search_entries') || sqlLower.includes('update search_entries')) {
            return { success: true };
          }
          return { success: true };
        },
        async first<T>() {
          // 1. Workspace row lookup
          if (sqlLower.includes('from workspaces')) {
            const [wsId, tenantId] = stmt._binds as [string, string];
            return (state.workspaces[`${tenantId}:${wsId}`] ?? null) as T | null;
          }

          // 2. Publish join query — JOIN profiles present (must come before any from wakapage_pages check)
          if (sqlLower.includes('join profiles p') && sqlLower.includes('from wakapage_pages wp')) {
            const [id, tenantId, workspaceId] = stmt._binds as [string, string, string];
            const pg = Object.values(state.pages).find(
              p => p['id'] === id && p['tenant_id'] === tenantId && p['workspace_id'] === workspaceId
            );
            if (!pg) return null;
            return ({
              ...pg,
              subject_type: 'organization',
              subject_id: 'org-001',
              display_name: pg['display_name'] ?? 'Test Page',
              primary_place_id: null,
            }) as T;
          }

          // 3. Profile lookup — plain SELECT from profiles (not a JOIN)
          if (sqlLower.includes('from profiles') && sqlLower.includes('subject_type')) {
            const [profileId, tenantId] = stmt._binds as [string, string];
            const p = Object.values(state.profiles).find(pr => pr['id'] === profileId && pr['tenant_id'] === tenantId);
            return (p ?? null) as T | null;
          }

          // 4. Block lookup — JOIN wakapage_blocks wb JOIN wakapage_pages wp (PATCH/DELETE blocks)
          if (sqlLower.includes('from wakapage_blocks wb') && sqlLower.includes('join wakapage_pages wp')) {
            const [blockId, pageId, tenantId] = stmt._binds as [string, string, string];
            const blk = Object.values(state.blocks).find(
              b => b['id'] === blockId && b['page_id'] === pageId && b['tenant_id'] === tenantId
            );
            return (blk ?? null) as T | null;
          }

          // 5. Max sort order — COALESCE(MAX(sort_order)...)
          if (sqlLower.includes('max(sort_order)')) {
            const [pageId, tenantId] = stmt._binds as [string, string];
            const pgBlocks = Object.values(state.blocks).filter(b => b['page_id'] === pageId && b['tenant_id'] === tenantId);
            const maxOrder = pgBlocks.length === 0 ? -1 : Math.max(...pgBlocks.map(b => Number(b['sort_order'])));
            return { max_order: maxOrder } as T;
          }

          // 6. GET /:id — SELECT wp.* FROM wakapage_pages wp WHERE wp.id = ?
          //    Distinguishing feature: uses aliased columns "wp.id", "wp.tenant_id" etc.
          if (sqlLower.includes('from wakapage_pages wp') && sqlLower.includes('where wp.id = ?')) {
            const [id, tenantId, workspaceId] = stmt._binds as [string, string, string];
            const pg = Object.values(state.pages).find(
              p => p['id'] === id && p['tenant_id'] === tenantId && p['workspace_id'] === workspaceId
            );
            return (pg ?? null) as T | null;
          }

          // 7. MVP one-per-workspace — WHERE tenant_id = ? AND workspace_id = ? (2 binds, no id)
          //    Slugs uniqueness — WHERE tenant_id = ? AND slug = ? (2 binds)
          if (sqlLower.includes('from wakapage_pages') && stmt._binds.length === 2) {
            const [first, second] = stmt._binds as [string, string];
            if (sqlLower.includes('and slug =') || sqlLower.includes("and slug=")) {
              // Slug uniqueness: binds are [tenantId, slug]
              const pg = Object.values(state.pages).find(p => p['tenant_id'] === first && p['slug'] === second);
              return (pg ?? null) as T | null;
            }
            // MVP workspace check: binds are [tenantId, workspaceId]
            const pg = Object.values(state.pages).find(p => p['tenant_id'] === first && p['workspace_id'] === second);
            return (pg ?? null) as T | null;
          }

          // 8. Slug uniqueness with id exclusion (PATCH slug change: WHERE tenant_id=? AND slug=? AND id!=?)
          if (sqlLower.includes('from wakapage_pages') && sqlLower.includes('and id != ?')) {
            const [tenantId, slugVal] = stmt._binds as [string, string, string];
            const pg = Object.values(state.pages).find(p => p['tenant_id'] === tenantId && p['slug'] === slugVal);
            return (pg ?? null) as T | null;
          }

          // 9. Page by ID — WHERE id = ? AND tenant_id = ? AND workspace_id = ? (3 binds)
          //    Used by: PATCH /:id, POST /:id/blocks (page existence check)
          if (sqlLower.includes('from wakapage_pages') && stmt._binds.length === 3) {
            const [id, tenantId, workspaceId] = stmt._binds as [string, string, string];
            const pg = Object.values(state.pages).find(
              p => p['id'] === id && p['tenant_id'] === tenantId && p['workspace_id'] === workspaceId
            );
            return (pg ? pg : null) as T | null;
          }

          return null;
        },
        async all<T>() {
          if (sqlLower.includes('from wakapage_blocks') && sqlLower.includes('order by')) {
            const [pageId, tenantId] = stmt._binds as string[];
            const blks = Object.values(state.blocks)
              .filter(b => b['page_id'] === pageId && b['tenant_id'] === tenantId)
              .sort((a, b) => Number(a['sort_order']) - Number(b['sort_order']));
            return { results: blks as T[] };
          }
          return { results: [] as T[] };
        },
      };
      return stmt;
    }),
  };
}

type MockAuth = {
  userId: string;
  tenantId: string;
  workspaceId: string;
  role: string;
  permissions?: string[];
};

function makeApp(opts: {
  auth?: MockAuth | null;
  dbState?: DBState;
  noQueue?: boolean;
} = {}) {
  const defaultState: DBState = {
    pages: {},
    blocks: {},
    workspaces: {
      'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' },
    },
    profiles: {
      'prof-1': {
        id: 'prof-1', tenant_id: 'tenant-a', subject_type: 'organization',
        subject_id: 'org-001', display_name: 'Ade Bakery', primary_place_id: null,
      },
    },
  };

  const state = opts.dbState ?? defaultState;
  const mockDB = makeMockDB(state);

  const mockQueue = opts.noQueue ? undefined : { send: vi.fn().mockResolvedValue(undefined) };

  const app = new Hono();

  app.use('*', async (c, next) => {
    if (opts.auth !== null) {
      const auth = opts.auth ?? {
        userId: 'usr-1', tenantId: 'tenant-a', workspaceId: 'ws-1',
        role: 'admin', permissions: [],
      };
      c.set('auth', auth as never);
    } else {
      c.set('auth', null as never);
    }
    // Inject mock env bindings — assign the full object (Hono pattern from analytics.test.ts)
    c.env = {
      DB: mockDB,
      ...(mockQueue !== undefined ? { NOTIFICATION_QUEUE: mockQueue } : {}),
    } as never;
    await next();
  });

  app.route('/wakapages', wakaPageRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /wakapages — create page
// ---------------------------------------------------------------------------

describe('POST /wakapages', () => {
  it('returns 401 when not authenticated', async () => {
    const app = makeApp({ auth: null });
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is member (not admin)', async () => {
    const app = makeApp({ auth: { userId: 'u1', tenantId: 'tenant-a', workspaceId: 'ws-1', role: 'member' } });
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 403 when plan has no WakaPage entitlement (free plan)', async () => {
    const state: DBState = {
      pages: {},
      blocks: {},
      workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'free' } },
      profiles: {
        'prof-1': { id: 'prof-1', tenant_id: 'tenant-a', subject_type: 'organization', subject_id: 'org-1', display_name: 'Test', primary_place_id: null },
      },
    };
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/WakaPage/i);
  });

  it('returns 400 when profile_id is missing', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when profile_id is not found in tenant', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'nonexistent' }),
    });
    expect(res.status).toBe(404);
  });

  it('creates a page and returns 201', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { page: Record<string, unknown> };
    expect(body.page.profileId).toBe('prof-1');
    expect(body.page.publicationState).toBe('draft');
    expect(typeof body.page.slug).toBe('string');
    expect(typeof body.page.id).toBe('string');
    expect(String(body.page.id).startsWith('wp_')).toBe(true);
  });

  it('derives slug from profile display_name', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { page: Record<string, unknown> };
    expect(body.page.slug).toBe('ade-bakery');
    expect(body.page.slugSource).toBe('derived_from_display_name');
  });

  it('accepts a custom slug from request body', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1', slug: 'my-custom-slug' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { page: Record<string, unknown> };
    expect(body.page.slug).toBe('my-custom-slug');
    expect(body.page.slugSource).toBe('custom');
  });

  it('returns 409 when a WakaPage already exists for this workspace (MVP one-per-workspace)', async () => {
    const state: DBState = {
      pages: {
        'wp-existing': {
          id: 'wp-existing', tenant_id: 'tenant-a', workspace_id: 'ws-1',
          profile_id: 'prof-1', slug: 'existing', slug_source: 'custom',
          publication_state: 'draft', analytics_enabled: 1,
          created_at: 1714214400, updated_at: 1714214400,
        },
      },
      blocks: {},
      workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
      profiles: {
        'prof-1': { id: 'prof-1', tenant_id: 'tenant-a', subject_type: 'organization', subject_id: 'org-1', display_name: 'Test', primary_place_id: null },
      },
    };
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: 'prof-1' }),
    });
    expect(res.status).toBe(409);
    const body = await res.json() as { existingPageId: string };
    expect(body.existingPageId).toBe('wp-existing');
  });
});

// ---------------------------------------------------------------------------
// GET /wakapages/:id
// ---------------------------------------------------------------------------

describe('GET /wakapages/:id', () => {
  it('returns 404 for unknown page', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages/wp-missing');
    expect(res.status).toBe(404);
  });

  it('returns page with empty blocks list when no blocks exist', async () => {
    const state: DBState = {
      pages: {
        'wp-abc': {
          id: 'wp-abc', tenant_id: 'tenant-a', workspace_id: 'ws-1',
          profile_id: 'prof-1', slug: 'ade-bakery', slug_source: 'derived_from_display_name',
          publication_state: 'draft', title: null, meta_description: null,
          og_image_url: null, analytics_enabled: 1, template_installation_id: null,
          custom_theme_json: null, published_at: null, scheduled_publish_at: null,
          created_at: 1714214400, updated_at: 1714214400,
        },
      },
      blocks: {},
      workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
      profiles: {},
    };
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages/wp-abc');
    expect(res.status).toBe(200);
    const body = await res.json() as { page: Record<string, unknown>; blocks: unknown[] };
    expect(body.page.id).toBe('wp-abc');
    expect(body.page.slug).toBe('ade-bakery');
    expect(body.page.publicationState).toBe('draft');
    expect(body.page.analyticsEnabled).toBe(true);
    expect(body.blocks).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// PATCH /wakapages/:id
// ---------------------------------------------------------------------------

describe('PATCH /wakapages/:id', () => {
  const stateWithPage = (): DBState => ({
    pages: {
      'wp-abc': {
        id: 'wp-abc', tenant_id: 'tenant-a', workspace_id: 'ws-1',
        profile_id: 'prof-1', slug: 'ade-bakery', slug_source: 'derived_from_display_name',
        publication_state: 'draft', analytics_enabled: 1,
        created_at: 1714214400, updated_at: 1714214400,
      },
    },
    blocks: {},
    workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
    profiles: {},
  });

  it('returns 404 for unknown page', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages/wp-missing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 when no valid fields provided', async () => {
    const app = makeApp({ dbState: stateWithPage() });
    const res = await app.request('/wakapages/wp-abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('updates title and returns 200', async () => {
    const app = makeApp({ dbState: stateWithPage() });
    const res = await app.request('/wakapages/wp-abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ade Bakery — Fresh Bread Daily' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean; pageId: string };
    expect(body.success).toBe(true);
    expect(body.pageId).toBe('wp-abc');
  });
});

// ---------------------------------------------------------------------------
// POST /wakapages/:id/blocks — add block
// ---------------------------------------------------------------------------

describe('POST /wakapages/:id/blocks', () => {
  const stateWithPage = (): DBState => ({
    pages: {
      'wp-abc': {
        id: 'wp-abc', tenant_id: 'tenant-a', workspace_id: 'ws-1',
        profile_id: 'prof-1', slug: 'ade-bakery', slug_source: 'custom',
        publication_state: 'draft', analytics_enabled: 1,
        created_at: 1714214400, updated_at: 1714214400,
      },
    },
    blocks: {},
    workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
    profiles: {},
  });

  it('returns 404 for unknown page', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages/wp-missing/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_type: 'hero' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 when block_type is absent', async () => {
    const app = makeApp({ dbState: stateWithPage() });
    const res = await app.request('/wakapages/wp-abc/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid block_type', async () => {
    const app = makeApp({ dbState: stateWithPage() });
    const res = await app.request('/wakapages/wp-abc/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_type: 'not_a_real_block' }),
    });
    expect(res.status).toBe(400);
  });

  it('creates a hero block and returns 201', async () => {
    const app = makeApp({ dbState: stateWithPage() });
    const res = await app.request('/wakapages/wp-abc/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        block_type: 'hero',
        config_json: { displayName: 'Ade Bakery', tagline: 'Fresh bread daily' },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { block: Record<string, unknown> };
    expect(body.block.blockType).toBe('hero');
    expect(body.block.pageId).toBe('wp-abc');
    expect(body.block.sortOrder).toBe(0);
    expect(body.block.isVisible).toBe(true);
    expect(String(body.block.id).startsWith('blk_')).toBe(true);
  });

  it('auto-increments sort_order for the second block', async () => {
    const state = stateWithPage();
    state.blocks['blk-existing'] = {
      id: 'blk-existing', page_id: 'wp-abc', tenant_id: 'tenant-a',
      block_type: 'hero', sort_order: 0, is_visible: 1, config_json: '{}',
      created_at: 1714214400, updated_at: 1714214400,
    };
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages/wp-abc/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block_type: 'bio' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { block: Record<string, unknown> };
    expect(body.block.sortOrder).toBe(1);
  });

  it('all 17 MVP block types are accepted', async () => {
    const MVP_TYPES = [
      'hero','bio','offerings','contact_form','social_links','gallery',
      'cta_button','map','testimonials','faq','countdown','media_kit',
      'trust_badges','social_feed','blog_post','community','event_list',
    ];
    for (const bt of MVP_TYPES) {
      const state = stateWithPage();
      const app = makeApp({ dbState: state });
      const res = await app.request('/wakapages/wp-abc/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_type: bt }),
      });
      expect(res.status, `block_type '${bt}' should be accepted`).toBe(201);
    }
  });
});

// ---------------------------------------------------------------------------
// DELETE /wakapages/:id/blocks/:blockId
// ---------------------------------------------------------------------------

describe('DELETE /wakapages/:id/blocks/:blockId', () => {
  const stateWithBlock = (): DBState => ({
    pages: {
      'wp-abc': {
        id: 'wp-abc', tenant_id: 'tenant-a', workspace_id: 'ws-1',
        profile_id: 'prof-1', slug: 'slug', slug_source: 'custom',
        publication_state: 'draft', analytics_enabled: 1,
        created_at: 1714214400, updated_at: 1714214400,
      },
    },
    blocks: {
      'blk-1': {
        id: 'blk-1', page_id: 'wp-abc', tenant_id: 'tenant-a',
        block_type: 'bio', sort_order: 0, is_visible: 1, config_json: '{}',
        created_at: 1714214400, updated_at: 1714214400,
      },
    },
    workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
    profiles: {},
  });

  it('returns 404 for unknown block', async () => {
    const app = makeApp({ dbState: stateWithBlock() });
    const res = await app.request('/wakapages/wp-abc/blocks/blk-missing', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });

  it('deletes block and returns 200', async () => {
    const app = makeApp({ dbState: stateWithBlock() });
    const res = await app.request('/wakapages/wp-abc/blocks/blk-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /wakapages/:id/publish — publish flow
// ---------------------------------------------------------------------------

describe('POST /wakapages/:id/publish', () => {
  const stateWithDraftPage = (): DBState => ({
    pages: {
      'wp-abc': {
        id: 'wp-abc', tenant_id: 'tenant-a', workspace_id: 'ws-1',
        profile_id: 'prof-1', slug: 'ade-bakery', slug_source: 'custom',
        publication_state: 'draft', analytics_enabled: 1,
        display_name: 'Ade Bakery',
        published_at: null, created_at: 1714214400, updated_at: 1714214400,
      },
    },
    blocks: {},
    workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
    profiles: {},
  });

  it('returns 404 for unknown page', async () => {
    const app = makeApp();
    const res = await app.request('/wakapages/wp-missing/publish', { method: 'POST' });
    expect(res.status).toBe(404);
  });

  it('publishes successfully and returns 200 with publishedAt', async () => {
    const app = makeApp({ dbState: stateWithDraftPage() });
    const res = await app.request('/wakapages/wp-abc/publish', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.publicationState).toBe('published');
    expect(typeof body.publishedAt).toBe('number');
    expect(body.slug).toBe('ade-bakery');
  });

  it('returns 403 when entitlement is denied on publish (free plan)', async () => {
    const state = stateWithDraftPage();
    state.workspaces = { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'free' } };
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages/wp-abc/publish', { method: 'POST' });
    expect(res.status).toBe(403);
  });

  it('does not fail when NOTIFICATION_QUEUE is absent (fire-and-forget)', async () => {
    const app = makeApp({ dbState: stateWithDraftPage(), noQueue: true });
    const res = await app.request('/wakapages/wp-abc/publish', { method: 'POST' });
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// T3 tenant isolation
// ---------------------------------------------------------------------------

describe('T3 tenant isolation', () => {
  it('GET /wakapages/:id returns 404 when page belongs to different workspace (T3)', async () => {
    const state: DBState = {
      pages: {
        'wp-other': {
          id: 'wp-other', tenant_id: 'tenant-a', workspace_id: 'ws-OTHER', // different ws
          profile_id: 'prof-1', slug: 'slug', slug_source: 'custom',
          publication_state: 'draft', analytics_enabled: 1,
          created_at: 1714214400, updated_at: 1714214400,
        },
      },
      blocks: {},
      workspaces: { 'tenant-a:ws-1': { subscription_status: 'active', subscription_plan: 'starter' } },
      profiles: {},
    };
    // Auth is workspace ws-1; page belongs to ws-OTHER — must return 404
    const app = makeApp({ dbState: state });
    const res = await app.request('/wakapages/wp-other');
    expect(res.status).toBe(404);
  });
});
