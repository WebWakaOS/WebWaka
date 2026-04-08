/**
 * Social network routes (M7c)
 *
 *   GET  /social/profile/:handle            — get social profile (no auth)
 *   POST /social/profile/setup              — create/setup profile (auth required)
 *   POST /social/follow/:id                 — follow a profile (auth required)
 *   GET  /social/feed                       — user's home feed (auth required)
 *   POST /social/posts                      — create post (auth required)
 *   POST /social/posts/:id/react            — react to post (auth required)
 *   GET  /social/dm/threads                 — list DM threads (auth required)
 *   POST /social/dm/threads/:id/messages    — send DM (auth required)
 *   GET  /social/stories                    — get active stories (auth required)
 *
 * All write routes use tenant_id from AuthContext (T3).
 * P14 — DM content encrypted before insert.
 * P15 — moderation called on every post.
 * Advisory: X-User-Id extracted from JWT sub claim (confirmed pattern from M7a).
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
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

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1BoundStmt {
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T>(): Promise<{ results: T[] }>;
}

interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1BoundStmt };
}

const SetupProfileSchema = z.object({
  handle: z.string().min(1).max(30).regex(/^[a-z0-9_]+$/, 'Handle must be lowercase alphanumeric + underscore only'),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

const CreatePostSchema = z.object({
  content: z.string().min(1).max(2000),
  mediaUrls: z.array(z.string().url()).optional(),
  postType: z.enum(['post', 'repost', 'quote', 'story']).optional(),
  parentId: z.string().optional(),
  groupId: z.string().optional(),
  visibility: z.enum(['public', 'followers', 'group', 'private']).optional(),
  language: z.enum(['en', 'pcm', 'yo', 'ig', 'ha']).optional(),
});

const ReactSchema = z.object({
  type: z.enum(['like', 'heart', 'fire', 'celebrate']),
});

const SendDMSchema = z.object({
  content: z.string().min(1).max(4000),
  mediaUrls: z.array(z.string()).optional(),
});

const CreateThreadSchema = z.object({
  participantIds: z.array(z.string()).min(2),
  type: z.enum(['direct', 'group']).optional(),
});

export const socialRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// GET /social/profile/:handle — public profile (no auth)
// ---------------------------------------------------------------------------

socialRoutes.get('/profile/:handle', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const profile = await getSocialProfileByHandle(db, c.req.param('handle'), tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ profile });
});

// ---------------------------------------------------------------------------
// POST /social/profile/setup — create/update social profile (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/profile/setup', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = SetupProfileSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  try {
    const profile = await setupSocialProfile(db, {
      profileId: auth.userId,
      handle: parsed.data.handle,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl,
      visibility: parsed.data.visibility,
      tenantId: auth.tenantId,
    });
    return c.json({ profile }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('HANDLE_TAKEN')) return c.json({ error: msg }, 409);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// POST /social/follow/:id — follow a profile (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/follow/:id', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  try {
    const follow = await followProfile(db, {
      followerId: auth.userId,
      followeeId: c.req.param('id'),
      tenantId: auth.tenantId,
    });
    return c.json({ follow }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('SELF_FOLLOW')) return c.json({ error: msg }, 400);
    if (msg.includes('not found')) return c.json({ error: msg }, 404);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// GET /social/feed — home feed (auth required)
// ---------------------------------------------------------------------------

socialRoutes.get('/feed', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const limit = parseInt(c.req.query('limit') ?? '20', 10);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const posts = await getUserFeed(db, auth.userId, { limit, offset, tenantId: auth.tenantId });
  return c.json({ posts });
});

// ---------------------------------------------------------------------------
// POST /social/posts — create post (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/posts', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  try {
    const post = await createPost(db, {
      authorId: auth.userId,
      content: parsed.data.content,
      mediaUrls: parsed.data.mediaUrls,
      postType: parsed.data.postType,
      parentId: parsed.data.parentId,
      groupId: parsed.data.groupId,
      visibility: parsed.data.visibility,
      language: parsed.data.language,
      tenantId: auth.tenantId,
    });
    return c.json({ post }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('POST_TOO_LONG')) return c.json({ error: msg }, 400);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// POST /social/posts/:id/react — react to a post (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/posts/:id/react', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = ReactSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  const reaction = await reactToPost(db, {
    postId: c.req.param('id'),
    reactorId: auth.userId,
    type: parsed.data.type,
    tenantId: auth.tenantId,
  });
  return c.json({ reaction }, 201);
});

// ---------------------------------------------------------------------------
// GET /social/dm/threads — list threads (auth required)
// ---------------------------------------------------------------------------

socialRoutes.get('/dm/threads', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const threads = await listThreads(db, auth.userId, auth.tenantId);
  return c.json({ threads });
});

// ---------------------------------------------------------------------------
// POST /social/dm/threads — create new thread (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/dm/threads', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = CreateThreadSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  const thread = await getOrCreateThread(db, {
    participantIds: parsed.data.participantIds,
    type: parsed.data.type,
    tenantId: auth.tenantId,
  });
  return c.json({ thread }, 201);
});

// ---------------------------------------------------------------------------
// POST /social/dm/threads/:id/messages — send DM (auth required)
// ---------------------------------------------------------------------------

socialRoutes.post('/dm/threads/:id/messages', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = SendDMSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const masterKey = c.env.DM_MASTER_KEY as string | undefined;
  assertDMMasterKey(masterKey);

  const db = c.env.DB as unknown as D1Like;
  const message = await sendDM(db, masterKey, {
    threadId: c.req.param('id'),
    senderId: auth.userId,
    content: parsed.data.content,
    mediaUrls: parsed.data.mediaUrls,
    tenantId: auth.tenantId,
  });
  // Return message with encrypted content (client decrypts if needed)
  return c.json({ message }, 201);
});

// ---------------------------------------------------------------------------
// GET /social/stories — active stories from followed profiles (auth required)
// ---------------------------------------------------------------------------

socialRoutes.get('/stories', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;
  const followingIds = await getFollowingIds(db, auth.userId, auth.tenantId);
  const stories = await getActiveStories(db, followingIds, auth.tenantId);
  return c.json({ stories });
});
