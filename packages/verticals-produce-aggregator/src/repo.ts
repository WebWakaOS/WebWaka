/**
 * ProduceAggregatorRepository — D1 data access
 * T3: all queries scoped to tenantId
 * FSM: seeded → claimed → active
 */

import type {
  ProduceAggregatorProfile,
  CreateProduceAggregatorInput,
  UpdateProduceAggregatorInput,
  ProduceAggregatorFSMState,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ProfileRow {
  id: string;
  workspace_id: string;
  tenant_id: string;
  display_name: string;
  status: string;
  created_at: number;
  updated_at: number;
}

function rowTo(r: ProfileRow): ProduceAggregatorProfile {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    tenantId: r.tenant_id,
    displayName: r.display_name,
    status: r.status as ProduceAggregatorFSMState,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, display_name, status, created_at, updated_at';

export class ProduceAggregatorRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateProduceAggregatorInput): Promise<ProduceAggregatorProfile> {
    const id = input.id ?? crypto.randomUUID();
    const ts = Math.floor(Date.now() / 1000);
    await this.db
      .prepare(
        `INSERT INTO produce_aggregator_profiles (id, workspace_id, tenant_id, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'seeded', ?, ?)`,
      )
      .bind(id, input.workspaceId, input.tenantId, input.displayName, ts, ts)
      .run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<ProduceAggregatorProfile | null> {
    const row = await this.db
      .prepare(`SELECT ${COLS} FROM produce_aggregator_profiles WHERE id = ? AND tenant_id = ?`)
      .bind(id, tenantId)
      .first<ProfileRow>();
    return row ? rowTo(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<ProduceAggregatorProfile | null> {
    const row = await this.db
      .prepare(`SELECT ${COLS} FROM produce_aggregator_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(workspaceId, tenantId)
      .first<ProfileRow>();
    return row ? rowTo(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateProduceAggregatorInput): Promise<ProduceAggregatorProfile | null> {
    const sets: string[] = [];
    const b: unknown[] = [];
    if (input.displayName !== undefined) { sets.push('display_name = ?'); b.push(input.displayName); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = ?');
    b.push(Math.floor(Date.now() / 1000), id, tenantId);
    await this.db
      .prepare(`UPDATE produce_aggregator_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`)
      .bind(...b)
      .run();
    return this.findProfileById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: ProduceAggregatorFSMState): Promise<ProduceAggregatorProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }
}
