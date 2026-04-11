/**
 * @webwaka/verticals-it-support — Domain types (M10)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L1-L2 — SALES_FORECAST, ENGAGEMENT_PIPELINE_REPORT; no client_ref_id (P13)
 * P9: all monetary in kobo; SLA hours as integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type ITSupportFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type TicketType = 'repair' | 'installation' | 'network' | 'support' | 'data_recovery';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_parts' | 'resolved' | 'closed';

const FSM_TRANSITIONS: Record<ITSupportFSMState, ITSupportFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidITSupportTransition(from: ITSupportFSMState, to: ITSupportFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardSlaBreachCheck(input: { openedDate: number; closedDate: number | null; slaHours: number }): boolean {
  if (!input.closedDate) return false;
  return (input.closedDate - input.openedDate) > input.slaHours * 3600;
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'IT support AI capped at L2' };
  return { allowed: true };
}

export interface ITSupportProfile {
  id: string; workspaceId: string; tenantId: string; companyName?: string; nccRef?: string | null;
  cacRc: string | null; serviceType?: string; status: ITSupportFSMState; createdAt: number; updatedAt: number;
  businessName: string;
  nitnCert: string | null;
  ndprConformance: boolean;
  serviceScope: string;
}
export interface CreateITSupportInput {
  id?: string; workspaceId: string; tenantId: string; companyName?: string; serviceType?: string;
  nccRef?: string; cacRc?: string;
  businessName?: string;
  nitnCert?: string;
  ndprConformance?: boolean;
  serviceScope?: string;
}
export interface ITTicket {
  id: string; profileId: string; tenantId: string; clientRefId: string; ticketType?: TicketType;
  deviceType?: string | null; priority: TicketPriority; faultDesc?: string | null;
  labourCostKobo?: number; partsCostKobo?: number; totalCostKobo?: number; slaHours?: number;
  openedDate?: number; closedDate?: number | null; status: TicketStatus; createdAt: number; updatedAt: number;
  issueType: string;
  assignedToRef: string | null;
  resolutionNotes: string | null;
  openedAt: number;
  closedAt: number | null;
  description?: string | null;
}
export interface ITRetainer {
  id: string; profileId: string; tenantId: string; clientRefId: string;
  monthlyRetainerKobo: number; slaResponseHours: number; startDate: number; endDate: number | null;
  status: string; createdAt: number; updatedAt: number;
}

// Compatibility aliases (casing variants used by external routes)
export type ItSupportProfile = ITSupportProfile;
export type CreateItSupportInput = CreateITSupportInput;
export type ItSupportFSMState = ITSupportFSMState;
export type ItTicket = ITTicket;
export interface ItServiceContract {
  id: string; profileId: string; tenantId: string; clientRefId: string;
  contractType?: string; monthlyRetainerKobo?: number; startDate: number; endDate: number | null;
  status: string; createdAt: number; updatedAt: number;
  annualFeeKobo?: number;
  slaDescription?: string | null;
}
export type isValidItSupportTransition = typeof isValidITSupportTransition;
