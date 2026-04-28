/**
 * @webwaka/groups-cooperative — Public API
 *
 * Phase 2: Cooperative group extension (savings fund, loan fund integration).
 */

export type {
  GroupCooperativeExtension,
  UpsertCooperativeExtensionInput,
  UpdateFundBalanceInput,
  CoopType,
} from './types.js';

export { upsertCooperativeExtension, getCooperativeExtension, updateFundBalance } from './repository.js';
export type { D1Like } from './repository.js';
