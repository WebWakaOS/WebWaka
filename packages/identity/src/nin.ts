/**
 * NIN (National Identification Number) verification via Prembly (M7a)
 * (docs/identity/bvn-nin-guide.md, docs/governance/entitlement-model.md#cbn-kyc-tiers)
 *
 * Rules:
 *   - R7: NIN value NEVER logged — use hashPII for deduplication only
 *   - P10: assertConsentExists must be called before any NIN lookup
 *   - Rate limit: max 2 NIN lookups per user per hour (R5)
 *   - Prembly primary; NIMC gateway as fallback
 */

import { type NINVerifyResult, type ConsentRecord, type IdentityEnv, IdentityError } from './types.js';
import { assertConsentExists } from './consent.js';

const PREMBLY_BASE = 'https://api.prembly.com/identitypass/verification';

interface PremblyNINResponse {
  status: boolean;
  detail: string;
  response_code: string;
  nin_data?: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    gender: string;
    date_of_birth: string;
  };
}

/**
 * Verify a NIN using Prembly.
 *
 * @param nin - 11-digit NIN string (NEVER stored after verification)
 * @param consent - Active consent record for data_type='NIN' (P10)
 * @param env - Worker environment with PREMBLY_API_KEY
 */
export async function verifyNIN(
  nin: string,
  consent: ConsentRecord,
  env: Pick<IdentityEnv, 'PREMBLY_API_KEY'>,
): Promise<NINVerifyResult> {
  assertConsentExists(consent, 'NIN');

  if (!/^\d{11}$/.test(nin)) {
    throw new IdentityError('nin_not_found', 'NIN must be exactly 11 digits.');
  }

  const res = await fetch(`${PREMBLY_BASE}/government-data/nin`, {
    method: 'POST',
    headers: { 'x-api-key': env.PREMBLY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: nin }),
  });

  if (res.status >= 500) {
    throw new IdentityError('provider_error', `Prembly NIN returned ${res.status}`);
  }

  const body = await res.json() as PremblyNINResponse;

  if (!body.status || !body.nin_data) {
    const code = body.response_code === 'NIN_NOT_FOUND' ? 'nin_not_found' : 'nin_mismatch';
    throw new IdentityError(code, body.detail || 'NIN verification failed');
  }

  const d = body.nin_data;
  const fullName = [d.first_name, d.middle_name, d.last_name].filter(Boolean).join(' ');

  return {
    verified: true,
    full_name: fullName,
    gender: d.gender,
    dob: d.date_of_birth,
    provider: 'prembly',
  };
}
