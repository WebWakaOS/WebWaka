/**
 * Tithe + offering collection repository.
 * (M8d — T3, P9)
 * Migration: 0052_civic_church_ngo.sql → tithe_records
 * P9: amountKobo must be a positive integer.
 * P13: memberId is an internal ID — no PII forwarded to AI.
 */

import type { TitheRecord, CreateTitheInput } from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

interface TitheRow {
  id: string; workspace_id: string; tenant_id: string;
  member_id: string; amount_kobo: number; payment_type: string;
  paystack_ref: string | null; recorded_at: number;
}

function rowToTithe(r: TitheRow): TitheRecord {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    memberId: r.member_id, amountKobo: r.amount_kobo,
    paymentType: r.payment_type as TitheRecord['paymentType'],
    paystackRef: r.paystack_ref, recordedAt: r.recorded_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, member_id, amount_kobo, payment_type, paystack_ref, recorded_at';

export class TitheRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateTitheInput): Promise<TitheRecord> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) {
      throw new Error('[tithe] amountKobo must be a positive integer (P9)');
    }
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO tithe_records
         (id, workspace_id, tenant_id, member_id, amount_kobo, payment_type, paystack_ref, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.memberId,
      input.amountKobo, input.paymentType, input.paystackRef ?? null).run();
    const record = await this.findById(id, input.tenantId);
    if (!record) throw new Error('[tithe] create failed');
    return record;
  }

  async findById(id: string, tenantId: string): Promise<TitheRecord | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM tithe_records WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<TitheRow>();
    return row ? rowToTithe(row) : null;
  }

  async listByMember(memberId: string, tenantId: string, limit = 50): Promise<TitheRecord[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM tithe_records WHERE member_id = ? AND tenant_id = ? ORDER BY recorded_at DESC LIMIT ?`,
    ).bind(memberId, tenantId, limit).all<TitheRow>();
    return (results ?? []).map(rowToTithe);
  }

  async listByWorkspace(workspaceId: string, tenantId: string, limit = 100): Promise<TitheRecord[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM tithe_records WHERE workspace_id = ? AND tenant_id = ? ORDER BY recorded_at DESC LIMIT ?`,
    ).bind(workspaceId, tenantId, limit).all<TitheRow>();
    return (results ?? []).map(rowToTithe);
  }

  async totalByWorkspace(workspaceId: string, tenantId: string): Promise<number> {
    const row = await this.db.prepare(
      `SELECT COALESCE(SUM(amount_kobo), 0) AS total FROM tithe_records WHERE workspace_id = ? AND tenant_id = ?`,
    ).bind(workspaceId, tenantId).first<{ total: number }>();
    return row?.total ?? 0;
  }

  async totalByMember(memberId: string, tenantId: string): Promise<number> {
    const row = await this.db.prepare(
      `SELECT COALESCE(SUM(amount_kobo), 0) AS total FROM tithe_records WHERE member_id = ? AND tenant_id = ?`,
    ).bind(memberId, tenantId).first<{ total: number }>();
    return row?.total ?? 0;
  }
}
