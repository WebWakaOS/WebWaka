/**
 * @webwaka/groups-civic — Public API
 *
 * Phase 2: Civic group extension (NGO governance, beneficiary tracking).
 */

export type {
  GroupCivicExtension,
  BeneficiaryRecord,
  UpsertCivicExtensionInput,
  AddBeneficiaryInput,
  BeneficiaryCategory,
  BeneficiaryStatus,
} from './types.js';

export {
  upsertCivicExtension,
  getCivicExtension,
  addBeneficiary,
  listBeneficiaries,
  getBeneficiaryCount,
} from './repository.js';

export type { D1Like } from './repository.js';
