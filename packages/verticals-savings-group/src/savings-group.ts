/**
 * @webwaka/verticals-savings-group — SavingsGroupRepository (M9 scaffolded)
 * P9: all amounts in integer kobo
 * T3: tenant_id on every query
 * P13: member_ref_id opaque
 */

import type {
  SavingsGroupProfile, CreateSavingsGroupInput, SavingsGroupFSMState,
  GroupMember, Contribution, PayoutCycle,
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

function toProfile(r: Record<string, unknown>): SavingsGroupProfile {
  return {
    id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string,
    groupName: r['group_name'] as string, cacRc: r['cac_rc'] as string | null,
    groupType: (r['group_type'] ?? 'ajo') as SavingsGroupProfile['groupType'],
    contributionFrequency: (r['contribution_frequency'] ?? 'monthly') as SavingsGroupProfile['contributionFrequency'],
    contributionAmountKobo: r['contribution_amount_kobo'] as number,
    maxMembers: (r['max_members'] ?? 20) as number, currentMembers: (r['current_members'] ?? 0) as number,
    status: r['status'] as SavingsGroupFSMState,
    createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number,
  };
}

function toMember(r: Record<string, unknown>): GroupMember {
  return {
    id: r['id'] as string, groupId: r['group_id'] as string, tenantId: r['tenant_id'] as string,
    memberRefId: r['member_ref_id'] as string, role: (r['role'] ?? 'member') as GroupMember['role'],
    joinedAt: r['joined_at'] as number, kycTier: (r['kyc_tier'] ?? 0) as number,
    payoutPosition: r['payout_position'] as number | null,
    status: (r['status'] ?? 'active') as GroupMember['status'],
    createdAt: r['created_at'] as number,
  };
}

function toContribution(r: Record<string, unknown>): Contribution {
  return {
    id: r['id'] as string, groupId: r['group_id'] as string, tenantId: r['tenant_id'] as string,
    memberRefId: r['member_ref_id'] as string,
    amountKobo: r['amount_kobo'] as number, contributionDate: r['contribution_date'] as number,
    cycleNumber: r['cycle_number'] as number,
    paymentMethod: (r['payment_method'] ?? 'cash') as Contribution['paymentMethod'],
    payStackRef: r['paystack_ref'] as string | null, notes: r['notes'] as string | null,
    verified: Boolean(r['verified']), createdAt: r['created_at'] as number,
  };
}

function toPayoutCycle(r: Record<string, unknown>): PayoutCycle {
  return {
    id: r['id'] as string, groupId: r['group_id'] as string, tenantId: r['tenant_id'] as string,
    cycleNumber: r['cycle_number'] as number, recipientRefId: r['recipient_ref_id'] as string,
    totalAmountKobo: r['total_amount_kobo'] as number,
    payoutDate: r['payout_date'] as number | null,
    status: (r['status'] ?? 'pending') as PayoutCycle['status'],
    payStackRef: r['paystack_ref'] as string | null,
    createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number,
  };
}

export class SavingsGroupRepository {
  constructor(private readonly db: D1Like) {}

  async createGroup(input: CreateSavingsGroupInput): Promise<SavingsGroupProfile> {
    if (!Number.isInteger(input.contributionAmountKobo) || input.contributionAmountKobo <= 0)
      throw new Error('[savings-group] contributionAmountKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO savings_group_profiles (id,workspace_id,tenant_id,group_name,cac_rc,group_type,contribution_frequency,contribution_amount_kobo,max_members,current_members,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,0,'seeded',unixepoch(),unixepoch())`
    ).bind(id, input.workspaceId, input.tenantId, input.groupName, input.cacRc ?? null,
      input.groupType ?? 'ajo', input.contributionFrequency ?? 'monthly',
      input.contributionAmountKobo, input.maxMembers ?? 20).run();
    const p = await this.findGroupById(id, input.tenantId);
    if (!p) throw new Error('[savings-group] create failed');
    return p;
  }

  async findGroupById(id: string, tenantId: string): Promise<SavingsGroupProfile | null> {
    const r = await this.db.prepare('SELECT * FROM savings_group_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async findGroupByWorkspace(workspaceId: string, tenantId: string): Promise<SavingsGroupProfile | null> {
    const r = await this.db.prepare('SELECT * FROM savings_group_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async transitionStatus(id: string, tenantId: string, to: SavingsGroupFSMState, fields?: { cacRc?: string }): Promise<SavingsGroupProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.cacRc) { extraClauses.push('cac_rc = ?'); extraBinds.push(fields.cacRc); }
    await this.db.prepare(`UPDATE savings_group_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to, ...extraBinds, id, tenantId).run();
    const p = await this.findGroupById(id, tenantId);
    if (!p) throw new Error('[savings-group] not found');
    return p;
  }

  async addMember(groupId: string, tenantId: string, input: { memberRefId: string; role?: GroupMember['role']; kycTier?: number; payoutPosition?: number }): Promise<GroupMember> {
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(
      `INSERT INTO savings_group_members (id,group_id,tenant_id,member_ref_id,role,joined_at,kyc_tier,payout_position,status,created_at) VALUES (?,?,?,?,?,?,?,?,'active',unixepoch())`
    ).bind(id, groupId, tenantId, input.memberRefId, input.role ?? 'member', now,
      input.kycTier ?? 0, input.payoutPosition ?? null).run();
    const r = await this.db.prepare('SELECT * FROM savings_group_members WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[savings-group] member add failed');
    return toMember(r);
  }

  async listMembers(groupId: string, tenantId: string): Promise<GroupMember[]> {
    const { results } = await this.db.prepare(
      "SELECT * FROM savings_group_members WHERE group_id=? AND tenant_id=? AND status='active' ORDER BY payout_position"
    ).bind(groupId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(toMember);
  }

  async recordContribution(groupId: string, tenantId: string, input: {
    memberRefId: string; amountKobo: number; contributionDate: number; cycleNumber: number;
    paymentMethod?: Contribution['paymentMethod']; payStackRef?: string; notes?: string;
  }): Promise<Contribution> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0)
      throw new Error('[savings-group] amountKobo must be positive integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO savings_group_contributions (id,group_id,tenant_id,member_ref_id,amount_kobo,contribution_date,cycle_number,payment_method,paystack_ref,notes,verified,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,unixepoch())`
    ).bind(id, groupId, tenantId, input.memberRefId, input.amountKobo, input.contributionDate,
      input.cycleNumber, input.paymentMethod ?? 'cash', input.payStackRef ?? null, input.notes ?? null).run();
    const r = await this.db.prepare('SELECT * FROM savings_group_contributions WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[savings-group] contribution create failed');
    return toContribution(r);
  }

  async listContributions(groupId: string, tenantId: string): Promise<Contribution[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM savings_group_contributions WHERE group_id=? AND tenant_id=? ORDER BY contribution_date DESC'
    ).bind(groupId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(toContribution);
  }

  async createPayoutCycle(groupId: string, tenantId: string, input: {
    cycleNumber: number; recipientRefId: string; totalAmountKobo: number; payoutDate?: number;
  }): Promise<PayoutCycle> {
    if (!Number.isInteger(input.totalAmountKobo) || input.totalAmountKobo <= 0)
      throw new Error('[savings-group] totalAmountKobo must be positive integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO savings_group_payout_cycles (id,group_id,tenant_id,cycle_number,recipient_ref_id,total_amount_kobo,payout_date,status,paystack_ref,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'pending',NULL,unixepoch(),unixepoch())`
    ).bind(id, groupId, tenantId, input.cycleNumber, input.recipientRefId,
      input.totalAmountKobo, input.payoutDate ?? null).run();
    const r = await this.db.prepare('SELECT * FROM savings_group_payout_cycles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[savings-group] payout cycle create failed');
    return toPayoutCycle(r);
  }

  async listPayoutCycles(groupId: string, tenantId: string): Promise<PayoutCycle[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM savings_group_payout_cycles WHERE group_id=? AND tenant_id=? ORDER BY cycle_number'
    ).bind(groupId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(toPayoutCycle);
  }
}
