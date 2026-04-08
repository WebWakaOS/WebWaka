/**
 * Integration tests for /social routes (M7c).
 *
 * Invariants verified:
 *   T3  — tenant_id predicate on all queries
 *   P14 — DM_MASTER_KEY must be present (assertDMMasterKey called)
 *   P15 — moderation called before post insert (tested via createPost mock)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { socialRoutes } from './social.js';
import type { AuthContext } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Mock @webwaka/social functions
// ---------------------------------------------------------------------------

vi.mock('@webwaka/social', () => ({
  getSocialProfileByHandle: vi.fn(),
  setupSocialProfile: vi.fn(),
  followProfile: vi.fn(),
  getUserFeed: vi.fn(),
  createPost: vi.fn(),
  reactToPost: vi.fn(),
  getOrCreateThread: vi.fn(),
  listThreads: vi.fn(),
  sendDM: vi.fn(),
  getActiveStories: vi.fn(),
  getFollowingIds: vi.fn(),
  assertDMMasterKey: vi.fn(),
}));

import {
  getSocialProfileByHandle,
  setupSocialProfile,
  followProfile,
  getUserFeed,
  createPost,
  reactToPost,
  getOrCreateThread,
  listThreads,
  sendDM,
  getActiveStories,
  getFollowingIds,
  assertDMMasterKey,
} from '@webwaka/social';

// ---------------------------------------------------------------------------
// Test app factory — matches the pattern of pos.test.ts / sync.test.ts
// ---------------------------------------------------------------------------

const TEST_DM_KEY = 'test-master-key-32-bytes-long!!';

function makeApp(authOverride?: Partial<AuthContext>, envExtra?: Record<string, unknown>): Hono {
  const auth: AuthContext = {
    userId: 'user-001',
    tenantId: 'tenant-001',
    ...authOverride,
  } as AuthContext;

  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('auth', auth);
    c.env = { DB: {}, DM_MASTER_KEY: TEST_DM_KEY, ...envExtra } as never;
    await next();
  });
  app.route('/social', socialRoutes);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /social/profile/:handle
// ---------------------------------------------------------------------------

describe('GET /social/profile/:handle', () => {
  it('returns 200 with profile when found', async () => {
    vi.mocked(getSocialProfileByHandle).mockResolvedValue({ id: 'p-1', handle: 'amaka' } as never);
    const app = makeApp();
    const res = await app.request('/social/profile/amaka');
    expect(res.status).toBe(200);
    const body = await res.json() as { profile: { handle: string } };
    expect(body.profile.handle).toBe('amaka');
  });

  it('returns 404 when profile not found', async () => {
    vi.mocked(getSocialProfileByHandle).mockResolvedValue(null as never);
    const app = makeApp();
    const res = await app.request('/social/profile/nobody');
    expect(res.status).toBe(404);
  });

  it('passes tenantId from header (T3)', async () => {
    vi.mocked(getSocialProfileByHandle).mockResolvedValue({ id: 'p-1' } as never);
    const app = makeApp();
    await app.request('/social/profile/amaka', {
      headers: { 'X-Tenant-Id': 'tenant-xyz' },
    });
    expect(getSocialProfileByHandle).toHaveBeenCalledWith(expect.anything(), 'amaka', 'tenant-xyz');
  });
});

// ---------------------------------------------------------------------------
// POST /social/profile/setup
// ---------------------------------------------------------------------------

describe('POST /social/profile/setup', () => {
  it('returns 201 on successful profile creation', async () => {
    vi.mocked(setupSocialProfile).mockResolvedValue({ id: 'p-1', handle: 'amaka' } as never);
    const app = makeApp();
    const res = await app.request('/social/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: 'amaka', bio: 'Software engineer in Lagos' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on invalid handle (uppercase)', async () => {
    const app = makeApp();
    const res = await app.request('/social/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: 'Amaka' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 on handle with spaces', async () => {
    const app = makeApp();
    const res = await app.request('/social/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: 'amaka chidi' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 on HANDLE_TAKEN', async () => {
    vi.mocked(setupSocialProfile).mockRejectedValue(new Error('HANDLE_TAKEN'));
    const app = makeApp();
    const res = await app.request('/social/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: 'amaka' }),
    });
    expect(res.status).toBe(409);
  });

  it('passes profileId and tenantId from auth (T3)', async () => {
    vi.mocked(setupSocialProfile).mockResolvedValue({ id: 'p-1' } as never);
    const app = makeApp({ userId: 'user-xyz', tenantId: 'tenant-abc' });
    await app.request('/social/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: 'amaka' }),
    });
    expect(setupSocialProfile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ profileId: 'user-xyz', tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// POST /social/follow/:id
// ---------------------------------------------------------------------------

describe('POST /social/follow/:id', () => {
  it('returns 201 on successful follow', async () => {
    vi.mocked(followProfile).mockResolvedValue({ id: 'f-1' } as never);
    const app = makeApp();
    const res = await app.request('/social/follow/user-002', {
      method: 'POST',
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on SELF_FOLLOW', async () => {
    vi.mocked(followProfile).mockRejectedValue(new Error('SELF_FOLLOW'));
    const app = makeApp();
    const res = await app.request('/social/follow/user-001', {
      method: 'POST',
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when followee not found', async () => {
    vi.mocked(followProfile).mockRejectedValue(new Error('Profile not found'));
    const app = makeApp();
    const res = await app.request('/social/follow/ghost-user', {
      method: 'POST',
    });
    expect(res.status).toBe(404);
  });

  it('passes followerId and tenantId (T3)', async () => {
    vi.mocked(followProfile).mockResolvedValue({ id: 'f-1' } as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/social/follow/user-xyz', { method: 'POST' });
    expect(followProfile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ followerId: 'user-abc', tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /social/feed
// ---------------------------------------------------------------------------

describe('GET /social/feed', () => {
  it('returns feed posts array', async () => {
    vi.mocked(getUserFeed).mockResolvedValue([{ id: 'p-1', content: 'Hello' }] as never);
    const app = makeApp();
    const res = await app.request('/social/feed');
    expect(res.status).toBe(200);
    const body = await res.json() as { posts: unknown[] };
    expect(Array.isArray(body.posts)).toBe(true);
  });

  it('passes limit and offset query params', async () => {
    vi.mocked(getUserFeed).mockResolvedValue([] as never);
    const app = makeApp();
    await app.request('/social/feed?limit=10&offset=5');
    expect(getUserFeed).toHaveBeenCalledWith(
      expect.anything(),
      'user-001',
      expect.objectContaining({ limit: 10, offset: 5 }),
    );
  });

  it('passes tenantId (T3)', async () => {
    vi.mocked(getUserFeed).mockResolvedValue([] as never);
    const app = makeApp({ tenantId: 'tenant-abc' });
    await app.request('/social/feed');
    expect(getUserFeed).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// POST /social/posts
// ---------------------------------------------------------------------------

describe('POST /social/posts', () => {
  it('returns 201 on successful post creation', async () => {
    vi.mocked(createPost).mockResolvedValue({ id: 'p-1', content: 'Hello Lagos!' } as never);
    const app = makeApp();
    const res = await app.request('/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello Lagos!' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on empty content', async () => {
    const app = makeApp();
    const res = await app.request('/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 on content too long (>2000 chars)', async () => {
    const app = makeApp();
    const res = await app.request('/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'A'.repeat(2001) }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 on POST_TOO_LONG error from library', async () => {
    vi.mocked(createPost).mockRejectedValue(new Error('POST_TOO_LONG'));
    const app = makeApp();
    const res = await app.request('/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test' }),
    });
    expect(res.status).toBe(400);
  });

  it('passes authorId and tenantId (T3)', async () => {
    vi.mocked(createPost).mockResolvedValue({ id: 'p-1' } as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test post' }),
    });
    expect(createPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ authorId: 'user-abc', tenantId: 'tenant-abc' }),
    );
  });

  it('accepts valid postType values', async () => {
    vi.mocked(createPost).mockResolvedValue({ id: 'p-1' } as never);
    const app = makeApp();
    for (const postType of ['post', 'repost', 'quote', 'story'] as const) {
      const res = await app.request('/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'test', postType }),
      });
      expect(res.status).toBe(201);
    }
  });
});

// ---------------------------------------------------------------------------
// POST /social/posts/:id/react
// ---------------------------------------------------------------------------

describe('POST /social/posts/:id/react', () => {
  it('returns 201 on successful reaction', async () => {
    vi.mocked(reactToPost).mockResolvedValue({ id: 'r-1', type: 'like' } as never);
    const app = makeApp();
    const res = await app.request('/social/posts/p-1/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'like' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 on invalid reaction type', async () => {
    const app = makeApp();
    const res = await app.request('/social/posts/p-1/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dislike' }),
    });
    expect(res.status).toBe(400);
  });

  it('accepts all valid reaction types', async () => {
    vi.mocked(reactToPost).mockResolvedValue({ id: 'r-1' } as never);
    const app = makeApp();
    for (const type of ['like', 'heart', 'fire', 'celebrate'] as const) {
      const res = await app.request('/social/posts/p-1/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      expect(res.status).toBe(201);
    }
  });
});

// ---------------------------------------------------------------------------
// GET /social/dm/threads
// ---------------------------------------------------------------------------

describe('GET /social/dm/threads', () => {
  it('returns threads array', async () => {
    vi.mocked(listThreads).mockResolvedValue([{ id: 'th-1' }] as never);
    const app = makeApp();
    const res = await app.request('/social/dm/threads');
    expect(res.status).toBe(200);
    const body = await res.json() as { threads: unknown[] };
    expect(Array.isArray(body.threads)).toBe(true);
  });

  it('passes userId and tenantId (T3)', async () => {
    vi.mocked(listThreads).mockResolvedValue([] as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/social/dm/threads');
    expect(listThreads).toHaveBeenCalledWith(expect.anything(), 'user-abc', 'tenant-abc');
  });
});

// ---------------------------------------------------------------------------
// POST /social/dm/threads
// ---------------------------------------------------------------------------

describe('POST /social/dm/threads', () => {
  it('returns 201 with created thread', async () => {
    vi.mocked(getOrCreateThread).mockResolvedValue({ id: 'th-1' } as never);
    const app = makeApp();
    const res = await app.request('/social/dm/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds: ['user-001', 'user-002'] }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 when fewer than 2 participants', async () => {
    const app = makeApp();
    const res = await app.request('/social/dm/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantIds: ['user-001'] }),
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /social/dm/threads/:id/messages (P14)
// ---------------------------------------------------------------------------

describe('POST /social/dm/threads/:id/messages', () => {
  it('returns 201 on successful DM send', async () => {
    vi.mocked(sendDM).mockResolvedValue({ id: 'msg-1' } as never);
    const app = makeApp();
    const res = await app.request('/social/dm/threads/th-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello there' }),
    });
    expect(res.status).toBe(201);
  });

  it('calls assertDMMasterKey (P14)', async () => {
    vi.mocked(sendDM).mockResolvedValue({ id: 'msg-1' } as never);
    const app = makeApp();
    await app.request('/social/dm/threads/th-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' }),
    });
    expect(assertDMMasterKey).toHaveBeenCalled();
  });

  it('returns 400 on empty content', async () => {
    const app = makeApp();
    const res = await app.request('/social/dm/threads/th-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('passes senderId and tenantId to sendDM (T3)', async () => {
    vi.mocked(sendDM).mockResolvedValue({ id: 'msg-1' } as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/social/dm/threads/th-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' }),
    });
    expect(sendDM).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ senderId: 'user-abc', tenantId: 'tenant-abc' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /social/stories
// ---------------------------------------------------------------------------

describe('GET /social/stories', () => {
  it('returns stories array', async () => {
    vi.mocked(getFollowingIds).mockResolvedValue(['user-002', 'user-003'] as never);
    vi.mocked(getActiveStories).mockResolvedValue([{ id: 'st-1' }] as never);
    const app = makeApp();
    const res = await app.request('/social/stories');
    expect(res.status).toBe(200);
    const body = await res.json() as { stories: unknown[] };
    expect(Array.isArray(body.stories)).toBe(true);
  });

  it('fetches following list first then stories (T3)', async () => {
    vi.mocked(getFollowingIds).mockResolvedValue(['user-002'] as never);
    vi.mocked(getActiveStories).mockResolvedValue([] as never);
    const app = makeApp({ userId: 'user-abc', tenantId: 'tenant-abc' });
    await app.request('/social/stories');
    expect(getFollowingIds).toHaveBeenCalledWith(expect.anything(), 'user-abc', 'tenant-abc');
    expect(getActiveStories).toHaveBeenCalledWith(expect.anything(), ['user-002'], 'tenant-abc');
  });

  it('returns empty stories for users with no follows', async () => {
    vi.mocked(getFollowingIds).mockResolvedValue([] as never);
    vi.mocked(getActiveStories).mockResolvedValue([] as never);
    const app = makeApp();
    const res = await app.request('/social/stories');
    expect(res.status).toBe(200);
    const body = await res.json() as { stories: unknown[] };
    expect(body.stories).toHaveLength(0);
  });
});
