/**
 * Social post management — create, repost, quote, react.
 * (Platform Invariants P15 — moderation-first, T3 — tenant isolation)
 */

import type { SocialPost, SocialReaction } from './types.js';
import type { D1Like } from './social-profile.js';
import { classifySocialContent } from './moderation.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface PostRow {
  id: string;
  author_id: string;
  content: string;
  media_urls: string;
  post_type: string;
  parent_id: string | null;
  group_id: string | null;
  visibility: string;
  language: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  is_flagged: number;
  moderation_status: string;
  is_boosted: number;
  expires_at: number | null;
  tenant_id: string;
  created_at: number;
}

function rowToPost(row: PostRow): SocialPost {
  return {
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    mediaUrls: JSON.parse(row.media_urls) as string[],
    postType: row.post_type as SocialPost['postType'],
    parentId: row.parent_id,
    groupId: row.group_id,
    visibility: row.visibility as SocialPost['visibility'],
    language: row.language as SocialPost['language'],
    likeCount: row.like_count,
    commentCount: row.comment_count,
    repostCount: row.repost_count,
    isFlagged: row.is_flagged === 1,
    moderationStatus: row.moderation_status as SocialPost['moderationStatus'],
    isBoosted: row.is_boosted === 1,
    expiresAt: row.expires_at,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

/**
 * Create a social post.
 * P15 — moderation classifier called unconditionally.
 */
export async function createPost(
  db: D1Like,
  input: {
    authorId: string;
    content: string;
    mediaUrls?: string[];
    postType?: 'post' | 'repost' | 'quote' | 'story';
    parentId?: string;
    groupId?: string;
    visibility?: 'public' | 'followers' | 'group' | 'private';
    language?: 'en' | 'pcm' | 'yo' | 'ig' | 'ha';
    tenantId: string;
  },
): Promise<SocialPost> {
  if (input.content.length > 2000) {
    throw new Error('POST_TOO_LONG: Content exceeds 2000 characters');
  }

  // P15 — moderation before insert
  const modResult = await classifySocialContent(input.content);
  const moderationStatus = modResult.action === 'auto_hide' ? 'under_review' : 'published';
  const isFlagged = modResult.action !== 'publish' ? 1 : 0;

  const postType = input.postType ?? 'post';
  const id = generateId('spt');
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = postType === 'story' ? now + 86400 : null;

  await db
    .prepare(
      `INSERT INTO social_posts (id, author_id, content, media_urls, post_type, parent_id, group_id, visibility, language, like_count, comment_count, repost_count, is_flagged, moderation_status, is_boosted, expires_at, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(
      id, input.authorId, input.content,
      JSON.stringify(input.mediaUrls ?? []),
      postType, input.parentId ?? null,
      input.groupId ?? null,
      input.visibility ?? 'public',
      input.language ?? 'en',
      isFlagged, moderationStatus, expiresAt,
      input.tenantId, now,
    )
    .run();

  // If it's a reply, increment parent comment_count
  if (input.parentId) {
    await db
      .prepare(`UPDATE social_posts SET comment_count = comment_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.parentId, input.tenantId)
      .run();
  }

  return {
    id,
    authorId: input.authorId,
    content: input.content,
    mediaUrls: input.mediaUrls ?? [],
    postType,
    parentId: input.parentId ?? null,
    groupId: input.groupId ?? null,
    visibility: input.visibility ?? 'public',
    language: input.language ?? 'en',
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
    isFlagged: isFlagged === 1,
    moderationStatus: moderationStatus as SocialPost['moderationStatus'],
    isBoosted: false,
    expiresAt,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * Get a single social post.
 */
export async function getPost(
  db: D1Like,
  postId: string,
  tenantId: string,
): Promise<SocialPost | null> {
  const row = await db
    .prepare(`SELECT * FROM social_posts WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(postId, tenantId)
    .first<PostRow>();
  return row ? rowToPost(row) : null;
}

/**
 * Add a reaction to a post.
 */
export async function reactToPost(
  db: D1Like,
  input: {
    postId: string;
    reactorId: string;
    type: 'like' | 'heart' | 'fire' | 'celebrate';
    tenantId: string;
  },
): Promise<SocialReaction> {
  const id = generateId('rxn');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR REPLACE INTO social_reactions (id, post_id, reactor_id, type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, input.postId, input.reactorId, input.type, now)
    .run();

  // Update like_count
  if (input.type === 'like') {
    await db
      .prepare(`UPDATE social_posts SET like_count = like_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.postId, input.tenantId)
      .run();
  }

  return {
    id,
    postId: input.postId,
    reactorId: input.reactorId,
    type: input.type,
    createdAt: now,
  };
}

/**
 * Get trending posts (by like_count, published, non-expired).
 */
export async function getTrendingPosts(
  db: D1Like,
  tenantId: string,
  limit = 10,
): Promise<SocialPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const { results } = await db
    .prepare(
      `SELECT * FROM social_posts
       WHERE tenant_id = ? AND moderation_status = 'published' AND visibility = 'public'
         AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY like_count DESC, created_at DESC
       LIMIT ?`,
    )
    .bind(tenantId, now, limit)
    .all<PostRow>();
  return results.map(rowToPost);
}
