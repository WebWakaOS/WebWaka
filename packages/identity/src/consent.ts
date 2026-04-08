/**
 * Consent validation helpers for @webwaka/identity (M7a)
 * Platform Invariant P10: NDPR consent required before any identity lookup.
 * (docs/governance/data-residency-ndpr.md, docs/enhancements/m7/ndpr-consent.md)
 */

import { type ConsentRecord, type IdentityDocType, IdentityError } from './types.js';

/**
 * Assert that a valid, non-revoked consent record exists for the given data type.
 * Throws IdentityError if consent is missing or revoked.
 * Called at the start of every identity verification function (P10 enforcement).
 */
export function assertConsentExists(
  consent: ConsentRecord | undefined | null,
  dataType: IdentityDocType,
): asserts consent is ConsentRecord {
  if (!consent) {
    throw new IdentityError(
      'consent_missing',
      `NDPR consent for ${dataType} is required before performing identity verification (Platform Invariant P10).`,
    );
  }
  if (consent.revoked_at !== undefined && consent.revoked_at !== null) {
    throw new IdentityError(
      'consent_revoked',
      `User has revoked consent for ${dataType} data processing. Re-collect consent before proceeding.`,
    );
  }
}

/**
 * Hash a sensitive value (BVN, NIN, IP) for safe storage.
 * R7: Never store raw BVN/NIN. Only SHA-256(SALT + value).
 */
export async function hashPII(salt: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mask a phone number for safe logging.
 * R7: Only last 4 digits shown: ****1234
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return '****';
  return '****' + phone.slice(-4);
}

/**
 * Mask an email address for safe logging.
 * R7: Domain only: ****@gmail.com
 */
export function maskEmail(email: string): string {
  const atIdx = email.indexOf('@');
  if (atIdx < 0) return '****';
  return '****' + email.slice(atIdx);
}
