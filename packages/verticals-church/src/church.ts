/**
 * Church / Faith Community D1 repository.
 * (M8d — Platform Invariants T3, P9)
 * Migration: 0052_civic_church_ngo.sql → church_profiles
 */

import type { ChurchProfile, CreateChurchInput, UpdateChurchInput, ChurchFSMState } from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

interface ChurchRow {
  id: string; organization_id: string; workspace_id: string; tenant_id: string;
  community_id: string | null; it_number: string | null; denomination: string;
  founding_year: number | null; senior_pastor: string | null;
  total_members: number; branch_count: number; status: string; created_at: number;
}

function rowToChurch(r: ChurchRow): ChurchProfile {
  return {
    id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    communityId: r.community_id, itNumber: r.it_number,
    denomination: r.denomination as ChurchProfile['denomination'],
    foundingYear: r.founding_year, seniorPastor: r.senior_pastor,
    totalMembers: r.total_members, branchCount: r.branch_count,
    status: r.status as ChurchFSMState, createdAt: r.created_at,
  };
}

const COLS = 'id, organization_id, workspace_id, tenant_id, community_id, it_number, denomination, founding_year, senior_pastor, total_members, branch_count, status, created_at';

export class ChurchRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateChurchInput): Promise<ChurchProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO church_profiles
         (id, organization_id, workspace_id, tenant_id, community_id, it_number,
          denomination, founding_year, senior_pastor, total_members, branch_count, status, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, 0, 1, 'seeded', unixepoch())`,
    ).bind(id, input.organizationId, input.workspaceId, input.tenantId,
      input.denomination, input.foundingYear ?? null, input.seniorPastor ?? null).run();
    const church = await this.findById(id, input.tenantId);
    if (!church) throw new Error('[church] create failed');
    return church;
  }

  async findById(id: string, tenantId: string): Promise<ChurchProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM church_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ChurchRow>();
    return row ? rowToChurch(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<ChurchProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM church_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ChurchRow>();
    return (results ?? []).map(rowToChurch);
  }

  async findByDenomination(denomination: string, tenantId: string): Promise<ChurchProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM church_profiles WHERE denomination = ? AND tenant_id = ? ORDER BY total_members DESC`,
    ).bind(denomination, tenantId).all<ChurchRow>();
    return (results ?? []).map(rowToChurch);
  }

  async update(id: string, tenantId: string, input: UpdateChurchInput): Promise<ChurchProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if ('communityId' in input)    { sets.push('community_id = ?');   b.push(input.communityId ?? null); }
    if ('itNumber' in input)       { sets.push('it_number = ?');      b.push(input.itNumber ?? null); }
    if (input.denomination !== undefined)  { sets.push('denomination = ?');  b.push(input.denomination); }
    if ('foundingYear' in input)   { sets.push('founding_year = ?');  b.push(input.foundingYear ?? null); }
    if ('seniorPastor' in input)   { sets.push('senior_pastor = ?');  b.push(input.seniorPastor ?? null); }
    if (input.totalMembers !== undefined)  { sets.push('total_members = ?'); b.push(input.totalMembers); }
    if (input.branchCount !== undefined)   { sets.push('branch_count = ?');  b.push(input.branchCount); }
    if (input.status !== undefined)        { sets.push('status = ?');         b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(
      `UPDATE church_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: ChurchFSMState): Promise<ChurchProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }
}
