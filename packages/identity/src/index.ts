/**
 * @webwaka/identity — Nigerian identity verification package (M7a)
 *
 * Implements NIN/BVN/CAC/FRSC verification via Prembly (primary) + Paystack (BVN fallback).
 *
 * ALL lookups require a ConsentRecord (Platform Invariant P10 — NDPR).
 * BVN/NIN values must NEVER be logged (Security Baseline R7).
 *
 * Usage:
 *   import { verifyBVN, verifyNIN, verifyCAC, verifyFRSC, assertConsentExists } from '@webwaka/identity';
 */

export { verifyBVN } from './bvn.js';
export { verifyNIN } from './nin.js';
export { verifyCAC, validateCACNumber } from './cac.js';
export { verifyFRSC } from './frsc.js';
export { assertConsentExists, hashPII, maskPhone, maskEmail } from './consent.js';

export type {
  BVNVerifyResult,
  NINVerifyResult,
  CACVerifyResult,
  FRSCVerifyResult,
  KYCRecord,
  KYCTier,
  VerificationStatus,
  IdentityDocType,
  IdentityProviderName,
  ConsentRecord,
  IdentityEnv,
} from './types.js';

export { IdentityError } from './types.js';
