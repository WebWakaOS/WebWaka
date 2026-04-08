/**
 * CAC (Corporate Affairs Commission) business verification via Prembly (M7a)
 * (docs/identity/frsc-cac-integration.md, docs/governance/entitlement-model.md)
 *
 * CAC RC number format: RC-XXXXXXX or BN-XXXXXXX
 * Used for organization claim verification and KYC Tier 3 (entity-level).
 * P10: Consent required (data_type = 'CAC').
 */

import { type CACVerifyResult, type ConsentRecord, type IdentityEnv, IdentityError } from './types.js';
import { assertConsentExists } from './consent.js';

const PREMBLY_BASE = 'https://api.prembly.com/identitypass/verification';

const RC_NUMBER_RE = /^(RC|BN)-?\d{5,7}$/i;

interface PremblyCACResponse {
  status: boolean;
  detail: string;
  response_code: string;
  cac_data?: {
    company_name: string;
    rc_number: string;
    registration_status: string;
    registration_date: string;
  };
}

/**
 * Verify a CAC registration number using Prembly.
 *
 * @param rcNumber - CAC RC number (e.g. "RC-1234567" or "1234567")
 * @param consent - Active consent record for data_type='CAC' (P10)
 * @param env - Worker environment with PREMBLY_API_KEY
 */
export async function verifyCAC(
  rcNumber: string,
  consent: ConsentRecord,
  env: Pick<IdentityEnv, 'PREMBLY_API_KEY'>,
): Promise<CACVerifyResult> {
  assertConsentExists(consent, 'CAC');

  const normalized = rcNumber.replace(/\s/g, '').toUpperCase();
  const cleanNumber = normalized.startsWith('RC-')
    ? normalized.slice(3)
    : normalized.startsWith('BN-')
    ? normalized.slice(3)
    : normalized;

  const res = await fetch(`${PREMBLY_BASE}/business/cac`, {
    method: 'POST',
    headers: { 'x-api-key': env.PREMBLY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rc_number: cleanNumber }),
  });

  if (res.status >= 500) {
    throw new IdentityError('provider_error', `Prembly CAC returned ${res.status}`);
  }

  const body = await res.json() as PremblyCACResponse;

  if (!body.status || !body.cac_data) {
    throw new IdentityError('cac_not_found', body.detail || 'CAC RC number not found');
  }

  const d = body.cac_data;

  return {
    verified: true,
    company_name: d.company_name,
    rc_number: d.rc_number,
    status: d.registration_status.toLowerCase() === 'active' ? 'active' : 'inactive',
    registration_date: d.registration_date,
    provider: 'prembly',
  };
}

/**
 * Validate the format of a CAC RC number.
 * Returns the normalized form or null if invalid.
 */
export function validateCACNumber(rcNumber: string): string | null {
  const trimmed = rcNumber.trim().toUpperCase().replace(/\s/g, '');
  if (RC_NUMBER_RE.test(trimmed)) return trimmed;
  if (/^\d{5,7}$/.test(trimmed)) return 'RC-' + trimmed;
  return null;
}
