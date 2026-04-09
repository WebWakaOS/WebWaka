/**
 * SuperAgent internal types.
 * (SA-1.4 — TDR-0009)
 *
 * All domain types for the SuperAgent cross-cutting AI layer.
 * Platform Invariants: P9 (integer kobo/WakaCU), P10 (NDPR consent),
 * P12 (no AI on USSD), P13 (no raw PII to AI).
 */

// ---------------------------------------------------------------------------
// SuperAgent key tiers (matching the 5-level routing chain)
// ---------------------------------------------------------------------------

export type SuperAgentKeyScope = 'user' | 'workspace';
export type SuperAgentKeyProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'byok_custom';

export interface SuperAgentKey {
  id: string;
  tenantId: string;
  /** user = level-1 (personal BYOK), workspace = level-2 (operator BYOK) */
  scope: SuperAgentKeyScope;
  /** null for workspace-scoped keys */
  userId: string | null;
  provider: SuperAgentKeyProvider;
  /** Encrypted ciphertext — never returned to clients */
  encryptedKey: string;
  /** Last 4 chars of the actual key — safe to display */
  keyHint: string;
  createdAt: string;
  revokedAt: string | null;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// WakaCU wallet
// ---------------------------------------------------------------------------

/**
 * WakaCU wallet row (workspace-level). P9: all amounts are integers.
 */
export interface WakaCuWallet {
  tenantId: string;
  balanceWakaCu: number;        // integer — current spendable balance
  lifetimePurchasedWakaCu: number; // integer
  lifetimeSpentWakaCu: number;     // integer
  spendCapMonthlyWakaCu: number;   // 0 = unlimited (partner/enterprise)
  currentMonthSpentWakaCu: number; // integer
  spendCapResetAt: string;         // ISO date — first day of next month
  updatedAt: string;
}

export interface WakaCuTransaction {
  id: string;
  tenantId: string;
  /** credit = top-up, debit = spend, refund, adjustment */
  type: 'credit' | 'debit' | 'refund' | 'adjustment';
  amountWakaCu: number;        // integer, positive for credit, negative for debit
  balanceAfterWakaCu: number;  // integer — running balance snapshot
  description: string;
  referenceId: string | null;  // AI usage event ID for debits
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Partner credit pool
// ---------------------------------------------------------------------------

export interface PartnerCreditPool {
  id: string;
  partnerTenantId: string;
  /** Sub-partner or customer tenant receiving subsidised credits */
  beneficiaryTenantId: string;
  allocatedWakaCu: number;  // integer — total allocated to beneficiary
  usedWakaCu: number;       // integer — consumed so far
  expiresAt: string | null; // null = no expiry
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Usage event (metered, stored in ai_usage_events — migration 0045)
// ---------------------------------------------------------------------------

export interface AiUsageEvent {
  id: string;
  tenantId: string;
  userId: string | null;
  /** 1 = Ops, 2 = Branding, 3 = Marketplace */
  pillar: 1 | 2 | 3;
  capability: string;       // AICapabilityType value
  provider: string;         // AIProvider value
  model: string;
  inputTokens: number;      // integer
  outputTokens: number;     // integer
  totalTokens: number;      // integer
  wakaCuCharged: number;    // integer (P9)
  routingLevel: 1 | 2 | 3 | 4 | 5;
  durationMs: number;       // integer
  finishReason: string;
  ndprConsentRef: string | null; // P10 — consent record ID
  createdAt: string;
}
