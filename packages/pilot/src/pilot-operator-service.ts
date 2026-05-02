/**
 * @webwaka/pilot — PilotOperatorService
 *
 * Manages pilot operator lifecycle: enrolment, status transitions, graduation.
 * All queries are tenant-scoped. No cross-tenant reads.
 */

import type {
  PilotOperator,
  PilotOperatorStatus,
  CreatePilotOperatorInput,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export class PilotOperatorService {
  constructor(private readonly db: D1Like) {}

  async enrol(input: CreatePilotOperatorInput): Promise<PilotOperator> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const state = input.state ?? 'Lagos';
    const cohort = input.cohort ?? 'cohort_1';

    await this.db
      .prepare(
        `INSERT INTO pilot_operators
           (id, tenant_id, workspace_id, vertical_slug, operator_name,
            contact_phone, contact_email, lga, state, cohort, status,
            notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'invited', ?, ?, ?)`,
      )
      .bind(
        id,
        input.tenant_id,
        input.workspace_id,
        input.vertical_slug,
        input.operator_name,
        input.contact_phone ?? null,
        input.contact_email ?? null,
        input.lga ?? null,
        state,
        cohort,
        input.notes ?? null,
        now,
        now,
      )
      .run();

    const row = await this.db
      .prepare(`SELECT * FROM pilot_operators WHERE id = ?`)
      .bind(id)
      .first<PilotOperator>();

    if (!row) throw new Error('Pilot operator not found after insert');
    return row;
  }

  async transition(
    tenantId: string,
    newStatus: PilotOperatorStatus,
  ): Promise<void> {
    const now = new Date().toISOString();
    const extraFields: Record<string, string> = {};

    if (newStatus === 'active') extraFields['onboarded_at'] = now;
    if (newStatus === 'graduated') extraFields['graduated_at'] = now;

    const setClauses = [
      'status = ?',
      'updated_at = ?',
      ...Object.keys(extraFields).map((k) => `${k} = ?`),
    ].join(', ');

    const binds = [newStatus, now, ...Object.values(extraFields), tenantId];

    await this.db
      .prepare(`UPDATE pilot_operators SET ${setClauses} WHERE tenant_id = ?`)
      .bind(...binds)
      .run();
  }

  async markFirstTransaction(tenantId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `UPDATE pilot_operators
         SET first_txn_at = ?, updated_at = ?
         WHERE tenant_id = ? AND first_txn_at IS NULL`,
      )
      .bind(now, now, tenantId)
      .run();
  }

  async get(tenantId: string): Promise<PilotOperator | null> {
    return this.db
      .prepare(`SELECT * FROM pilot_operators WHERE tenant_id = ?`)
      .bind(tenantId)
      .first<PilotOperator>();
  }

  async listByCohort(cohort: string): Promise<PilotOperator[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM pilot_operators WHERE cohort = ? ORDER BY created_at ASC`,
      )
      .bind(cohort)
      .all<PilotOperator>();
    return result.results;
  }

  async listByStatus(status: PilotOperatorStatus): Promise<PilotOperator[]> {
    const result = await this.db
      .prepare(
        `SELECT * FROM pilot_operators WHERE status = ? ORDER BY created_at ASC`,
      )
      .bind(status)
      .all<PilotOperator>();
    return result.results;
  }

  async summary(): Promise<Record<PilotOperatorStatus, number>> {
    const result = await this.db
      .prepare(
        `SELECT status, COUNT(*) AS cnt FROM pilot_operators GROUP BY status`,
      )
      .bind()
      .all<{ status: PilotOperatorStatus; cnt: number }>();

    const base: Record<PilotOperatorStatus, number> = {
      invited: 0,
      onboarding: 0,
      active: 0,
      churned: 0,
      graduated: 0,
    };
    for (const row of result.results) {
      base[row.status] = row.cnt;
    }
    return base;
  }
}
