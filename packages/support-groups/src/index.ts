/**
 * @webwaka/support-groups — Public API
 *
 * Build Once Use Infinitely (P1):
 *   This package has NO vertical-specific logic in its core.
 *   Political/election features are opt-in via groupType and hierarchyLevel fields.
 *   All verticals (church, NGO, professional, civic) can use this package.
 */

export * from './types.js';
export * from './entitlements.js';

export {
  createSupportGroup,
  getSupportGroup,
  listSupportGroups,
  listPublicSupportGroups,
  listChildGroups,
  updateSupportGroup,
  joinSupportGroup,
  getMember,
  listGroupMembers,
  approveMember,
  updateMemberRole,
  createMeeting,
  listMeetings,
  createBroadcast,
  listBroadcasts,
  createGroupEvent,
  listGroupEvents,
  recordGotvMobilization,
  confirmVote,
  getGotvStats,
  createPetition,
  signPetition,
  getGroupAnalytics,
} from './repository.js';

export type { D1Like } from './repository.js';

export const PACKAGE_VERSION = '0.1.0';
export const VERTICAL_SLUG = 'support-group';
