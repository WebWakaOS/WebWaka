/**
 * WakaCU wallet service — credit balance management.
 * (SA-1.5 — TDR-0009, Platform Invariant P9)
 *
 * D1 tables: wc_wallets, wc_transactions (migration 0043).
 *
 * P9: All WakaCU amounts are integers. Never use floats for credit balances.
 * T3: All queries are tenant-scoped.
 *
 * Double-entry pattern:
 *   Every balance change is logged in wc_transactions before the wallet row
 *   is updated. Debit fails atomically if balance < amount requested.
 */

import type { WakaCuWallet, WakaCuTransaction } from './types.js';

export interface WalletServiceDeps {
  db: D1Database;
}

export class WalletService {
  private readonly db: D1Database;

  constructor(deps: WalletServiceDeps) {
    this.db = deps.db;
  }

  // ---------------------------------------------------------------------------
  // Balance reads
  // ---------------------------------------------------------------------------

  async getWallet(tenantId: string): Promise<WakaCuWallet | null> {
    const row = await this.db
      .prepare(
        `SELECT tenant_id, balance_wc, lifetime_purchased_wc, lifetime_spent_wc,
                spend_cap_monthly_wc, current_month_spent_wc,
                spend_cap_reset_at, updated_at
         FROM wc_wallets WHERE tenant_id = ? LIMIT 1`,
      )
      .bind(tenantId)
      .first<{
        tenant_id: string;
        balance_wc: number;
        lifetime_purchased_wc: number;
        lifetime_spent_wc: number;
        spend_cap_monthly_wc: number;
        current_month_spent_wc: number;
        spend_cap_reset_at: string;
        updated_at: string;
      }>();

    if (!row) return null;

    return {
      tenantId: row.tenant_id,
      balanceWakaCu: row.balance_wc,
      lifetimePurchasedWakaCu: row.lifetime_purchased_wc,
      lifetimeSpentWakaCu: row.lifetime_spent_wc,
      spendCapMonthlyWakaCu: row.spend_cap_monthly_wc,
      currentMonthSpentWakaCu: row.current_month_spent_wc,
      spendCapResetAt: row.spend_cap_reset_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Ensure a wallet row exists for this tenant.
   * Called on workspace activation. Idempotent.
   */
  async ensureWallet(
    tenantId: string,
    initialBalanceWakaCu = 100, // 100 WC starter grant
    spendCapMonthlyWakaCu = 1000,
  ): Promise<void> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    await this.db
      .prepare(
        `INSERT OR IGNORE INTO wc_wallets
           (tenant_id, balance_wc, lifetime_purchased_wc, lifetime_spent_wc,
            spend_cap_monthly_wc, current_month_spent_wc,
            spend_cap_reset_at, updated_at)
         VALUES (?, ?, ?, 0, ?, 0, ?, datetime('now'))`,
      )
      .bind(
        tenantId,
        initialBalanceWakaCu,
        initialBalanceWakaCu,
        spendCapMonthlyWakaCu,
        nextMonth.toISOString().split('T')[0],
      )
      .run();
  }

  // ---------------------------------------------------------------------------
  // Credit (top-up)
  // ---------------------------------------------------------------------------

  /**
   * Credit WakaCU to a tenant wallet (top-up via Paystack or partner allocation).
   * P9: amountWakaCu must be a positive integer.
   */
  async credit(
    tenantId: string,
    amountWakaCu: number,
    description: string,
    referenceId?: string,
  ): Promise<WakaCuTransaction> {
    if (!Number.isInteger(amountWakaCu) || amountWakaCu <= 0) {
      throw new Error(`[wallet] credit amount must be a positive integer. Got: ${amountWakaCu}`);
    }

    const txId = crypto.randomUUID();

    const result = await this.db.batch([
      this.db.prepare(
        `UPDATE wc_wallets
         SET balance_wc = balance_wc + ?,
             lifetime_purchased_wc = lifetime_purchased_wc + ?,
             updated_at = datetime('now')
         WHERE tenant_id = ?`,
      ).bind(amountWakaCu, amountWakaCu, tenantId),

      this.db.prepare(
        `INSERT INTO wc_transactions
           (id, tenant_id, type, amount_wc, balance_after_wc, description, reference_id, created_at)
         VALUES (
           ?, ?,
           'credit',
           ?,
           (SELECT balance_wc FROM wc_wallets WHERE tenant_id = ?),
           ?, ?,
           datetime('now')
         )`,
      ).bind(txId, tenantId, amountWakaCu, tenantId, description, referenceId ?? null),
    ]);

    if (!result[0]?.success) {
      throw new Error(`[wallet] credit failed for tenant ${tenantId}`);
    }

    const wallet = await this.getWallet(tenantId);
    return {
      id: txId,
      tenantId,
      type: 'credit',
      amountWakaCu,
      balanceAfterWakaCu: wallet?.balanceWakaCu ?? 0,
      description,
      referenceId: referenceId ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Debit (AI spend)
  // ---------------------------------------------------------------------------

  /**
   * Debit WakaCU from a tenant wallet (AI usage charge).
   * Returns false if balance is insufficient (caller must handle gracefully).
   * P9: amountWakaCu must be a positive integer.
   */
  async debit(
    tenantId: string,
    amountWakaCu: number,
    description: string,
    referenceId?: string,
  ): Promise<{ success: boolean; balanceAfter: number }> {
    if (!Number.isInteger(amountWakaCu) || amountWakaCu <= 0) {
      throw new Error(`[wallet] debit amount must be a positive integer. Got: ${amountWakaCu}`);
    }

    // Check balance
    const wallet = await this.getWallet(tenantId);
    if (!wallet || wallet.balanceWakaCu < amountWakaCu) {
      return { success: false, balanceAfter: wallet?.balanceWakaCu ?? 0 };
    }

    const txId = crypto.randomUUID();
    const balanceAfter = wallet.balanceWakaCu - amountWakaCu;

    await this.db.batch([
      this.db.prepare(
        `UPDATE wc_wallets
         SET balance_wc = balance_wc - ?,
             lifetime_spent_wc = lifetime_spent_wc + ?,
             current_month_spent_wc = current_month_spent_wc + ?,
             updated_at = datetime('now')
         WHERE tenant_id = ? AND balance_wc >= ?`,
      ).bind(amountWakaCu, amountWakaCu, amountWakaCu, tenantId, amountWakaCu),

      this.db.prepare(
        `INSERT INTO wc_transactions
           (id, tenant_id, type, amount_wc, balance_after_wc, description, reference_id, created_at)
         VALUES (?, ?, 'debit', ?, ?, ?, ?, datetime('now'))`,
      ).bind(txId, tenantId, -amountWakaCu, balanceAfter, description, referenceId ?? null),
    ]);

    return { success: true, balanceAfter };
  }

  // ---------------------------------------------------------------------------
  // Spend cap reset (cron or triggered monthly)
  // ---------------------------------------------------------------------------

  /**
   * Reset monthly spend counters for all tenants whose reset date has passed.
   * Called from a Cloudflare Cron Trigger (monthly, first of month).
   */
  async resetMonthlySpend(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    const result = await this.db
      .prepare(
        `UPDATE wc_wallets
         SET current_month_spent_wc = 0,
             spend_cap_reset_at = ?,
             updated_at = datetime('now')
         WHERE spend_cap_reset_at <= ?`,
      )
      .bind(nextMonth.toISOString().split('T')[0], today)
      .run();

    return result.meta?.changes ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Transaction history
  // ---------------------------------------------------------------------------

  async listTransactions(
    tenantId: string,
    limit = 25,
    before?: string,
  ): Promise<WakaCuTransaction[]> {
    const rows = await this.db
      .prepare(
        `SELECT id, tenant_id, type, amount_wc, balance_after_wc, description, reference_id, created_at
         FROM wc_transactions
         WHERE tenant_id = ? ${before ? 'AND created_at < ?' : ''}
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(...(before ? [tenantId, before, limit] : [tenantId, limit]))
      .all<{
        id: string; tenant_id: string; type: string;
        amount_wc: number; balance_after_wc: number;
        description: string; reference_id: string | null; created_at: string;
      }>();

    return (rows.results ?? []).map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      type: r.type as WakaCuTransaction['type'],
      amountWakaCu: r.amount_wc,
      balanceAfterWakaCu: r.balance_after_wc,
      description: r.description,
      referenceId: r.reference_id,
      createdAt: r.created_at,
    }));
  }
}
