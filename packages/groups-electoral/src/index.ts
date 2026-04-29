/**
 * @webwaka/groups-electoral — Electoral extensions for @webwaka/groups.
 *
 * Phase 0: Extracted from @webwaka/support-groups.
 * Provides GOTV tracking and INEC-related extensions for political/election groups.
 *
 * This package is only loaded for tenants with sensitiveSectorRights = true
 * (enterprise and partner plans) or on the Political PlatformLayer.
 *
 * P13 reminder to route layer:
 *   All GotvRecord objects returned from this package contain voter_ref.
 *   Strip voter_ref before any list response, any AI context, or any log.
 */

export * from './types.js';
export {
  upsertElectoralExtension,
  getElectoralExtension,
  recordGotvMobilization,
  confirmVote,
  getGotvStats,
} from './repository.js';
export type { D1Like } from './repository.js';

export const PACKAGE_VERSION = '0.1.0';
export const VERTICAL_SLUG = 'groups-electoral';
