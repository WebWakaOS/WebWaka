/**
 * Identity verification types for @webwaka/identity (M7a)
 * (docs/identity/bvn-nin-guide.md, docs/governance/entitlement-model.md#cbn-kyc-tiers)
 * R7: BVN/NIN values never stored or logged in plain text.
 */

export type KYCTier = 't0' | 't1' | 't2' | 't3';

export type VerificationStatus = 'verified' | 'failed' | 'pending';

export type IdentityDocType = 'BVN' | 'NIN' | 'CAC' | 'FRSC';

export type IdentityProviderName =
  | 'prembly'
  | 'paystack'
  | 'smile_id'
  | 'youverify'
  | 'nimc'
  | 'manual';

export interface ConsentRecord {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly data_type: IdentityDocType | 'phone' | 'email' | 'community_membership' | 'payment_data' | 'location';
  readonly purpose: string;
  readonly consented_at: number;
  readonly revoked_at?: number;
}

export interface BVNVerifyResult {
  readonly verified: boolean;
  readonly full_name: string;
  readonly phone_match: boolean;
  readonly dob_match?: boolean;
  readonly face_match_score?: number;
  readonly provider: 'prembly' | 'paystack';
}

export interface NINVerifyResult {
  readonly verified: boolean;
  readonly full_name: string;
  readonly gender: string;
  readonly dob: string;
  readonly face_match_score?: number;
  readonly provider: 'prembly' | 'nimc';
}

export interface CACVerifyResult {
  readonly verified: boolean;
  readonly company_name: string;
  readonly rc_number: string;
  readonly status: 'active' | 'inactive';
  readonly registration_date: string;
  readonly provider: 'prembly';
}

export interface FRSCVerifyResult {
  readonly verified: boolean;
  readonly full_name: string;
  readonly license_number: string;
  readonly expiry_date: string;
  readonly vehicle_class: readonly string[];
  readonly status: 'valid' | 'expired' | 'suspended';
  readonly provider: 'prembly';
}

export interface KYCRecord {
  readonly workspace_id: string;
  readonly tenant_id: string;
  readonly user_id: string;
  readonly record_type: IdentityDocType;
  readonly provider: IdentityProviderName;
  readonly reference_id?: string;
  readonly status: VerificationStatus;
  readonly verified_at?: number;
  readonly raw_response_hash?: string;
}

export interface IdentityEnv {
  readonly PREMBLY_API_KEY: string;
  readonly PAYSTACK_SECRET_KEY: string;
  readonly LOG_PII_SALT: string;
}

export class IdentityError extends Error {
  constructor(
    readonly code:
      | 'bvn_not_found'
      | 'bvn_mismatch'
      | 'nin_not_found'
      | 'nin_mismatch'
      | 'cac_not_found'
      | 'frsc_not_found'
      | 'consent_missing'
      | 'consent_revoked'
      | 'rate_limit_exceeded'
      | 'provider_error',
    message: string,
  ) {
    super(message);
    this.name = 'IdentityError';
  }
}
