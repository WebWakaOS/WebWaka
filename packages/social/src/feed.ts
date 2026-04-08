/**
 * Feed generation for @webwaka/social.
 * Algorithm: (1) posts from followed IDs, (2) trending global posts, (3) boosted posts.
 * Deduplicate and sort by created_at DESC.
 *
 * (Platform Invariants P5/P6 — offline cache via Dexie.js, T3 — tenant isolation)
 */

import type { SocialPost } from './types.js';
import type { D1Like } from './social-profile.js';
import { getFollowingIds } from './follow.js';
import { getTrendingPosts } from './social-post.js';

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
 * Generate the user's home feed.
 *
 * 1. Fetch posts from profiles the user follows (visibility: public or followers)
 * 2. Augment with globally trending posts
 * 3. Inject boosted posts
 * 4. Deduplicate by ID and sort by created_at DESC
 */
export async function getUserFeed(
  db: D1Like,
  userId: string,
  options: { limit: number; offset: number; tenantId: string },
): Promise<SocialPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const followingIds = await getFollowingIds(db, userId, options.tenantId);

  const posts: SocialPost[] = [];
  const seen = new Set<string>();

  // Step 1: posts from followed profiles
  if (followingIds.length > 0) {
    const placeholders = followingIds.map(() => '?').join(', ');
    const { results } = await db
      .prepare(
        `SELECT * FROM social_posts
         WHERE author_id IN (${placeholders}) AND tenant_id = ?
           AND moderation_status = 'published'
           AND (expires_at IS NULL OR expires_at > ?)
           AND visibility IN ('public', 'followers')
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(...followingIds, options.tenantId, now, options.limit)
      .all<PostRow>();
    for (const row of results) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        posts.push(rowToPost(row));
      }
    }
  }

  // Step 2: trending posts (global)
  const trending = await getTrendingPosts(db, options.tenantId, 10);
  for (const post of trending) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      posts.push(post);
    }
  }

  // Step 3: boosted posts
  const { results: boosted } = await db
    .prepare(
      `SELECT * FROM social_posts
       WHERE tenant_id = ? AND is_boosted = 1 AND moderation_status = 'published'
         AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY created_at DESC LIMIT 5`,
    )
    .bind(options.tenantId, now)
    .all<PostRow>();

  for (const row of boosted) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      posts.push(rowToPost(row));
    }
  }

  // Sort by created_at DESC, paginate
  posts.sort((a, b) => b.createdAt - a.createdAt);
  return posts.slice(options.offset, options.offset + options.limit);
}

/**
 * Get the explore feed — trending + popular public posts.
 */
export async function getExploreFeed(
  db: D1Like,
  tenantId: string,
  limit = 20,
): Promise<SocialPost[]> {
  return getTrendingPosts(db, tenantId, limit);
}
