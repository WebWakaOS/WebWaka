/**
 * @webwaka/groups-faith — Public API
 *
 * Phase 2: Faith community group extension.
 */

export type {
  GroupFaithExtension,
  UpsertFaithExtensionInput,
  FaithTradition,
  ServiceDay,
} from './types.js';

export { upsertFaithExtension, getFaithExtension } from './repository.js';
export type { D1Like } from './repository.js';
