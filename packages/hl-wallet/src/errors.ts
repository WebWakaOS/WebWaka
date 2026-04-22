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
  | 'WALLET_NOT_ACTIVE'
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
  | 'INVALID_WITHDRAWAL_STATE'
  | 'FUNDING_REQUEST_NOT_FOUND'
  | 'FUNDING_ALREADY_CONFIRMED'
  | 'FUNDING_NOT_FOUND'
  | 'SPEND_EVENT_NOT_FOUND'
  | 'MLA_EARNING_NOT_FOUND'
  | 'SELF_TRANSFER'
  | 'TRANSFER_FAILED'
  | 'TRANSFER_NOT_FOUND'
  | 'WITHDRAWAL_FAILED'
  | 'WITHDRAWAL_NOT_FOUND'
  | 'PAYSTACK_ERROR';

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
      WALLET_NOT_ACTIVE:           'Wallet is not active',
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
      INVALID_WITHDRAWAL_STATE:    'Withdrawal cannot be actioned in its current state',
      FUNDING_REQUEST_NOT_FOUND:   'Funding request not found',
      FUNDING_ALREADY_CONFIRMED:   'Funding request has already been confirmed',
      FUNDING_NOT_FOUND:           'Funding record not found for this reference',
      SPEND_EVENT_NOT_FOUND:       'Spend event not found',
      MLA_EARNING_NOT_FOUND:       'MLA earning record not found',
      SELF_TRANSFER:               'Cannot transfer funds to the same wallet',
      TRANSFER_FAILED:             'Transfer failed — please contact support',
      TRANSFER_NOT_FOUND:          'Transfer request not found',
      WITHDRAWAL_FAILED:           'Withdrawal failed — please contact support',
      WITHDRAWAL_NOT_FOUND:        'Withdrawal request not found',
      PAYSTACK_ERROR:              'Payment provider error — please try again',
    };

    const statusCodes: Record<WalletErrorCode, number> = {
      WALLET_NOT_FOUND:            404,
      WALLET_FROZEN:               403,
      WALLET_CLOSED:               403,
      WALLET_NOT_ACTIVE:           422,
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
      INVALID_WITHDRAWAL_STATE:    422,
      FUNDING_REQUEST_NOT_FOUND:   404,
      FUNDING_ALREADY_CONFIRMED:   409,
      FUNDING_NOT_FOUND:           404,
      SPEND_EVENT_NOT_FOUND:       404,
      MLA_EARNING_NOT_FOUND:       404,
      SELF_TRANSFER:               422,
      TRANSFER_FAILED:             500,
      TRANSFER_NOT_FOUND:          404,
      WITHDRAWAL_FAILED:           500,
      WITHDRAWAL_NOT_FOUND:        404,
      PAYSTACK_ERROR:              502,
    };

    super(message ?? defaultMessages[code]);
    this.name = 'WalletError';
    this.code = code;
    this.context = context;
    this.statusCode = statusCodes[code];
  }
}
