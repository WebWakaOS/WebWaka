/**
 * Community routes (M7c)
 *
 *   GET  /community/:slug                    — get community space
 *   POST /community/join                     — join community (auth required)
 *   GET  /community/:id/channels             — list channels
 *   GET  /community/channels/:id/posts       — list channel posts
 *   POST /community/channels/:id/posts       — create channel post (auth required)
 *   GET  /community/:id/courses              — list course modules
 *   GET  /community/lessons/:id             — get lesson
 *   POST /community/lessons/:id/progress    — update lesson progress (auth required)
 *   GET  /community/:id/events              — list events
 *   POST /community/events/:id/rsvp         — RSVP to event (auth required)
 *
 * All write routes require auth + tenant_id from AuthContext (T3).
 * P15 — moderation called unconditionally in createChannelPost.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
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

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1BoundStmt {
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T>(): Promise<{ results: T[] }>;
}

interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1BoundStmt };
}

const JoinSchema = z.object({
  communityId: z.string().min(1),
  tierId: z.string().min(1),
  kycTier: z.number().int().min(0).max(3).optional().default(0),
});

const PostSchema = z.object({
  content: z.string().min(1).max(5000),
  title: z.string().optional(),
  parentId: z.string().optional(),
});

const ProgressSchema = z.object({
  progressPct: z.number().int().min(0).max(100),
});

const RSVPSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']),
  paymentRef: z.string().optional(),
});

export const communityRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// GET /community/:slug — get community space (no auth)
// ---------------------------------------------------------------------------

communityRoutes.get('/:slug', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const space = await getCommunitySpace(db, c.req.param('slug'), tenantId);
  if (!space) return c.json({ error: 'Community not found' }, 404);
  return c.json({ space });
});

// ---------------------------------------------------------------------------
// POST /community/join — join a community (auth required)
// ---------------------------------------------------------------------------

communityRoutes.post('/join', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  try {
    const membership = await joinCommunity(db, {
      communityId: parsed.data.communityId,
      userId: auth.userId,
      tierId: parsed.data.tierId,
      kycTier: parsed.data.kycTier,
      tenantId: auth.tenantId,
    });
    return c.json({ membership }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('NDPR_CONSENT_REQUIRED')) return c.json({ error: msg }, 403);
    if (msg.includes('KYC_TIER_INSUFFICIENT')) return c.json({ error: msg }, 403);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// GET /community/:id/channels — list channels (no auth)
// ---------------------------------------------------------------------------

communityRoutes.get('/:id/channels', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const channels = await listChannels(db, c.req.param('id'), tenantId);
  return c.json({ channels });
});

// ---------------------------------------------------------------------------
// GET /community/channels/:id/posts — list channel posts (no auth)
// ---------------------------------------------------------------------------

communityRoutes.get('/channels/:id/posts', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const limit = parseInt(c.req.query('limit') ?? '20', 10);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const posts = await listChannelPosts(db, c.req.param('id'), tenantId, limit, offset);
  return c.json({ posts });
});

// ---------------------------------------------------------------------------
// POST /community/channels/:id/posts — create post (auth required)
// ---------------------------------------------------------------------------

communityRoutes.post('/channels/:id/posts', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  const post = await createChannelPost(db, {
    channelId: c.req.param('id'),
    authorId: auth.userId,
    content: parsed.data.content,
    title: parsed.data.title,
    parentId: parsed.data.parentId,
    tenantId: auth.tenantId,
  });
  return c.json({ post }, 201);
});

// ---------------------------------------------------------------------------
// GET /community/:id/courses — list course modules (no auth)
// ---------------------------------------------------------------------------

communityRoutes.get('/:id/courses', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const modules = await listCourseModules(db, c.req.param('id'), tenantId);
  return c.json({ modules });
});

// ---------------------------------------------------------------------------
// GET /community/lessons/:id — get lesson (no auth, P6 offline-cacheable)
// ---------------------------------------------------------------------------

communityRoutes.get('/lessons/:id', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const lesson = await getLesson(db, c.req.param('id'), tenantId);
  if (!lesson) return c.json({ error: 'Lesson not found' }, 404);
  return c.json({ lesson });
});

// ---------------------------------------------------------------------------
// POST /community/lessons/:id/progress — update progress (auth required)
// ---------------------------------------------------------------------------

communityRoutes.post('/lessons/:id/progress', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  const progress = await updateLessonProgress(db, {
    lessonId: c.req.param('id'),
    userId: auth.userId,
    progressPct: parsed.data.progressPct,
    tenantId: auth.tenantId,
  });
  return c.json({ progress });
});

// ---------------------------------------------------------------------------
// GET /community/:id/events — list upcoming events (no auth)
// ---------------------------------------------------------------------------

communityRoutes.get('/:id/events', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const tenantId = c.req.header('X-Tenant-Id') ?? 'default';
  const events = await listEvents(db, c.req.param('id'), tenantId);
  return c.json({ events });
});

// ---------------------------------------------------------------------------
// POST /community/events/:id/rsvp — RSVP (auth required)
// ---------------------------------------------------------------------------

communityRoutes.post('/events/:id/rsvp', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);
  const parsed = RSVPSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);

  const db = c.env.DB as unknown as D1Like;
  try {
    const rsvp = await rsvpEvent(db, {
      eventId: c.req.param('id'),
      userId: auth.userId,
      status: parsed.data.status,
      paymentRef: parsed.data.paymentRef,
      tenantId: auth.tenantId,
    });
    return c.json({ rsvp }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('EVENT_FULL')) return c.json({ error: msg }, 409);
    if (msg.includes('PAYMENT_REQUIRED')) return c.json({ error: msg }, 402);
    throw err;
  }
});
