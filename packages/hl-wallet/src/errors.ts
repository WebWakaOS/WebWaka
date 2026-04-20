/**
 * @webwaka/hl-wallet — WalletError class
 *
 * All wallet operations throw WalletError with a typed code.
 * API route handlers translate these codes to HTTP responses.
 */

export type WalletErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'WALLET_FROZEN'
  | 'WALLET_CLOSED'
  | 'WALLET_ALREADY_EXISTS'
  | 'INSUFFICIENT_BALANCE'
  | 'KYC_UPGRADE_REQUIRED'
  | 'FEATURE_DISABLED'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'BALANCE_CAP_EXCEEDED'
  | 'TENANT_NOT_ELIGIBLE'
  | 'CONSENT_REQUIRED'
  | 'IDEMPOTENT_REFERENCE_EXISTS'
  | 'INVALID_AMOUNT'
  | 'INVALID_FSM_TRANSITION'
  | 'FUNDING_REQUEST_NOT_FOUND'
  | 'FUNDING_ALREADY_CONFIRMED'
  | 'SPEND_EVENT_NOT_FOUND'
  | 'MLA_EARNING_NOT_FOUND';

export class WalletError extends Error {
  readonly code: WalletErrorCode;
  readonly context: Record<string, unknown>;
  readonly statusCode: number;

  constructor(
    code: WalletErrorCode,
    context: Record<string, unknown> = {},
    message?: string,
  ) {
    const defaultMessages: Record<WalletErrorCode, string> = {
      WALLET_NOT_FOUND:            'Wallet not found',
      WALLET_FROZEN:               'Wallet is frozen and cannot be used',
      WALLET_CLOSED:               'Wallet is permanently closed',
      WALLET_ALREADY_EXISTS:       'A wallet already exists for this user in this tenant',
      INSUFFICIENT_BALANCE:        'Insufficient wallet balance',
      KYC_UPGRADE_REQUIRED:        'KYC tier upgrade required for this operation',
      FEATURE_DISABLED:            'This wallet feature is not yet available',
      DAILY_LIMIT_EXCEEDED:        'CBN daily transaction limit exceeded',
      BALANCE_CAP_EXCEEDED:        'CBN balance cap would be exceeded',
      TENANT_NOT_ELIGIBLE:         'Your account is not eligible for HandyLife Wallet',
      CONSENT_REQUIRED:            'Payment data consent required to use wallet',
      IDEMPOTENT_REFERENCE_EXISTS: 'This reference has already been processed',
      INVALID_AMOUNT:              'Amount must be a positive integer in kobo (P9)',
      INVALID_FSM_TRANSITION:      'Invalid wallet state transition',
      FUNDING_REQUEST_NOT_FOUND:   'Funding request not found',
      FUNDING_ALREADY_CONFIRMED:   'Funding request has already been confirmed',
      SPEND_EVENT_NOT_FOUND:       'Spend event not found',
      MLA_EARNING_NOT_FOUND:       'MLA earning record not found',
    };

    const statusCodes: Record<WalletErrorCode, number> = {
      WALLET_NOT_FOUND:            404,
      WALLET_FROZEN:               403,
      WALLET_CLOSED:               403,
      WALLET_ALREADY_EXISTS:       409,
      INSUFFICIENT_BALANCE:        422,
      KYC_UPGRADE_REQUIRED:        403,
      FEATURE_DISABLED:            503,
      DAILY_LIMIT_EXCEEDED:        422,
      BALANCE_CAP_EXCEEDED:        422,
      TENANT_NOT_ELIGIBLE:         403,
      CONSENT_REQUIRED:            403,
      IDEMPOTENT_REFERENCE_EXISTS: 409,
      INVALID_AMOUNT:              422,
      INVALID_FSM_TRANSITION:      422,
      FUNDING_REQUEST_NOT_FOUND:   404,
      FUNDING_ALREADY_CONFIRMED:   409,
      SPEND_EVENT_NOT_FOUND:       404,
      MLA_EARNING_NOT_FOUND:       404,
    };

    super(message ?? defaultMessages[code]);
    this.name = 'WalletError';
    this.code = code;
    this.context = context;
    this.statusCode = statusCodes[code];
  }
}
