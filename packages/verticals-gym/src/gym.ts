/**
 * @webwaka/verticals-gym — Repository (canonical implementation)
 *
 * Canonical slug: `gym` (M1 decision: gym-fitness merged into gym)
 * D1 table: gym_fitness_profiles (historical name from migration 0164)
 * P9: all monetary in kobo integers
 * P13: member_ref_id opaque; health metrics never to AI
 * T3: tenant_id always present in queries
 */

import type {
  GymProfile,
  CreateGymInput,
  GymFSMState,
  GymMembership,
  GymSession,
  GymEquipmentLog,
} from './types.js';

interface D1Like {
  prepare(s: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

function toProfile(r: Record<string, unknown>): GymProfile {
  return {
    id: r['id'] as string,
    workspaceId: r['workspace_id'] as string,
    tenantId: r['tenant_id'] as string,
    businessName: (r['business_name'] as string) ?? (r['gym_name'] as string) ?? '',
    gymName: r['gym_name'] as string | undefined,
    cacRc: r['cac_rc'] as string | null,
    nasfcCert: r['nasfc_cert'] as string | null,
    capacity: r['capacity'] as number | undefined,
    status: r['status'] as GymFSMState,
    createdAt: r['created_at'] as number,
    updatedAt: r['updated_at'] as number,
  };
}

function toMembership(r: Record<string, unknown>): GymMembership {
  return {
    id: r['id'] as string,
    profileId: r['profile_id'] as string,
    tenantId: r['tenant_id'] as string,
    memberRefId: r['member_ref_id'] as string,
    plan: r['plan'] as string,
    monthlyFeeKobo: r['monthly_fee_kobo'] as number,
    startDate: r['start_date'] as number,
    endDate: (r['end_date'] as number | null) ?? null,
    status: r['status'] as GymMembership['status'],
    createdAt: r['created_at'] as number,
    updatedAt: r['updated_at'] as number,
  };
}

/**
 * GymRepository — canonical repository for the `gym` vertical.
 * Table name remains `gym_fitness_profiles` (from migration 0164).
 */
export class GymRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateGymInput): Promise<GymProfile> {
    const id = input.id ?? crypto.randomUUID();
    const businessName = input.businessName ?? input.gymName ?? '';
    await this.db
      .prepare(
        `INSERT INTO gym_fitness_profiles (id,workspace_id,tenant_id,business_name,cac_rc,nasfc_cert,capacity,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`,
      )
      .bind(
        id,
        input.workspaceId,
        input.tenantId,
        businessName,
        input.cacRc ?? null,
        input.nasfcCert ?? null,
        input.capacity ?? 0,
      )
      .run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[gym] create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<GymProfile | null> {
    const r = await this.db
      .prepare('SELECT * FROM gym_fitness_profiles WHERE id=? AND tenant_id=?')
      .bind(id, tenantId)
      .first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<GymProfile | null> {
    const r = await this.db
      .prepare('SELECT * FROM gym_fitness_profiles WHERE workspace_id=? AND tenant_id=?')
      .bind(workspaceId, tenantId)
      .first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async transitionStatus(id: string, tenantId: string, to: GymFSMState): Promise<GymProfile> {
    await this.db
      .prepare('UPDATE gym_fitness_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?')
      .bind(to, id, tenantId)
      .run();
    const p = await this.findProfileById(id, tenantId);
    if (!p) throw new Error('[gym] not found');
    return p;
  }

  async createMembership(
    profileId: string,
    tenantId: string,
    input: { memberRefId: string; plan: string; monthlyFeeKobo: number; startDate: number; endDate?: number },
  ): Promise<GymMembership> {
    if (!Number.isInteger(input.monthlyFeeKobo)) throw new Error('monthly_fee_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        "INSERT INTO gym_memberships (id,profile_id,tenant_id,member_ref_id,plan,monthly_fee_kobo,start_date,end_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'active',unixepoch(),unixepoch())",
      )
      .bind(id, profileId, tenantId, input.memberRefId, input.plan, input.monthlyFeeKobo, input.startDate, input.endDate ?? null)
      .run();
    const r = await this.db.prepare('SELECT * FROM gym_memberships WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[gym] membership create failed');
    return toMembership(r);
  }

  async listMemberships(profileId: string, tenantId: string): Promise<GymMembership[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM gym_memberships WHERE profile_id=? AND tenant_id=? ORDER BY start_date DESC')
      .bind(profileId, tenantId)
      .all<Record<string, unknown>>();
    return results.map(toMembership);
  }

  async logSession(
    profileId: string,
    tenantId: string,
    input: { memberRefId: string; sessionDate: number; durationMinutes: number; sessionType?: string; trainerRefId?: string },
  ): Promise<GymSession> {
    if (!Number.isInteger(input.durationMinutes)) throw new Error('duration_minutes must be integer');
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        'INSERT INTO gym_sessions (id,profile_id,tenant_id,member_ref_id,session_date,duration_minutes,session_type,trainer_ref_id,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())',
      )
      .bind(id, profileId, tenantId, input.memberRefId, input.sessionDate, input.durationMinutes, input.sessionType ?? 'general', input.trainerRefId ?? null)
      .run();
    const r = await this.db.prepare('SELECT * FROM gym_sessions WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[gym] session create failed');
    return {
      id: r['id'] as string,
      profileId: r['profile_id'] as string,
      tenantId: r['tenant_id'] as string,
      memberRefId: r['member_ref_id'] as string,
      sessionDate: r['session_date'] as number,
      durationMinutes: r['duration_minutes'] as number,
      sessionType: r['session_type'] as string,
      trainerRefId: r['trainer_ref_id'] as string | null,
      createdAt: r['created_at'] as number,
    };
  }

  async logEquipmentMaintenance(
    profileId: string,
    tenantId: string,
    input: { equipmentName: string; maintenanceDate: number; notes?: string; costKobo?: number },
  ): Promise<GymEquipmentLog> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        'INSERT INTO gym_equipment_log (id,profile_id,tenant_id,equipment_name,maintenance_date,notes,cost_kobo,created_at) VALUES (?,?,?,?,?,?,?,unixepoch())',
      )
      .bind(id, profileId, tenantId, input.equipmentName, input.maintenanceDate, input.notes ?? null, input.costKobo ?? 0)
      .run();
    const r = await this.db.prepare('SELECT * FROM gym_equipment_log WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[gym] equipment log create failed');
    return {
      id: r['id'] as string,
      profileId: r['profile_id'] as string,
      tenantId: r['tenant_id'] as string,
      equipmentName: r['equipment_name'] as string,
      maintenanceDate: r['maintenance_date'] as number,
      notes: r['notes'] as string | null,
      costKobo: r['cost_kobo'] as number,
      createdAt: r['created_at'] as number,
    };
  }
}

/**
 * @deprecated Use GymRepository instead.
 * Backward-compat alias for gym-fitness imports.
 */
export const GymFitnessRepository = GymRepository;

export function guardSeedToClaimed(_p: GymProfile): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
