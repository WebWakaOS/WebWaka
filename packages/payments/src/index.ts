/**
 * @webwaka/payments — Paystack integration + subscription sync.
 * Milestone 6 — Payments Layer
 */

export type {
  ProviderConfig,
  PaymentIntent,
  InitializedPayment,
  BillingRecord,
  VerifiedPayment,
  PaystackWebhookEvent,
} from './types.js';

export {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  PaystackError,
} from './paystack.js';

export {
  syncPaymentToSubscription,
  recordFailedPayment,
} from './subscription-sync.js';

export {
  validateCurrency,
  formatNaira,
  parseNairaInput,
} from './currency.js';
export type { CurrencyCode, CurrencyValidationResult } from './currency.js';
