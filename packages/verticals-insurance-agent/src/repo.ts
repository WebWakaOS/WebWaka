import type { InsuranceAgentProfile, InsuranceAgentFSMState, CreateInsuranceAgentInput } from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> } };
}

interface Row { id: string; workspace_id: string; tenant_id: string; display_name: string; status: string; created_at: number; updated_at: number }

function rowTo(r: Row): InsuranceAgentProfile {
  return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, displayName: r.display_name, status: r.status as InsuranceAgentFSMState, createdAt: r.created_at, updatedAt: r.updated_at };
}

const COLS = 'id, workspace_id, tenant_id, display_name, status, created_at, updated_at';

export class InsuranceAgentRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateInsuranceAgentInput): Promise<InsuranceAgentProfile> {
    const id = input.id ?? `ins_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(
      'INSERT INTO insurance_agent_profiles (id, workspace_id, tenant_id, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, input.workspaceId, input.tenantId, input.displayName, 'seeded', now, now).run();
    return rowTo((await this.db.prepare(`SELECT ${COLS} FROM insurance_agent_profiles WHERE id = ?`).bind(id).first<Row>())!);
  }

  async findProfileById(id: string, tenantId: string): Promise<InsuranceAgentProfile | null> {
    const row = await this.db.prepare(`SELECT ${COLS} FROM insurance_agent_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>();
    return row ? rowTo(row) : null;
  }

  async updateStatus(id: string, tenantId: string, status: InsuranceAgentFSMState): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare('UPDATE insurance_agent_profiles SET status = ?, updated_at = ? WHERE id = ? AND tenant_id = ?').bind(status, now, id, tenantId).run();
  }
}
