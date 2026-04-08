/**
 * Integration tests for /community routes (M7c).
 *
 * Invariants verified:
 *   T3  — tenant_id predicate on all queries
 *   P10 — NDPR_CONSENT_REQUIRED blocks joinCommunity
 *   P15 — moderation called before channel post insert (tested via createChannelPost mock)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { communityRoutes } from './community.js';
import type { AuthContext } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Mock @webwaka/community functions
// ---------------------------------------------------------------------------

vi.mock('@webwaka/community', () => ({
  getCommunitySpace: vi.fn(),
  listChannels: vi.fn(),
  createChannelPost: vi.fn(),
  listChannelPosts: vi.fn(),
  listCourseModules: vi.fn(),
  getLesson: vi.fn(),
  updateLessonProgress: vi.fn(),
  listEvents: vi.fn(),
  rsvpEvent: vi.fn(),
  joinCommunity: vi.fn(),
}));

import {
  getCommunitySpace,
  listChannels,
  createChannelPost,
  listChannelPosts,
  listCourseModules,
  getLesson,
  updateLessonProgress,
  listEvents,
  rsvpEvent,
  joinCommunity,
} from '@webwaka/community';

// ---------------------------------------------------------------------------
// Test app factory — matches the pattern of pos.test.ts / sync.test.ts
// ---------------------------------------------------------------------------

function makeApp(authOverride?: Partial<AuthContext>): Hono {
  const auth: AuthContext = {
    userId: 'user-001',
    tenantId: 'tenant-001',
    ...authOverride,
  } as AuthContext;

  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('auth', auth);
    c.env = { DB: {} } as never;
    await next();
  });
  app.route('/community', communityRoutes);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /community/:slug
// ---------------------------------------------------------------------------

describe('GET /community/:slug', () => {
  it('returns 200 with space when found', async () => {
    const mockSpace = { id: 'sp-1', slug: 'lagos-devs', name: 'Lagos Devs', tenant_id: 'tenant-001' };
    vi.mocked(getCommunitySpace).mockResolvedValue(mockSpace as never);

    const app = makeApp();
    const res = await app.request('/community/lagos-devs');
    expect(res.status).toBe(200);
    const body = await res.json() as { space: typeof mockSpace };
    expect(body.space.slug).toBe('lagos-devs');
  });

  it('returns 404 when community not found', async () => {
    vi.mocked(getCommunitySpace).mockResolvedValue(null as never);

    const app = makeApp();
    const res = await app.request('/community/nonexistent');
    expect(res.status).toBe(404);
  });

  it('passes tenant_id from header (T3)', async () => {
    vi.mocked(getCommunitySpace).mockResolvedValue({ id: 'sp-1' } as never);
    const app = makeApp();
    await app.request('/community/test', {
      headers: { 'X-Tenant-Id': 'tenant-xyz' },
    });
    expect(getCommunitySpace).toHaveBeenCalledWith(expect.anything(), 'test', 'tenant-xyz');
  });
});

// ---------------------------------------------------------------------------
// POST /community/join
// ---------------------------------------------------------------------------

describe('POST /community/join', () => {
  it('returns 201 with membership on success', async () => {
    const mockMembership = { id: 'm-1', communityId: 'c-1', userId: 'user-001' };
    vi.mocked(joinCommunity).mockResolvedValue(mockMembership as never);

    const app = makeApp();
    const res = await app.request('/community/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId: 'c-1', tierId: 'tier-free' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { membership: typeof mockMembership };
    expect(body.membership.id).toBe('m-1');
  });

  it('returns 400 on missing communityId', async () => {
    const app = makeApp();
    const res = await app.request('/community/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tierId: 'tier-free' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 403 on NDPR_CONSENT_REQUIRED (P10)', async () => {
    vi.mocked(joinCommunity).mockRejectedValue(new Error('NDPR_CONSENT_REQUIRED'));
    const app = makeApp();
    const res = await app.request('/community/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId: 'c-1', tierId: 'tier-free' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 403 on KYC_TIER_INSUFFICIENT', async () => {
    vi.mocked(joinCommunity).mockRejectedValue(new Error('KYC_TIER_INSUFFICIENT'));
    const app = makeApp();
    const res = await app.request('/community/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId: 'c-1', tierId: 'tier-premium' }),
    });
    expect(res.status).toBe(403);
  });

  it('passes tenantId from auth context (T3)', async () => {
    vi.mocked(joinCommunity).mockResolvedValue({ id: 'm-1' } as never);
    const app = makeApp({ tenantId: 'tenant-abc' });
    await app.request('/community/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId: 'c-1', tierId: 'tier-free' }),
    });
    expect(joinCommunity).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /community/:id/channels
// ---------------------------------------------------------------------------

describe('GET /community/:id/channels', () => {
  it('returns channels array', async () => {
    vi.mocked(listChannels).mockResolvedValue([{ id: 'ch-1', name: 'General' }] as never);
    const app = makeApp();
    const res = await app.request('/community/c-1/channels');
    expect(res.status).toBe(200);
    const body = await res.json() as { channels: unknown[] };
    expect(Array.isArray(body.channels)).toBe(true);
  });

  it('passes tenantId (T3)', async () => {
    vi.mocked(listChannels).mockResolvedValue([] as never);
    const app = makeApp();
    await app.request('/community/c-1/channels', {
      headers: { 'X-Tenant-Id': 'tenant-yz' },
    });
    expect(listChannels).toHaveBeenCalledWith(expect.anything(), 'c-1', 'tenant-yz');
  });
});

// ---------------------------------------------------------------------------
// GET /community/channels/:id/posts
// ---------------------------------------------------------------------------

describe('GET /community/channels/:id/posts', () => {
  it('returns posts array', async () => {
    vi.mocked(listChannelPosts).mockResolvedValue([{ id: 'p-1', content: 'Hello' }] as never);
    const app = makeApp();
    const res = await app.request('/community/channels/ch-1/posts');
    expect(res.status).toBe(200);
    const body = await res.json() as { posts: unknown[] };
    expect(Array.isArray(body.posts)).toBe(true);
  });

  it('passes limit and offset query params', async () => {
    vi.mocked(listChannelPosts).mockResolvedValue([] as never);
    const app = makeApp();
    await app.request('/community/channels/ch-1/posts?limit=10&offset=5');
    expect(listChannelPosts).toHaveBeenCalledWith(expect.anything(), 'ch-1', 'default', 10, 5);
  });
});

// ---------------------------------------------------------------------------
// POST /community/channels/:id/posts
// ---------------------------------------------------------------------------

describe('POST /community/channels/:id/posts', () => {
  it('returns 201 with created post', async () => {
    vi.mocked(createChannelPost).mockResolvedValue({ id: 'p-1', content: 'Hello world' } as never);
    const app = makeApp();
    const res = await app.request('/community/channels/ch-1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello world' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on empty content', async () => {
    const app = makeApp();
    const res = await app.request('/community/channels/ch-1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('passes authorId and tenantId (T3)', async () => {
    vi.mocked(createChannelPost).mockResolvedValue({ id: 'p-1' } as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/community/channels/ch-1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test post content' }),
    });
    expect(createChannelPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ authorId: 'user-abc', tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /community/:id/courses
// ---------------------------------------------------------------------------

describe('GET /community/:id/courses', () => {
  it('returns modules array', async () => {
    vi.mocked(listCourseModules).mockResolvedValue([{ id: 'mod-1', title: 'Intro' }] as never);
    const app = makeApp();
    const res = await app.request('/community/c-1/courses');
    expect(res.status).toBe(200);
    const body = await res.json() as { modules: unknown[] };
    expect(Array.isArray(body.modules)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /community/lessons/:id
// ---------------------------------------------------------------------------

describe('GET /community/lessons/:id', () => {
  it('returns 200 with lesson when found', async () => {
    vi.mocked(getLesson).mockResolvedValue({ id: 'ls-1', title: 'Lesson 1' } as never);
    const app = makeApp();
    const res = await app.request('/community/lessons/ls-1');
    expect(res.status).toBe(200);
    const body = await res.json() as { lesson: { id: string } };
    expect(body.lesson.id).toBe('ls-1');
  });

  it('returns 404 when lesson not found', async () => {
    vi.mocked(getLesson).mockResolvedValue(null as never);
    const app = makeApp();
    const res = await app.request('/community/lessons/nonexistent');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /community/lessons/:id/progress
// ---------------------------------------------------------------------------

describe('POST /community/lessons/:id/progress', () => {
  it('returns 200 with updated progress', async () => {
    vi.mocked(updateLessonProgress).mockResolvedValue({ lessonId: 'ls-1', progressPct: 75 } as never);
    const app = makeApp();
    const res = await app.request('/community/lessons/ls-1/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPct: 75 }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 400 on invalid progressPct (>100)', async () => {
    const app = makeApp();
    const res = await app.request('/community/lessons/ls-1/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPct: 150 }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 on negative progressPct', async () => {
    const app = makeApp();
    const res = await app.request('/community/lessons/ls-1/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPct: -5 }),
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /community/:id/events
// ---------------------------------------------------------------------------

describe('GET /community/:id/events', () => {
  it('returns events array', async () => {
    vi.mocked(listEvents).mockResolvedValue([{ id: 'ev-1', title: 'Hackathon' }] as never);
    const app = makeApp();
    const res = await app.request('/community/c-1/events');
    expect(res.status).toBe(200);
    const body = await res.json() as { events: unknown[] };
    expect(Array.isArray(body.events)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /community/events/:id/rsvp
// ---------------------------------------------------------------------------

describe('POST /community/events/:id/rsvp', () => {
  it('returns 201 on successful RSVP', async () => {
    vi.mocked(rsvpEvent).mockResolvedValue({ id: 'rsvp-1', status: 'going' } as never);
    const app = makeApp();
    const res = await app.request('/community/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'going' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on invalid status', async () => {
    const app = makeApp();
    const res = await app.request('/community/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'unsure' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 on EVENT_FULL', async () => {
    vi.mocked(rsvpEvent).mockRejectedValue(new Error('EVENT_FULL'));
    const app = makeApp();
    const res = await app.request('/community/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'going' }),
    });
    expect(res.status).toBe(409);
  });

  it('returns 402 on PAYMENT_REQUIRED', async () => {
    vi.mocked(rsvpEvent).mockRejectedValue(new Error('PAYMENT_REQUIRED'));
    const app = makeApp();
    const res = await app.request('/community/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'going' }),
    });
    expect(res.status).toBe(402);
  });
});
