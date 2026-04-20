/**
 * @webwaka/hl-wallet — Domain types
 *
 * Platform Invariants:
 *   P9  — all monetary values in integer kobo (no floats, no REAL)
 *   T3  — tenant_id on all records and queries
 *   T4  — monetary integrity enforced by atomic conditional UPDATE
 *   T5  — wallet access gated by requireWalletEntitlement()
 *   T7  — wallet lifecycle managed via FSM with explicit transition guards
 *
 * Build Once Use Infinitely — this package has NO vertical-specific logic.
 * CBN KYC tiers (T0–T3) govern balance caps and daily transaction limits.
 */

export type WalletStatus = 'pending_kyc' | 'active' | 'frozen' | 'closed';
export type WalletKYCTier = 1 | 2 | 3;
export type LedgerEntryType = 'credit' | 'debit';

export type LedgerTxType =
  | 'bank_fund'
  | 'spend'
  | 'reversal'
  | 'mla_credit'
  | 'admin_adjust'
  | 'refund'
  | 'withdrawal_reserved'
  | 'transfer_out'
  | 'transfer_in';

export type FundingRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'expired' | 'reversed';
export type SpendEventStatus = 'reserved' | 'completed' | 'reversed' | 'failed';
export type MlaEarningStatus = 'pending' | 'payable' | 'credited' | 'voided';
export type WalletFeatureFlag = 'transfers' | 'withdrawals' | 'online_funding' | 'mla_payout';

export type WalletFSMState = WalletStatus;

export const WALLET_FSM_TRANSITIONS: Record<WalletFSMState, WalletFSMState[]> = {
  pending_kyc: ['active'],
  active:      ['frozen', 'closed'],
  frozen:      ['active', 'closed'],
  closed:      [],
};

export function isValidWalletTransition(from: WalletFSMState, to: WalletFSMState): boolean {
  return WALLET_FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface HlWallet {
  id: string;
  userId: string;
  tenantId: string;
  workspaceId: string;
  balanceKobo: number;
  lifetimeFundedKobo: number;
  lifetimeSpentKobo: number;
  kycTier: WalletKYCTier;
  status: WalletStatus;
  currencyCode: string;
  frozenReason: string | null;
  closedAt: number | null;
  closedReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface HlLedgerEntry {
  id: string;
  walletId: string;
  userId: string;
  tenantId: string;
  entryType: LedgerEntryType;
  amountKobo: number;
  balanceAfter: number;
  txType: LedgerTxType;
  reference: string;
  description: string;
  currencyCode: string;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: number;
}

export interface HlFundingRequest {
  id: string;
  walletId: string;
  userId: string;
  tenantId: string;
  bankTransferOrderId: string;
  amountKobo: number;
  status: FundingRequestStatus;
  ledgerEntryId: string | null;
  confirmedAt: number | null;
  confirmedBy: string | null;
  rejectionReason: string | null;
  hitlRequired: boolean;
  hitlQueueItemId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface HlSpendEvent {
  id: string;
  walletId: string;
  userId: string;
  tenantId: string;
  verticalSlug: string | null;
  orderId: string | null;
  orderType: string | null;
  amountKobo: number;
  status: SpendEventStatus;
  ledgerDebitId: string | null;
  ledgerRefundId: string | null;
  transactionsId: string | null;
  completedAt: number | null;
  reversedAt: number | null;
  reversalReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface HlMlaEarning {
  id: string;
  walletId: string;
  earnerUserId: string;
  tenantId: string;
  sourceVertical: string | null;
  sourceOrderId: string | null;
  sourceSpendEventId: string | null;
  referralLevel: 1 | 2 | 3;
  commissionBps: number;
  commissionKobo: number;
  baseAmountKobo: number;
  status: MlaEarningStatus;
  periodStart: string | null;
  periodEnd: string | null;
  ledgerEntryId: string | null;
  creditedAt: number | null;
  voidedAt: number | null;
  voidReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWalletInput {
  userId: string;
  tenantId: string;
  workspaceId: string;
  kycTier?: WalletKYCTier;
}

export interface CreditWalletInput {
  walletId: string;
  tenantId: string;
  amountKobo: number;
  txType: LedgerTxType;
  reference: string;
  description: string;
  relatedId?: string;
  relatedType?: string;
}

export interface DebitWalletInput {
  walletId: string;
  userId: string;
  tenantId: string;
  amountKobo: number;
  txType: LedgerTxType;
  reference: string;
  description: string;
  relatedId?: string;
  relatedType?: string;
}

export interface GetLedgerInput {
  walletId: string;
  tenantId: string;
  limit?: number;
  cursor?: string;
}

export interface WalletLimits {
  dailyLimitKobo: number;
  balanceCapKobo: number;
  singleTransferLimitKobo: number;
}
