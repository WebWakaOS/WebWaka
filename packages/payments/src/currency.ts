/**
 * Currency utilities — MED-014 (PROD-06) — P6-D
 *
 * Canonical shared currency formatting and validation for WebWaka OS.
 * All amounts use Nigerian Naira (NGN) in integer kobo.
 *
 * Platform Invariant P9: amounts are always INTEGER kobo. Never floats.
 * Governance: docs/governance/currency-policy.md
 *
 * BUG-043: formatNaira compact display uses '~' prefix for approximate values.
 * TST-003: formatNaira ↔ parseNairaInput must round-trip within 1 kobo.
 */

export type CurrencyCode = 'NGN';

const KOBO_PER_NAIRA = 100;

/**
 * Format an integer kobo amount as a Naira string.
 * When opts.compact is true, large values are shortened (e.g. ~₦1.2M, ~₦500.0K).
 * The '~' prefix signals that compact display is rounded/approximate.
 * P9: kobo MUST be an integer — non-integers are rounded before display.
 */
export function formatNaira(kobo: number, opts?: { compact?: boolean }): string {
  const naira = kobo / KOBO_PER_NAIRA;
  if (opts?.compact && naira >= 1_000_000) {
    const exactM = naira / 1_000_000;
    const formatted = exactM.toFixed(1);
    const prefix = Number(formatted) === exactM ? '' : '~';
    return `${prefix}₦${formatted}M`; // DISPLAY_ONLY — BUG-043 compact display string, not a stored value
  }
  if (opts?.compact && naira >= 1_000) {
    const exactK = naira / 1_000;
    const formatted = exactK.toFixed(1);
    const prefix = Number(formatted) === exactK ? '' : '~';
    return `${prefix}₦${formatted}K`; // DISPLAY_ONLY — BUG-043 compact display string, not a stored value
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(naira);
}

/**
 * Parse a user-entered Naira string back to an integer kobo amount.
 * Strips ₦, commas, spaces, and the compact approximation prefix '~'.
 * Always returns an integer (P9 invariant). Returns 0 for invalid input.
 */
export function parseNairaInput(value: string): number {
  const cleaned = value.replace(/[~₦,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * KOBO_PER_NAIRA);
}

const SUPPORTED_CURRENCIES: readonly string[] = ['NGN'];

export interface CurrencyValidationResult {
  valid: boolean;
  error?: string;
  currencyCode: string;
  amountKobo: number;
}

/**
 * Validates that the currency and amount conform to platform rules.
 *
 * @param amountKobo  Amount in the smallest unit (kobo for NGN). Must be a
 *                    positive integer (P9 invariant).
 * @param currency    ISO 4217 currency code (e.g. 'NGN').
 * @returns           Validation result with error details if invalid.
 */
export function validateCurrency(
  amountKobo: number,
  currency: string,
): CurrencyValidationResult {
  // P9: Amount must be a positive integer
  if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
    return {
      valid: false,
      error: `amountKobo must be a positive integer (P9 invariant). Received: ${amountKobo}`,
      currencyCode: currency,
      amountKobo,
    };
  }

  // Multi-currency not yet enabled
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    return {
      valid: false,
      error: `Multi-currency not yet enabled for this workspace — contact support. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`,
      currencyCode: currency,
      amountKobo,
    };
  }

  return { valid: true, currencyCode: currency, amountKobo };
}
