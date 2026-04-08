/**
 * FRSC (Federal Road Safety Corps) operator/vehicle validation via Prembly (M7a)
 * (docs/identity/frsc-cac-integration.md, docs/community/community-model.md)
 *
 * Required for transport vertical: motor park operators, route managers.
 * P10: Consent required (data_type = 'FRSC').
 * Agent Rule: POS agents handling transport must be Tier 3 KYC.
 */

import { type FRSCVerifyResult, type ConsentRecord, type IdentityEnv, IdentityError } from './types.js';
import { assertConsentExists } from './consent.js';

const PREMBLY_BASE = 'https://api.prembly.com/identitypass/verification';

interface PremblyFRSCResponse {
  status: boolean;
  detail: string;
  response_code: string;
  frsc_data?: {
    full_name: string;
    license_number: string;
    expiry_date: string;
    vehicle_class: string | string[];
    status: string;
  };
}

/**
 * Verify an FRSC driving license via Prembly.
 *
 * @param licenseNumber - FRSC license number
 * @param consent - Active consent record for data_type='FRSC' (P10)
 * @param env - Worker environment with PREMBLY_API_KEY
 */
export async function verifyFRSC(
  licenseNumber: string,
  consent: ConsentRecord,
  env: Pick<IdentityEnv, 'PREMBLY_API_KEY'>,
): Promise<FRSCVerifyResult> {
  assertConsentExists(consent, 'FRSC');

  if (!licenseNumber || licenseNumber.trim().length < 5) {
    throw new IdentityError('frsc_not_found', 'Invalid FRSC license number format.');
  }

  const res = await fetch(`${PREMBLY_BASE}/government-data/frsc`, {
    method: 'POST',
    headers: { 'x-api-key': env.PREMBLY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_number: licenseNumber.trim() }),
  });

  if (res.status >= 500) {
    throw new IdentityError('provider_error', `Prembly FRSC returned ${res.status}`);
  }

  const body = await res.json() as PremblyFRSCResponse;

  if (!body.status || !body.frsc_data) {
    throw new IdentityError('frsc_not_found', body.detail || 'FRSC license not found');
  }

  const d = body.frsc_data;
  const vehicleClass = Array.isArray(d.vehicle_class)
    ? d.vehicle_class
    : [d.vehicle_class].filter(Boolean);

  const statusNorm = d.status?.toLowerCase();
  const status: FRSCVerifyResult['status'] =
    statusNorm === 'valid' ? 'valid' : statusNorm === 'suspended' ? 'suspended' : 'expired';

  return {
    verified: status === 'valid',
    full_name: d.full_name,
    license_number: d.license_number,
    expiry_date: d.expiry_date,
    vehicle_class: vehicleClass,
    status,
    provider: 'prembly',
  };
}
