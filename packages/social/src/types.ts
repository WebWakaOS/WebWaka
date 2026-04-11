/**
 * Canonical TypeScript types for @webwaka/social.
 * (Platform Invariants T2, T3 — strict mode, tenant isolation)
 */

export interface SocialProfile {
  id: string;
  profileId: string;
  handle: string;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  /** Blue tick — NIN or BVN verified (P2 — Nigeria First) */
  isVerified: boolean;
  visibility: 'public' | 'private';
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface SocialFollow {
  id: string;
  followerId: string;
  followeeId: string;
  status: 'active' | 'pending';
  tenantId: string;
  createdAt: number;
}

export interface SocialBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  tenantId: string;
  createdAt: number;
}

export interface SocialPost {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  postType: 'post' | 'repost' | 'quote' | 'story';
  parentId: string | null;
  groupId: string | null;
  visibility: 'public' | 'followers' | 'group' | 'private';
  language: 'en' | 'pcm' | 'yo' | 'ig' | 'ha';
  likeCount: number;
  commentCount: number;
  repostCount: number;
  isFlagged: boolean;
  moderationStatus: 'published' | 'under_review' | 'removed';
  isBoosted: boolean;
  expiresAt: number | null;
  tenantId: string;
  createdAt: number;
}

export interface SocialGroup {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'public' | 'private' | 'secret';
  memberCount: number;
  tenantId: string;
  createdAt: number;
}

export interface SocialGroupMember {
  id: string;
  groupId: string;
  memberId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: number;
  tenantId: string;
}

export interface SocialReaction {
  id: string;
  postId: string;
  reactorId: string;
  type: 'like' | 'heart' | 'fire' | 'celebrate';
  createdAt: number;
}

export interface DMThread {
  id: string;
  type: 'direct' | 'group';
  participantIds: string[];
  lastMessageAt: number | null;
  tenantId: string;
  createdAt: number;
}

export interface DMMessage {
  id: string;
  threadId: string;
  senderId: string;
  /** AES-256-GCM encrypted ciphertext — P14 */
  content: string;
  mediaUrls: string[];
  isDeleted: boolean;
  readBy: Record<string, number>;
  tenantId: string;
  createdAt: number;
}

export interface ModerationResult {
  action: 'publish' | 'flag' | 'auto_hide';
  reason: string | null;
  scores: {
    profanity: number;
    nsfw: number;
    spam: number;
  };
}
