/**
 * Channel and post management for @webwaka/community.
 * (Platform Invariants P15 — moderation called on every post, T3 — tenant isolation)
 */

import type { CommunityChannel, ChannelPost } from './types.js';
import type { D1Like } from './community-space.js';
import { classifyContent } from './moderation.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface ChannelRow {
  id: string;
  community_id: string;
  name: string;
  type: string;
  access_tier_id: string | null;
  position: number;
  tenant_id: string;
  created_at: number;
}

interface PostRow {
  id: string;
  channel_id: string;
  author_id: string;
  parent_id: string | null;
  depth: number;
  title: string | null;
  content: string;
  is_pinned: number;
  is_flagged: number;
  moderation_status: string;
  reply_count: number;
  reaction_count: number;
  tenant_id: string;
  created_at: number;
  updated_at: number;
}

function rowToChannel(row: ChannelRow): CommunityChannel {
  return {
    id: row.id,
    communityId: row.community_id,
    name: row.name,
    type: row.type as CommunityChannel['type'],
    accessTierId: row.access_tier_id,
    position: row.position,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

function rowToPost(row: PostRow): ChannelPost {
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId: row.author_id,
    parentId: row.parent_id,
    depth: row.depth,
    title: row.title,
    content: row.content,
    isPinned: row.is_pinned === 1,
    isFlagged: row.is_flagged === 1,
    moderationStatus: row.moderation_status as ChannelPost['moderationStatus'],
    replyCount: row.reply_count,
    reactionCount: row.reaction_count,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Create a channel in a community.
 */
export async function createChannel(
  db: D1Like,
  input: {
    communityId: string;
    name: string;
    type: 'forum' | 'chat' | 'announcement';
    position?: number;
    accessTierId?: string;
    tenantId: string;
  },
): Promise<CommunityChannel> {
  const id = generateId('chn');
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO community_channels (id, community_id, name, type, access_tier_id, position, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.communityId, input.name, input.type, input.accessTierId ?? null, input.position ?? 0, input.tenantId, now)
    .run();

  return {
    id,
    communityId: input.communityId,
    name: input.name,
    type: input.type,
    accessTierId: input.accessTierId ?? null,
    position: input.position ?? 0,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * List channels in a community.
 */
export async function listChannels(
  db: D1Like,
  communityId: string,
  tenantId: string,
): Promise<CommunityChannel[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM community_channels WHERE community_id = ? AND tenant_id = ? ORDER BY position ASC`,
    )
    .bind(communityId, tenantId)
    .all<ChannelRow>();
  return results.map(rowToChannel);
}

/**
 * Create a post in a channel.
 * P15 — moderation classifier called unconditionally.
 */
export async function createChannelPost(
  db: D1Like,
  input: {
    channelId: string;
    authorId: string;
    content: string;
    parentId?: string;
    title?: string;
    tenantId: string;
  },
): Promise<ChannelPost> {
  // P15 — run moderation before insert
  const modResult = await classifyContent(input.content);
  const moderationStatus = modResult.action === 'auto_hide' ? 'under_review' : 'published';
  const isFlagged = modResult.action !== 'publish' ? 1 : 0;

  // Compute depth from parent
  let depth = 0;
  if (input.parentId) {
    const parent = await db
      .prepare(`SELECT depth FROM channel_posts WHERE id = ? AND tenant_id = ? LIMIT 1`)
      .bind(input.parentId, input.tenantId)
      .first<{ depth: number }>();
    depth = parent ? Math.min(parent.depth + 1, 4) : 0;
  }

  const id = generateId('pst');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO channel_posts (id, channel_id, author_id, parent_id, depth, title, content, is_pinned, is_flagged, moderation_status, reply_count, reaction_count, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0, 0, ?, ?, ?)`,
    )
    .bind(id, input.channelId, input.authorId, input.parentId ?? null, depth, input.title ?? null, input.content, isFlagged, moderationStatus, input.tenantId, now, now)
    .run();

  // Increment parent reply_count
  if (input.parentId) {
    await db
      .prepare(`UPDATE channel_posts SET reply_count = reply_count + 1 WHERE id = ? AND tenant_id = ?`)
      .bind(input.parentId, input.tenantId)
      .run();
  }

  return {
    id,
    channelId: input.channelId,
    authorId: input.authorId,
    parentId: input.parentId ?? null,
    depth,
    title: input.title ?? null,
    content: input.content,
    isPinned: false,
    isFlagged: isFlagged === 1,
    moderationStatus: moderationStatus as ChannelPost['moderationStatus'],
    replyCount: 0,
    reactionCount: 0,
    tenantId: input.tenantId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * List posts in a channel.
 */
export async function listChannelPosts(
  db: D1Like,
  channelId: string,
  tenantId: string,
  limit = 20,
  offset = 0,
): Promise<ChannelPost[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM channel_posts
       WHERE channel_id = ? AND tenant_id = ? AND parent_id IS NULL AND moderation_status = 'published'
       ORDER BY is_pinned DESC, created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(channelId, tenantId, limit, offset)
    .all<PostRow>();
  return results.map(rowToPost);
}

/**
 * Get a single post with its replies.
 */
export async function getChannelPost(
  db: D1Like,
  postId: string,
  tenantId: string,
): Promise<ChannelPost | null> {
  const row = await db
    .prepare(`SELECT * FROM channel_posts WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(postId, tenantId)
    .first<PostRow>();
  return row ? rowToPost(row) : null;
}
