/**
 * @webwaka/community — Skool-style community platform.
 * Community Spaces, Channels, Courses, Events, Memberships.
 *
 * (Platform Invariants P1, P2, P5, P6, P10, P15, T3, T4, T5)
 */

export type {
  CommunitySpace,
  MembershipTier,
  CommunityMembership,
  CommunityChannel,
  ChannelPost,
  CourseModule,
  CourseLesson,
  LessonProgress,
  CommunityEvent,
  EventRSVP,
  ModerationResult,
} from './types.js';

export {
  createCommunitySpace,
  getCommunitySpace,
  listCommunitySpaces,
  listMembershipTiers,
  createMembershipTier,
} from './community-space.js';

export type { D1Like } from './community-space.js';

export {
  joinCommunity,
  leaveCommunity,
  upgradeMemberTier,
  getMembership,
  getUserMemberships,
} from './membership.js';

export {
  createChannel,
  listChannels,
  createChannelPost,
  listChannelPosts,
  getChannelPost,
} from './channel.js';

export {
  createCourseModule,
  listCourseModules,
  createLesson,
  getLesson,
  listLessons,
  updateLessonProgress,
  getLessonProgress,
} from './course.js';

export {
  createEvent,
  listEvents,
  getEvent,
  rsvpEvent,
} from './event.js';

export {
  classifyContent,
  submitModerationAction,
  reportContent,
} from './moderation.js';

export {
  assertPaidTiersEnabled,
  assertCoursesEnabled,
  assertMaxSpaces,
  FREE_COMMUNITY_ENTITLEMENTS,
  GROWTH_COMMUNITY_ENTITLEMENTS,
  ENTERPRISE_COMMUNITY_ENTITLEMENTS,
} from './entitlements.js';

export type { CommunityEntitlementDimensions } from './entitlements.js';

export {
  resolveThresholds,
  DEFAULT_THRESHOLDS,
  PLATFORM_MAX_THRESHOLDS,
} from './moderation-config.js';

export type { ModerationThresholds } from './moderation-config.js';
