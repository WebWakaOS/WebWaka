/**
 * BVN (Bank Verification Number) verification via Prembly/Paystack (M7a)
 * (docs/identity/bvn-nin-guide.md, docs/governance/entitlement-model.md#cbn-kyc-tiers)
 *
 * Rules:
 *   - R7: BVN value NEVER logged — use hashPII for deduplication only
 *   - P10: assertConsentExists must be called before any BVN lookup
 *   - Rate limit: max 2 BVN lookups per user per hour (R5)
 *   - Prembly primary; Paystack Identity as fallback on 5xx
 */

import { type BVNVerifyResult, type ConsentRecord, type IdentityEnv, IdentityError } from './types.js';
import { assertConsentExists } from './consent.js';

const PREMBLY_BASE = 'https://api.prembly.com/identitypass/verification';
const PAYSTACK_BVN_URL = 'https://api.paystack.co/bank/resolve_bvn';

interface PremblyBVNResponse {
  status: boolean;
  detail: string;
  response_code: string;
  bvn_data?: {
    full_name: string;
    phone_number: string;
    date_of_birth: string;
    gender: string;
  };
}

interface PaystackBVNResponse {
  status: boolean;
  message: string;
  data?: {
    first_name: string;
    last_name: string;
    dob: string;
    mobile: string;
  };
}

/**
 * Verify a BVN using Prembly (primary) with Paystack fallback.
 *
 * @param bvn - 11-digit BVN string (NEVER stored after verification)
 * @param consent - Active consent record for data_type='BVN' (P10)
 * @param userPhone - User's registered phone for phone_match check
 * @param env - Worker environment with PREMBLY_API_KEY and PAYSTACK_SECRET_KEY
 */
export async function verifyBVN(
  bvn: string,
  consent: ConsentRecord,
  userPhone: string,
  env: IdentityEnv,
): Promise<BVNVerifyResult> {
  assertConsentExists(consent, 'BVN');

  if (!/^\d{11}$/.test(bvn)) {
    throw new IdentityError('bvn_not_found', 'BVN must be exactly 11 digits.');
  }

  try {
    return await verifyBVNPrembly(bvn, userPhone, env.PREMBLY_API_KEY);
  } catch (err) {
    if (err instanceof IdentityError && err.code === 'provider_error') {
      if (!env.PAYSTACK_SECRET_KEY) {
        throw new IdentityError('provider_error', 'Prembly BVN check failed and Paystack fallback is not configured (PAYSTACK_SECRET_KEY absent).');
      }
      return await verifyBVNPaystack(bvn, userPhone, env.PAYSTACK_SECRET_KEY);
    }
    throw err;
  }
}

async function verifyBVNPrembly(
  bvn: string,
  userPhone: string,
  apiKey: string,
): Promise<BVNVerifyResult> {
  const res = await fetch(`${PREMBLY_BASE}/biometric/bvn`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: bvn }),
  });

  if (res.status >= 500) {
    throw new IdentityError('provider_error', `Prembly BVN returned ${res.status}`);
  }

  const body = await res.json() as PremblyBVNResponse;

  if (!body.status || !body.bvn_data) {
    const code = body.response_code === 'BVN_NOT_FOUND' ? 'bvn_not_found' : 'bvn_mismatch';
    throw new IdentityError(code, body.detail || 'BVN verification failed');
  }

  const d = body.bvn_data;
  const normalizedBVNPhone = normalizePhone(d.phone_number ?? '');
  const normalizedUserPhone = normalizePhone(userPhone);

  return {
    verified: true,
    full_name: d.full_name,
    phone_match: normalizedBVNPhone === normalizedUserPhone,
    provider: 'prembly',
  };
}

async function verifyBVNPaystack(
  bvn: string,
  userPhone: string,
  secretKey: string,
): Promise<BVNVerifyResult> {
  const res = await fetch(`${PAYSTACK_BVN_URL}/${bvn}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) {
    throw new IdentityError('provider_error', `Paystack BVN returned ${res.status}`);
  }

  const body = await res.json() as PaystackBVNResponse;

  if (!body.status || !body.data) {
    throw new IdentityError('bvn_not_found', body.message || 'BVN not found via Paystack');
  }

  const d = body.data;
  const fullName = [d.first_name, d.last_name].filter(Boolean).join(' ');
  const normalizedBVNPhone = normalizePhone(d.mobile ?? '');
  const normalizedUserPhone = normalizePhone(userPhone);

  return {
    verified: true,
    full_name: fullName,
    phone_match: normalizedBVNPhone === normalizedUserPhone,
    provider: 'paystack',
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return '+' + digits;
  if (digits.startsWith('0') && digits.length === 11) return '+234' + digits.slice(1);
  if (digits.length === 10) return '+234' + digits;
  return '+' + digits;
}
