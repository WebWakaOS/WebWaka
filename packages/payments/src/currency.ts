/**
 * Currency validation stub — MED-014 (PROD-06) — P6-D
 *
 * Forward-compatibility stub for multi-currency support.
 * All current WebWaka OS operations use Nigerian Naira (NGN) in integer kobo.
 *
 * When multi-currency is enabled (future), this function will:
 * 1. Validate the currency code against the workspace's approved currencies
 * 2. Apply the appropriate conversion rate
 * 3. Return the amount in the settlement currency
 *
 * Platform Invariant P9: amounts are always INTEGER kobo. Never floats.
 * Governance: docs/governance/currency-policy.md (forward-compat stub)
 */

export type CurrencyCode = 'NGN';

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
