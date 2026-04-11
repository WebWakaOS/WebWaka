/**
 * packages/verticals-ngo — Domain types
 * (M8d — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → it_verified → community_active → active
 * NGO / Non-Profit modeled as an Organization entity.
 * P9: All monetary amounts (funding) in integer kobo.
 */

export type NgoFSMState =
  | 'seeded'
  | 'claimed'
  | 'it_verified'
  | 'community_active'
  | 'active';

export type NgoSector =
  | 'education' | 'health' | 'environment' | 'women' | 'youth'
  | 'disability' | 'agriculture' | 'legal' | 'tech' | 'others';

export type FundingStatus = 'pending' | 'received' | 'disbursed';

export interface NgoProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  communityId: string | null;
  itNumber: string | null;
  sector: NgoSector;
  cacRegNumber: string | null;
  countryPartner: string | null;
  beneficiaryCount: number;
  status: NgoFSMState;
  createdAt: number;
}

export interface NgoFundingRecord {
  id: string;
  workspaceId: string;
  tenantId: string;
  donorName: string;
  amountKobo: number;
  currency: string;
  purpose: string | null;
  paystackRef: string | null;
  status: FundingStatus;
  receivedAt: number;
}

export interface CreateNgoInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  sector: NgoSector;
  cacRegNumber?: string;
  countryPartner?: string;
}

export interface UpdateNgoInput {
  communityId?: string | null;
  itNumber?: string | null;
  sector?: NgoSector;
  cacRegNumber?: string | null;
  countryPartner?: string | null;
  beneficiaryCount?: number;
  status?: NgoFSMState;
}

export interface CreateFundingInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  donorName: string;
  amountKobo: number;
  currency?: string;
  purpose?: string;
  paystackRef?: string;
}

export const VALID_NGO_TRANSITIONS: Array<[NgoFSMState, NgoFSMState]> = [
  ['seeded',           'claimed'],
  ['claimed',          'it_verified'],
  ['it_verified',      'community_active'],
  ['community_active', 'active'],
];

export function isValidNgoTransition(from: NgoFSMState, to: NgoFSMState): boolean {
  return VALID_NGO_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
