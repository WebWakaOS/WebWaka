/**
 * packages/verticals-church — Domain types
 * (M8d — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → it_verified → community_active → active
 * Church / faith community is modeled as an Organization entity.
 * P9: All monetary amounts (tithe, offering) in integer kobo.
 */

export type ChurchFSMState =
  | 'seeded'
  | 'claimed'
  | 'it_verified'
  | 'community_active'
  | 'active';

export type Denomination =
  | 'pentecostal' | 'catholic' | 'anglican' | 'baptist'
  | 'methodist'   | 'orthodox' | 'evangelical' | 'others';

export type PaymentType = 'tithe' | 'offering' | 'seed' | 'donation' | 'special';

export interface ChurchProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  communityId: string | null;
  itNumber: string | null;
  denomination: Denomination;
  foundingYear: number | null;
  seniorPastor: string | null;
  totalMembers: number;
  branchCount: number;
  status: ChurchFSMState;
  createdAt: number;
}

export interface TitheRecord {
  id: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  paymentType: PaymentType;
  paystackRef: string | null;
  recordedAt: number;
}

export interface CreateChurchInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  denomination: Denomination;
  foundingYear?: number;
  seniorPastor?: string;
}

export interface UpdateChurchInput {
  communityId?: string | null;
  itNumber?: string | null;
  denomination?: Denomination;
  foundingYear?: number | null;
  seniorPastor?: string | null;
  totalMembers?: number;
  branchCount?: number;
  status?: ChurchFSMState;
}

export interface CreateTitheInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  memberId: string;
  amountKobo: number;
  paymentType: PaymentType;
  paystackRef?: string;
}

export const VALID_CHURCH_TRANSITIONS: Array<[ChurchFSMState, ChurchFSMState]> = [
  ['seeded',           'claimed'],
  ['claimed',          'it_verified'],
  ['it_verified',      'community_active'],
  ['community_active', 'active'],
];

export function isValidChurchTransition(from: ChurchFSMState, to: ChurchFSMState): boolean {
  return VALID_CHURCH_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
