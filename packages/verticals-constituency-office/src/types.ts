/**
 * @webwaka/verticals-constituency-office — Domain types
 * M12 — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → inec_verified → active → suspended
 * KYC: Tier 3 — public fund management
 * AI: L3 HITL MANDATORY — no constituency insight published without human review
 * P9: All monetary amounts in integer kobo
 * P13: complainant PII never passed to AI layer (complaint_ref, subject only)
 */

export type ConstituencyOfficeFSMState =
  | 'seeded'
  | 'claimed'
  | 'inec_verified'
  | 'active'
  | 'suspended';

export type OfficeType = 'senator' | 'rep' | 'state_assembly';

export type ProjectCategory = 'road' | 'school' | 'borehole' | 'health' | 'other';

export type ProjectStatus = 'planned' | 'funded' | 'in_progress' | 'completed';

export type ComplaintStatus = 'received' | 'assigned' | 'resolved';

export interface ConstituencyOfficeProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  legislatorName: string;
  officeType: OfficeType;
  constituencyName: string | null;
  inecSeatNumber: string | null;
  status: ConstituencyOfficeFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateConstituencyOfficeInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  legislatorName: string;
  officeType?: OfficeType | undefined;
  constituencyName?: string | undefined;
}

export interface UpdateConstituencyOfficeInput {
  legislatorName?: string | undefined;
  officeType?: OfficeType | undefined;
  constituencyName?: string | null | undefined;
  inecSeatNumber?: string | null | undefined;
  status?: ConstituencyOfficeFSMState | undefined;
}

export interface ConstituencyProject {
  id: string;
  profileId: string;
  tenantId: string;
  projectName: string;
  category: ProjectCategory;
  lga: string | null;
  allocatedKobo: number;
  disbursedKobo: number;
  contractor: string | null;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  projectName: string;
  category?: ProjectCategory | undefined;
  lga?: string | undefined;
  allocatedKobo: number;
  disbursedKobo?: number | undefined;
  contractor?: string | undefined;
}

export interface ConstituencyComplaint {
  id: string;
  profileId: string;
  tenantId: string;
  complaintRef: string;
  lga: string | null;
  ward: string | null;
  subject: string;
  description: string | null;
  status: ComplaintStatus;
  assignedTo: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateComplaintInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  complaintRef: string;
  lga?: string | undefined;
  ward?: string | undefined;
  subject: string;
  description?: string | undefined;
}

export interface ConstituencyOutreach {
  id: string;
  profileId: string;
  tenantId: string;
  eventDate: number | null;
  lga: string | null;
  eventType: string | null;
  attendeesCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateOutreachInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  eventDate?: number | undefined;
  lga?: string | undefined;
  eventType?: string | undefined;
  attendeesCount?: number | undefined;
}

export const VALID_CONSTITUENCY_TRANSITIONS: Record<ConstituencyOfficeFSMState, ConstituencyOfficeFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['inec_verified', 'suspended'],
  inec_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidConstituencyTransition(from: ConstituencyOfficeFSMState, to: ConstituencyOfficeFSMState): boolean {
  return VALID_CONSTITUENCY_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToInecVerified(ctx: { inecSeatNumber: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.inecSeatNumber) return { allowed: false, reason: 'INEC seat number required for inec_verified transition' };
  if (ctx.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for constituency office' };
  return { allowed: true };
}

export function guardAiHitl(ctx: { autonomyLevel: string }): { allowed: boolean; reason?: string } {
  if (ctx.autonomyLevel !== 'L3_HITL') return { allowed: false, reason: 'L3 HITL flag mandatory for all AI routes in constituency-office vertical' };
  return { allowed: true };
}
