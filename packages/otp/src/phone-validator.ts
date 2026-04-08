/**
 * Nigerian phone number validation and normalization (M7a)
 * Supports all major Nigerian carriers: MTN, Airtel, Glo, 9mobile.
 * Output format: E.164 (+234XXXXXXXXXX)
 */

import { type PhoneValidationResult } from './types.js';

const MTN_PREFIXES = ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','07025','07026','0704'];
const AIRTEL_PREFIXES = ['0701','0708','0802','0808','0812','0902','0907','0901'];
const GLO_PREFIXES = ['0705','0805','0807','0811','0815','0905','0915'];
const NINEMOBILE_PREFIXES = ['0809','0817','0818','0908','0909'];

/**
 * Validate and normalize a Nigerian phone number to E.164 format.
 * Accepts: 080XXXXXXXX, +234XXXXXXXXXX, 234XXXXXXXXXX
 */
export function validateNigerianPhone(raw: string): PhoneValidationResult {
  const stripped = raw.replace(/[\s\-().+]/g, '');

  let local: string;

  if (stripped.startsWith('234') && stripped.length === 13) {
    local = '0' + stripped.slice(3);
  } else if (stripped.startsWith('0') && stripped.length === 11) {
    local = stripped;
  } else if (stripped.length === 10 && /^\d{10}$/.test(stripped)) {
    local = '0' + stripped;
  } else {
    return { valid: false, normalized: raw, carrier: 'unknown' };
  }

  if (!/^0\d{10}$/.test(local)) {
    return { valid: false, normalized: raw, carrier: 'unknown' };
  }

  const normalized = '+234' + local.slice(1);
  const carrier = detectCarrier(local);

  return { valid: true, normalized, carrier };
}

function detectCarrier(local: string): NonNullable<PhoneValidationResult['carrier']> {
  const prefix4 = local.slice(0, 4);
  const prefix5 = local.slice(0, 5);

  if (MTN_PREFIXES.includes(prefix5) || MTN_PREFIXES.includes(prefix4)) return 'mtn';
  if (AIRTEL_PREFIXES.includes(prefix4)) return 'airtel';
  if (GLO_PREFIXES.includes(prefix4)) return 'glo';
  if (NINEMOBILE_PREFIXES.includes(prefix4)) return '9mobile';
  return 'unknown';
}
