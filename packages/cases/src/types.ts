/**
 * @webwaka/cases — Domain types (Phase 1)
 *
 * Case management module. Covers the full lifecycle:
 *   open → assigned → in_progress → pending_review → resolved → closed
 *
 * Linked to migration 0438 (cases + case_notes tables).
 *
 * T3:  tenant_id on every entity.
 * P10: ndprConsented required before case creation with personal data.
 * P4:  No vertical-specific columns in core Case type.
 */

export type CaseStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending_review'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type CasePriority = 'low' | 'normal' | 'high' | 'urgent';

export type CaseCategory =
  | 'general'
  | 'complaint'
  | 'inquiry'
  | 'support'
  | 'compliance'
  | 'electoral'
  | 'welfare';

export type CaseSourceChannel = 'web' | 'ussd' | 'whatsapp' | 'sms' | 'voice' | 'in_person' | 'api';

export type NoteType = 'comment' | 'status_change' | 'assignment' | 'system' | 'resolution';

export interface Case {
  id: string;
  tenantId: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  category: CaseCategory;
  sourceChannel: CaseSourceChannel;
  groupId: string | null;
  reportedByUserId: string | null;
  assignedToUserId: string | null;
  assignedAt: number | null;
  resolvedAt: number | null;
  closedAt: number | null;
  slaDueAt: number | null;
  ndprConsented: boolean;
  tags: string[];
  metadataJson: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface CaseNote {
  id: string;
  caseId: string;
  tenantId: string;
  authorId: string;
  noteType: NoteType;
  body: string;
  isInternal: boolean;
  metadataJson: Record<string, unknown>;
  createdAt: number;
}

// ── Input types ──────────────────────────────────────────────────

export interface CreateCaseInput {
  tenantId: string;
  workspaceId: string;
  title: string;
  description?: string;
  priority?: CasePriority;
  category?: CaseCategory;
  sourceChannel?: CaseSourceChannel;
  groupId?: string;
  reportedByUserId?: string;
  slaDueAt?: number;
  ndprConsented: boolean; // P10: required
  tags?: string[];
  metadataJson?: Record<string, unknown>;
}

export interface AssignCaseInput {
  caseId: string;
  tenantId: string;
  assignedToUserId: string;
  assignedByUserId: string;
}

export interface AddNoteInput {
  caseId: string;
  tenantId: string;
  authorId: string;
  body: string;
  noteType?: NoteType;
  isInternal?: boolean;
  metadataJson?: Record<string, unknown>;
}

export interface ResolveCaseInput {
  caseId: string;
  tenantId: string;
  resolvedByUserId: string;
  resolutionNote: string;
}

export interface CloseCaseInput {
  caseId: string;
  tenantId: string;
  closedByUserId: string;
}

export interface ReopenCaseInput {
  caseId: string;
  tenantId: string;
  reopenedByUserId: string;
  reason: string;
}

export interface ListCasesInput {
  tenantId: string;
  workspaceId?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  assignedToUserId?: string;
  groupId?: string;
  limit?: number;
  offset?: number;
}

export interface CaseSummary {
  totalOpen: number;
  totalAssigned: number;
  totalResolved: number;
  breachingSla: number;
  avgResolutionSeconds: number | null;
}
