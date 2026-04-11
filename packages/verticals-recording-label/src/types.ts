/**
 * @webwaka/verticals-recording-label — types + FSM guards (M12)
 * FSM: seeded → claimed → coson_registered → active → suspended
 * AI: L2 cap — catalogue performance aggregate; no artiste_ref_id or royalty splits to AI (P13)
 * P9: all monetary values in kobo integers
 * royalty_split_bps: INTEGER basis points out of 10,000 (e.g. 7050 = 70.5%) — NO FLOATS
 * Kobo arithmetic invariant: artiste_share_kobo + label_share_kobo = gross_kobo
 * P13: artiste_ref_id opaque; contract terms / royalty splits NEVER to AI
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for royalty distribution; Tier 3 for international streaming above ₦5M
 */

export type RecordingLabelFSMState =
  | 'seeded'
  | 'claimed'
  | 'coson_registered'
  | 'active'
  | 'suspended';

export type ArtisteStatus = 'signed' | 'released' | 'suspended';

const FSM_TRANSITIONS: Record<RecordingLabelFSMState, RecordingLabelFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['coson_registered'],
  coson_registered: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidRecordingLabelTransition(from: RecordingLabelFSMState, to: RecordingLabelFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCosonRegistered(input: { cosonMembership: string | null }): GuardResult {
  if (!input.cosonMembership || input.cosonMembership.trim() === '') {
    return { allowed: false, reason: 'COSON membership required to register record label' };
  }
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Recording label AI capped at L2 advisory — catalogue aggregate only' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Recording label AI capped at L2' };
  }
  return { allowed: true };
}

export function guardNoRoyaltyDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'artiste_ref_id', 'artisteRefId', 'royalty_split_bps', 'royaltySplitBps',
    'artiste_share_kobo', 'artisteShareKobo', 'contract_terms', 'contractTerms',
  ];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: royalty/artiste data "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardIntegerBps(bps: number): GuardResult {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    return { allowed: false, reason: 'royalty_split_bps must be an integer between 0 and 10000 (basis points)' };
  }
  return { allowed: true };
}

export function guardRoyaltyArithmetic(input: {
  grossKobo: number; artisteShareKobo: number; labelShareKobo: number;
}): GuardResult {
  if (input.artisteShareKobo + input.labelShareKobo !== input.grossKobo) {
    return { allowed: false, reason: `Royalty arithmetic: artiste_share_kobo (${input.artisteShareKobo}) + label_share_kobo (${input.labelShareKobo}) must equal gross_kobo (${input.grossKobo})` };
  }
  return { allowed: true };
}

export interface RecordingLabelProfile {
  id: string; workspaceId: string; tenantId: string;
  labelName: string; cosonMembership: string | null; mcsnRegistration: string | null; cacRc: string | null;
  status: RecordingLabelFSMState; createdAt: number; updatedAt: number;
}

export interface LabelArtiste {
  id: string; profileId: string; tenantId: string;
  artisteRefId: string; royaltySplitBps: number; contractStart: number;
  contractEnd: number | null; status: ArtisteStatus; createdAt: number; updatedAt: number;
}

export interface LabelRelease {
  id: string; profileId: string; tenantId: string;
  artisteRefId: string; releaseName: string; genre: string; releaseDate: number;
  streamingRevenueKobo: number; createdAt: number;
}

export interface LabelRoyaltyDistribution {
  id: string; profileId: string; tenantId: string;
  artisteRefId: string; period: string; grossKobo: number;
  artisteShareKobo: number; labelShareKobo: number; distributedDate: number; createdAt: number;
}

export interface CreateRecordingLabelInput {
  id?: string; workspaceId: string; tenantId: string;
  labelName: string; cosonMembership?: string; mcsnRegistration?: string; cacRc?: string;
}

export interface CreateArtisteInput {
  id?: string; profileId: string; tenantId: string;
  artisteRefId: string; royaltySplitBps: number; contractStart: number; contractEnd?: number;
}

export interface CreateReleaseInput {
  id?: string; profileId: string; tenantId: string;
  artisteRefId: string; releaseName: string; genre: string; releaseDate: number; streamingRevenueKobo?: number;
}

export interface CreateRoyaltyDistributionInput {
  id?: string; profileId: string; tenantId: string;
  artisteRefId: string; period: string; grossKobo: number;
  artisteShareKobo: number; labelShareKobo: number; distributedDate: number;
}
