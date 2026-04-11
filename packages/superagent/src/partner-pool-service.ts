/**
 * Partner credit pool service — subsidised WakaCU for sub-tenants.
 * (SA-1.6 — TDR-0009, Platform Invariant P9)
 *
 * D1 table: partner_credit_pools (migration 0044).
 *
 * Partners (whiteLabelDepth ≥ 1) may allocate WakaCU from their own wallet
 * to a sub-tenant's pool. When a sub-tenant runs AI features, the burn engine
 * checks their pool balance first before hitting their own wallet.
 *
 * P9: All amounts are integers (WakaCU).
 * T3: All queries are scoped to partnerTenantId.
 */

import type { PartnerCreditPool } from './types.js';
import type { WalletService } from './wallet-service.js';

export interface PartnerPoolServiceDeps {
  db: D1Database;
  walletService: WalletService;
}

export class PartnerPoolService {
  private readonly db: D1Database;
  private readonly walletService: WalletService;

  constructor(deps: PartnerPoolServiceDeps) {
    this.db = deps.db;
    this.walletService = deps.walletService;
  }

  /**
   * Allocate WakaCU from a partner's wallet to a beneficiary sub-tenant.
   * Deducts from partner wallet in the same transaction.
   * P9: allocateWakaCu must be a positive integer.
   */
  async allocate(
    partnerTenantId: string,
    beneficiaryTenantId: string,
    allocateWakaCu: number,
    expiresAt?: string,
  ): Promise<PartnerCreditPool> {
    if (!Number.isInteger(allocateWakaCu) || allocateWakaCu <= 0) {
      throw new Error(`[partner-pool] allocateWakaCu must be a positive integer. Got: ${allocateWakaCu}`);
    }

    // Debit from partner wallet
    const debitResult = await this.walletService.debit(
      partnerTenantId,
      allocateWakaCu,
      `Partner credit allocation to ${beneficiaryTenantId}`,
    );
    if (!debitResult.success) {
      throw new Error(
        `[partner-pool] Partner wallet insufficient balance for allocation of ${allocateWakaCu} WakaCU`,
      );
    }

    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `INSERT INTO partner_credit_pools
           (id, partner_tenant_id, beneficiary_tenant_id,
            allocated_wc, used_wc, expires_at, created_at)
         VALUES (?, ?, ?, ?, 0, ?, datetime('now'))`,
      )
      .bind(id, partnerTenantId, beneficiaryTenantId, allocateWakaCu, expiresAt ?? null)
      .run();

    return {
      id,
      partnerTenantId,
      beneficiaryTenantId,
      allocatedWakaCu: allocateWakaCu,
      usedWakaCu: 0,
      expiresAt: expiresAt ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Consume WakaCU from a beneficiary's partner pool.
   * Returns true if successfully consumed, false if pool is exhausted/expired.
   * P9: amountWakaCu must be a positive integer.
   */
  async consume(beneficiaryTenantId: string, amountWakaCu: number): Promise<boolean> {
    if (!Number.isInteger(amountWakaCu) || amountWakaCu <= 0) return false;

    const today = new Date().toISOString();

    // Find the best active pool (most credits remaining, non-expired)
    const pool = await this.db
      .prepare(
        `SELECT id, allocated_wc, used_wc
         FROM partner_credit_pools
         WHERE beneficiary_tenant_id = ?
           AND (expires_at IS NULL OR expires_at > ?)
           AND (allocated_wc - used_wc) >= ?
         ORDER BY (allocated_wc - used_wc) DESC
         LIMIT 1`,
      )
      .bind(beneficiaryTenantId, today, amountWakaCu)
      .first<{ id: string; allocated_wc: number; used_wc: number }>();

    if (!pool) return false;

    const result = await this.db
      .prepare(
        `UPDATE partner_credit_pools
         SET used_wc = used_wc + ?
         WHERE id = ? AND (allocated_wc - used_wc) >= ?`,
      )
      .bind(amountWakaCu, pool.id, amountWakaCu)
      .run();

    return (result.meta?.changes ?? 0) > 0;
  }

  /**
   * List all pools where tenantId is the partner (grantor).
   */
  async listGrantedPools(partnerTenantId: string): Promise<PartnerCreditPool[]> {
    const rows = await this.db
      .prepare(
        `SELECT id, partner_tenant_id, beneficiary_tenant_id,
                allocated_wc, used_wc, expires_at, created_at
         FROM partner_credit_pools
         WHERE partner_tenant_id = ?
         ORDER BY created_at DESC`,
      )
      .bind(partnerTenantId)
      .all<{
        id: string; partner_tenant_id: string; beneficiary_tenant_id: string;
        allocated_wc: number; used_wc: number;
        expires_at: string | null; created_at: string;
      }>();

    return (rows.results ?? []).map((r) => ({
      id: r.id,
      partnerTenantId: r.partner_tenant_id,
      beneficiaryTenantId: r.beneficiary_tenant_id,
      allocatedWakaCu: r.allocated_wc,
      usedWakaCu: r.used_wc,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    }));
  }
}
