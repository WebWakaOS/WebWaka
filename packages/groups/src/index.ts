/**
 * @webwaka/groups — Public API
 *
 * Phase 0 rename: @webwaka/support-groups → @webwaka/groups
 *
 * Build Once Use Infinitely (P1):
 *   This package has NO vertical-specific logic in its core.
 *   Political/election features are opt-in via category and hierarchyLevel fields.
 *   Extension tables (group_electoral_extensions, group_faith_extensions, etc.)
 *   hold vertical-specific data without polluting the core schema (P4).
 *   All verticals (church, NGO, professional, civic, electoral) can use this package.
 */

export * from './types.js';
export * from './entitlements.js';

export {
  createGroup,
  getGroup,
  listGroups,
  listPublicGroups,
  listChildGroups,
  updateGroup,
  joinGroup,
  getMember,
  listGroupMembers,
  approveMember,
  updateMemberRole,
  createMeeting,
  listMeetings,
  recordResolution,
  createBroadcast,
  listBroadcasts,
  createGroupEvent,
  listGroupEvents,
  createPetition,
  signPetition,
  getGroupAnalytics,
} from './repository.js';

export type { D1Like } from './repository.js';

export const PACKAGE_VERSION = '0.1.0';
export const VERTICAL_SLUG = 'group';
