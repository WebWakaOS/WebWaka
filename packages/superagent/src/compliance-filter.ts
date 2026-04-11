/**
 * Compliance-Mode AI Filter — SA-4.5 / M12
 * WebWaka OS — Content filtering for sensitive/regulated sectors.
 *
 * Enforces content safety rules for verticals in regulated sectors:
 *   - Clinic / Hospital — No medical diagnoses, no prescription recommendations
 *   - Legal — No legal advice, liability disclaimers required
 *   - Politician / Political Party — INEC compliance, no inflammatory content
 *   - Pharmacy — NAFDAC compliance, no dosage recommendations
 *
 * Pre-processing:
 *   - PII detection and stripping (P13 enforcement)
 *   - Sensitive content flagging before AI call
 *
 * Post-processing:
 *   - Response safety check for regulated content
 *   - Mandatory disclaimers injection
 *
 * Platform Invariants:
 *   P10 — Consent already verified by aiConsentGate
 *   P13 — No raw PII passed to AI providers
 */

export type SensitiveSector = 'medical' | 'legal' | 'political' | 'pharmaceutical';

export interface ComplianceCheckResult {
  allowed: boolean;
  sector?: SensitiveSector;
  requiresHitl: boolean;
  hitlLevel?: 1 | 2 | 3 | undefined;
  warnings: string[];
  strippedPii: boolean;
  disclaimers: string[];
}

export interface PostProcessResult {
  content: string;
  flagged: boolean;
  flags: string[];
  disclaimers: string[];
}

const SENSITIVE_VERTICAL_MAP: Record<string, SensitiveSector> = {
  hospital: 'medical',
  clinic: 'medical',
  pharmacy: 'pharmaceutical',
  politician: 'political',
  'political-party': 'political',
  legal: 'legal',
  lawyer: 'legal',
  'law-firm': 'legal',
};

const PII_PATTERNS: Array<{ pattern: RegExp; label: string; replacement: string }> = [
  { pattern: /\b0[7-9]\d{9}\b/g, label: 'phone_number', replacement: '[PHONE_REDACTED]' },
  { pattern: /\b(?:\+?234)[0-9]{10}\b/g, label: 'phone_intl', replacement: '[PHONE_REDACTED]' },
  { pattern: /\b\d{11}\b/g, label: 'nin_like', replacement: '[NIN_REDACTED]' },
  { pattern: /\b\d{2}[- ]?\d{4}[- ]?\d{5}\b/g, label: 'bvn_like', replacement: '[BVN_REDACTED]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'email', replacement: '[EMAIL_REDACTED]' },
  { pattern: /\b(?:A|AA|AB|AD|AK|AN|BA|BY|BE|BO|CR|DE|EB|ED|EK|EN|GO|IM|JI|KD|KN|KO|KW|LA|NA|NI|OG|ON|OS|OY|PL|RI|SO|TA|YO|ZA|FC)[A-Z]{3}\d{5}[A-Z]{2}\b/gi, label: 'drivers_license', replacement: '[LICENSE_REDACTED]' },
];

const SECTOR_DISCLAIMERS: Record<SensitiveSector, string[]> = {
  medical: [
    'This AI-generated content is for informational purposes only and does not constitute medical advice.',
    'Consult a qualified healthcare professional before making health decisions.',
  ],
  legal: [
    'This AI-generated content is for informational purposes only and does not constitute legal advice.',
    'Consult a qualified legal practitioner licensed by the Nigerian Bar Association.',
  ],
  political: [
    'This AI-generated content is for informational purposes only.',
    'Political content must comply with INEC guidelines and Nigerian Electoral Act provisions.',
  ],
  pharmaceutical: [
    'This AI-generated content does not constitute pharmaceutical advice.',
    'All medications require proper NAFDAC-approved labeling and professional dispensing.',
  ],
};

const PROHIBITED_MEDICAL_PATTERNS = [
  /\bdiagnos(?:e|is|ed|ing)\b/i,
  /\bprescri(?:be|ption|bed|bing)\b/i,
  /\bdosage\s+(?:of|for|recommendation)\b/i,
  /\btake\s+\d+\s*(?:mg|ml|tablet|capsule)/i,
];

const PROHIBITED_LEGAL_PATTERNS = [
  /\byou\s+should\s+(?:sue|file|litigate)\b/i,
  /\byour?\s+(?:legal\s+)?rights?\s+(?:are|include)\b/i,
  /\bguarantee(?:d|s)?\s+(?:to\s+)?win\b/i,
];

const PROHIBITED_POLITICAL_PATTERNS = [
  /\bkill\b/i,
  /\bviolence\b/i,
  /\bincite\b/i,
  /\bhate\s+speech\b/i,
  /\bethnic\s+cleansing\b/i,
];

export function getSensitiveSector(vertical: string): SensitiveSector | null {
  return SENSITIVE_VERTICAL_MAP[vertical] ?? null;
}

export function isSensitiveVertical(vertical: string): boolean {
  return vertical in SENSITIVE_VERTICAL_MAP;
}

export function preProcessCheck(
  vertical: string,
  messages: Array<{ role: string; content: string }>,
  autonomyLevel: number,
): ComplianceCheckResult {
  const sector = getSensitiveSector(vertical);
  const warnings: string[] = [];
  let strippedPii = false;

  for (const msg of messages) {
    for (const { pattern, label } of PII_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(msg.content)) {
        warnings.push(`PII detected: ${label} in ${msg.role} message`);
        strippedPii = true;
      }
    }
  }

  if (!sector) {
    return {
      allowed: true,
      requiresHitl: false,
      warnings,
      strippedPii,
      disclaimers: [],
    };
  }

  const requiresHitl = autonomyLevel >= 2;
  let hitlLevel: 1 | 2 | 3 | undefined;
  if (requiresHitl) {
    hitlLevel = autonomyLevel >= 5 ? 3 : autonomyLevel >= 3 ? 2 : 1;
  }

  return {
    allowed: true,
    sector,
    requiresHitl,
    hitlLevel,
    warnings,
    strippedPii,
    disclaimers: SECTOR_DISCLAIMERS[sector] ?? [],
  };
}

export function stripPii(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function postProcessCheck(
  content: string,
  sector: SensitiveSector | null,
): PostProcessResult {
  const flags: string[] = [];
  const disclaimers: string[] = [];

  if (!sector) {
    return { content, flagged: false, flags, disclaimers };
  }

  disclaimers.push(...(SECTOR_DISCLAIMERS[sector] ?? []));

  let patterns: RegExp[] = [];
  switch (sector) {
    case 'medical':
      patterns = PROHIBITED_MEDICAL_PATTERNS;
      break;
    case 'legal':
      patterns = PROHIBITED_LEGAL_PATTERNS;
      break;
    case 'political':
      patterns = PROHIBITED_POLITICAL_PATTERNS;
      break;
    case 'pharmaceutical':
      patterns = PROHIBITED_MEDICAL_PATTERNS;
      break;
  }

  for (const p of patterns) {
    p.lastIndex = 0;
    if (p.test(content)) {
      flags.push(`Prohibited content pattern detected: ${p.source}`);
    }
  }

  return {
    content,
    flagged: flags.length > 0,
    flags,
    disclaimers,
  };
}
