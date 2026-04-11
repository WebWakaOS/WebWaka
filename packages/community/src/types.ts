/**
 * Canonical TypeScript types for @webwaka/community.
 * (Platform Invariants T2, T4 — strict mode, integer kobo only)
 */

export interface CommunitySpace {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'public' | 'private' | 'invite_only';
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface MembershipTier {
  id: string;
  communityId: string;
  name: string;
  /** Platform Invariant T4 — integer kobo only, never floats */
  priceKobo: number;
  billingCycle: 'monthly' | 'annual' | 'one_time';
  kycTierMin: 0 | 1 | 2 | 3;
  accessChannels: string[];
  accessCourses: string[];
  isDefault: boolean;
  tenantId: string;
  createdAt: number;
}

export interface CommunityMembership {
  id: string;
  communityId: string;
  userId: string;
  tierId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  kycTier: number;
  status: 'active' | 'suspended' | 'banned' | 'expired';
  joinedAt: number;
  expiresAt: number | null;
  tenantId: string;
}

export interface CommunityChannel {
  id: string;
  communityId: string;
  name: string;
  type: 'forum' | 'chat' | 'announcement';
  accessTierId: string | null;
  position: number;
  tenantId: string;
  createdAt: number;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  authorId: string;
  parentId: string | null;
  depth: number;
  title: string | null;
  content: string;
  isPinned: boolean;
  isFlagged: boolean;
  moderationStatus: 'published' | 'under_review' | 'removed';
  replyCount: number;
  reactionCount: number;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CourseModule {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published';
  accessTierId: string | null;
  sequence: number;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: 'text' | 'video' | 'audio' | 'pdf';
  contentUrl: string | null;
  body: string | null;
  durationSecs: number | null;
  sequence: number;
  isFreePreview: boolean;
  tenantId: string;
  createdAt: number;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  completedAt: number | null;
  progressPct: number;
  tenantId: string;
}

export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  type: 'live' | 'recorded' | 'in_person';
  startsAt: number;
  endsAt: number | null;
  location: string | null;
  /** Platform Invariant T4 — integer kobo only */
  ticketPriceKobo: number;
  maxAttendees: number | null;
  rsvpCount: number;
  accessTierId: string | null;
  tenantId: string;
  createdAt: number;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'maybe' | 'not_going';
  paymentRef: string | null;
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
