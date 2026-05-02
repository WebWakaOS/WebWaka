/**
 * @webwaka/support-groups — Public API (DEPRECATED)
 *
 * @deprecated Phase 0 (ADR-0042): This package is superseded by @webwaka/groups.
 *   - All new code MUST use @webwaka/groups instead.
 *   - API route /support-groups now issues 308 redirects to /groups.
 *   - Migration 0462 drops the support_groups_* shadow tables.
 *   - Do NOT add new features here; extend @webwaka/groups instead.
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
/** @deprecated Use VERTICAL_SLUG = 'group' from @webwaka/groups */
export const VERTICAL_SLUG = 'group';
