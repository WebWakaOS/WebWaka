/**
 * @webwaka/verticals-motivational-speaker — Domain types (M12)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — ENGAGEMENT_PIPELINE_REPORT, CASH_FLOW_FORECAST; no client/participant refs (P13)
 * P9: all monetary in kobo integers
 * P13: client_ref_id, participant_ref opaque
 * T3: tenant_id always present
 */

export type MotivationalSpeakerFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type EngagementStatus = 'enquiry' | 'confirmed' | 'completed' | 'cancelled';
export type ProgramStatus = 'open' | 'full' | 'completed' | 'cancelled';
export type EnrollmentStatus = 'enrolled' | 'attended' | 'no_show' | 'refunded';

const FSM_TRANSITIONS: Record<MotivationalSpeakerFSMState, MotivationalSpeakerFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidMotivationalSpeakerTransition(from: MotivationalSpeakerFSMState, to: MotivationalSpeakerFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Motivational speaker AI capped at L2' };
  return { allowed: true };
}

export interface MotivationalSpeakerProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; speakerName: string;
  cacRc: string | null; specialisation: string | null; itfTrainingAffiliate: boolean;
  status: MotivationalSpeakerFSMState; createdAt: number; updatedAt: number;
}
export interface CreateMotivationalSpeakerInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; speakerName: string;
  cacRc?: string; specialisation?: string; itfTrainingAffiliate?: boolean;
}
export interface SpeakingEngagement {
  id: string; profileId: string; tenantId: string; clientRefId: string; eventName: string;
  eventDate: number; audienceSize: number; feeKobo: number; travelKobo: number; totalKobo: number;
  status: EngagementStatus; createdAt: number; updatedAt: number;
}
export interface TrainingProgram {
  id: string; profileId: string; tenantId: string; programName: string; durationDays: number;
  capacity: number; feePerParticipantKobo: number; upcomingDate: number | null;
  status: ProgramStatus; createdAt: number; updatedAt: number;
}
export interface TrainingEnrollment {
  id: string; programId: string; tenantId: string; participantRef: string; enrollmentDate: number;
  feeKobo: number; status: EnrollmentStatus; createdAt: number;
}
