/**
 * @webwaka/verticals-ward-rep — Domain types
 * M12 — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → active (3-state; simplified for grassroots level)
 * KYC: Tier 1 basic; Tier 2 for project fund management
 * AI: L3 HITL MANDATORY — political content; no constituent personal data to AI
 * P9: All monetary amounts in integer kobo; registered_voters as INTEGER
 * P13: No constituent personal data passed to SuperAgent
 */

export type WardRepFSMState =
  | 'seeded'
  | 'claimed'
  | 'active';

export interface WardRepProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  councillorName: string;
  wardName: string;
  lga: string | null;
  state: string | null;
  inecWardCode: string | null;
  status: WardRepFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWardRepInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  councillorName: string;
  wardName: string;
  lga?: string | undefined;
  state?: string | undefined;
  inecWardCode?: string | undefined;
}

export interface UpdateWardRepInput {
  councillorName?: string | undefined;
  wardName?: string | undefined;
  lga?: string | null | undefined;
  state?: string | null | undefined;
  inecWardCode?: string | null | undefined;
  status?: WardRepFSMState | undefined;
}

export interface WardPollingUnit {
  id: string;
  profileId: string;
  tenantId: string;
  unitNumber: string;
  address: string | null;
  registeredVoters: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePollingUnitInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  unitNumber: string;
  address?: string | undefined;
  registeredVoters?: number | undefined;
}

export interface WardProject {
  id: string;
  profileId: string;
  tenantId: string;
  projectName: string;
  category: string | null;
  amountKobo: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWardProjectInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  projectName: string;
  category?: string | undefined;
  amountKobo: number;
  status?: string | undefined;
}

export interface WardServiceRequest {
  id: string;
  profileId: string;
  tenantId: string;
  requestType: string;
  description: string | null;
  ward: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateServiceRequestInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  requestType: string;
  description?: string | undefined;
  ward?: string | undefined;
}

export const VALID_WARD_REP_TRANSITIONS: Record<WardRepFSMState, WardRepFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidWardRepTransition(from: WardRepFSMState, to: WardRepFSMState): boolean {
  return VALID_WARD_REP_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardAiHitl(ctx: { autonomyLevel: string }): { allowed: boolean; reason?: string } {
  if (ctx.autonomyLevel !== 'L3_HITL') return { allowed: false, reason: 'L3 HITL flag mandatory for all AI routes in ward-rep vertical' };
  return { allowed: true };
}

export function guardProjectFund(ctx: { amountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.amountKobo > 0 && ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required for ward project funds' };
  if (ctx.amountKobo > 1_000_000_000 && ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for large project fund management' };
  return { allowed: true };
}
