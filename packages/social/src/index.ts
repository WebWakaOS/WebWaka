/**
 * @webwaka/social — Social network platform.
 * Profiles, Follows, Posts, Groups, DMs, Stories, Feed.
 *
 * (Platform Invariants P5, P6, P14, P15, T3, T5)
 */

export type {
  SocialProfile,
  SocialFollow,
  SocialBlock,
  SocialPost,
  SocialGroup,
  SocialGroupMember,
  SocialReaction,
  DMThread,
  DMMessage,
  ModerationResult,
} from './types.js';

export {
  setupSocialProfile,
  getSocialProfileByHandle,
  getSocialProfile,
  isHandleAvailable,
  verifyProfile,
} from './social-profile.js';

export type { D1Like } from './social-profile.js';

export {
  followProfile,
  unfollowProfile,
  blockProfile,
  getFollowingIds,
  getMutuals,
} from './follow.js';

export {
  createPost,
  getPost,
  reactToPost,
  getTrendingPosts,
} from './social-post.js';

export {
  createGroup,
  getGroup,
  joinGroup,
  listPublicGroups,
  listGroupMembers,
} from './social-group.js';

export {
  getUserFeed,
  getExploreFeed,
} from './feed.js';

export {
  getOrCreateThread,
  listThreads,
  sendDM,
  getThreadMessages,
  decryptDMContent,
  assertDMMasterKey,
} from './dm.js';

export {
  createStory,
  getActiveStories,
  storyTimeRemaining,
} from './stories.js';

export {
  classifySocialContent,
  shadowBanProfile,
  reportSocialContent,
} from './moderation.js';

export {
  encryptContent,
  decryptContent,
} from './encryption.js';
