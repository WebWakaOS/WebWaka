/**
 * @webwaka/groups-civic — Civic group extension types
 *
 * Phase 2: NGO governance, beneficiary tracking for civic/advocacy groups.
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   P4  — civic fields in group_civic_extensions; core groups table UNTOUCHED
 *   P10 — ndpr_consented required on BeneficiaryRecord creation
 *   P13 — no NIN, BVN, or voter_ref in beneficiary records
 */

export type BeneficiaryCategory = 'youth' | 'woman' | 'pwdi' | 'elderly' | 'widow' | 'general';
export type BeneficiaryStatus = 'active' | 'exited' | 'deceased';

// ---------------------------------------------------------------------------
// Civic Extension — DB table: group_civic_extensions
// ---------------------------------------------------------------------------

export interface GroupCivicExtension {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  ngoRegNumber: string | null;
  ngoRegBody: string | null;
  beneficiaryTracking: boolean;
  focusArea: string | null;
  stateCode: string | null;
  lgaCode: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UpsertCivicExtensionInput {
  groupId: string;
  tenantId: string;
  workspaceId: string;
  ngoRegNumber?: string;
  ngoRegBody?: string;
  beneficiaryTracking?: boolean;
  focusArea?: string;
  stateCode?: string;
  lgaCode?: string;
}

// ---------------------------------------------------------------------------
// Beneficiary Record — DB table: group_civic_beneficiaries
// ---------------------------------------------------------------------------

export interface BeneficiaryRecord {
  id: string;
  tenantId: string;
  groupId: string;
  workspaceId: string;
  displayName: string;
  category: BeneficiaryCategory | null;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  ndprConsented: boolean;
  status: BeneficiaryStatus;
  enrolledAt: number;
  exitedAt: number | null;
  notes: string | null;
}

export interface AddBeneficiaryInput {
  tenantId: string;
  groupId: string;
  workspaceId: string;
  displayName: string;
  ndprConsented: boolean;
  category?: BeneficiaryCategory;
  stateCode?: string;
  lgaCode?: string;
  wardCode?: string;
  notes?: string;
}
