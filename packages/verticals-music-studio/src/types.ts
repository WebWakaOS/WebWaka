/**
 * @webwaka/verticals-music-studio — types + FSM guards (M10)
 * FSM: seeded → claimed → coson_registered → active → suspended
 * AI: L2 cap — studio utilisation aggregate; no royalty splits / deal terms to AI (P13)
 * P9: all monetary values in kobo integers; hours/bpm as integers
 * P13: artiste_ref_id opaque; no session rates or deal terms in AI
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for session billing; Tier 3 for exclusive beat licensing above ₦5M
 */

export type MusicStudioFSMState =
  | 'seeded'
  | 'claimed'
  | 'coson_registered'
  | 'active'
  | 'suspended';

export type StudioType = 'recording' | 'mixing' | 'mastering' | 'rehearsal' | 'all';
export type LicenseType = 'exclusive' | 'non-exclusive';
export type SessionStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';

const FSM_TRANSITIONS: Record<MusicStudioFSMState, MusicStudioFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['coson_registered'],
  coson_registered: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidMusicStudioTransition(from: MusicStudioFSMState, to: MusicStudioFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCosonRegistered(input: { cosonMembership: string | null }): GuardResult {
  if (!input.cosonMembership || input.cosonMembership.trim() === '') {
    return { allowed: false, reason: 'COSON membership number required to register music studio' };
  }
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Music studio AI capped at L2 advisory — utilisation reports only' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Music studio AI capped at L2' };
  }
  return { allowed: true };
}

export function guardNoRoyaltyDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'artiste_ref_id', 'artisteRefId', 'session_rate_kobo', 'sessionRateKobo',
    'royalty_split', 'royaltySplit', 'deal_terms', 'dealTerms',
  ];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: royalty/deal detail "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardIntegerHours(hours: number): GuardResult {
  if (!Number.isInteger(hours) || hours <= 0) return { allowed: false, reason: 'Session hours must be a positive integer' };
  return { allowed: true };
}

export function guardIntegerBpm(bpm: number): GuardResult {
  if (!Number.isInteger(bpm) || bpm <= 0) return { allowed: false, reason: 'BPM must be a positive integer' };
  return { allowed: true };
}

export interface MusicStudioProfile {
  id: string; workspaceId: string; tenantId: string;
  studioName: string; cosonMembership: string | null; mcsnRegistration: string | null;
  cacRc: string | null; studioType: StudioType;
  status: MusicStudioFSMState; createdAt: number; updatedAt: number;
}

export interface StudioSession {
  id: string; profileId: string; tenantId: string;
  artisteRefId: string; engineerRefId: string | null; bookingDate: number;
  hours: number; sessionRateKobo: number; totalKobo: number;
  status: SessionStatus; createdAt: number; updatedAt: number;
}

export interface StudioBeat {
  id: string; profileId: string; tenantId: string;
  beatName: string; producerRefId: string; genre: string; bpm: number;
  licenseType: LicenseType; licenseFeeKobo: number; streamsReference: string | null; createdAt: number;
}

export interface StudioEquipment {
  id: string; profileId: string; tenantId: string;
  equipmentName: string; brand: string | null; purchaseCostKobo: number;
  condition: EquipmentCondition; createdAt: number;
}

export interface CreateMusicStudioInput {
  id?: string; workspaceId: string; tenantId: string;
  studioName: string; cosonMembership?: string; mcsnRegistration?: string;
  cacRc?: string; studioType?: StudioType;
}

export interface CreateSessionInput {
  id?: string; profileId: string; tenantId: string;
  artisteRefId: string; engineerRefId?: string; bookingDate: number;
  hours: number; sessionRateKobo: number; totalKobo: number;
}

export interface CreateBeatInput {
  id?: string; profileId: string; tenantId: string;
  beatName: string; producerRefId: string; genre: string; bpm: number;
  licenseType: LicenseType; licenseFeeKobo: number; streamsReference?: string;
}

export interface CreateEquipmentInput {
  id?: string; profileId: string; tenantId: string;
  equipmentName: string; brand?: string; purchaseCostKobo: number; condition?: EquipmentCondition;
}
