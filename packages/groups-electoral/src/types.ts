/**
 * @webwaka/groups-electoral — Electoral extension types for @webwaka/groups.
 *
 * Phase 0: GOTV types extracted from @webwaka/support-groups into their own
 * electoral-specific package. The core @webwaka/groups package has no electoral
 * coupling; this extension is loaded only for political/election tenants.
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   P13 — voter_ref NEVER passed to AI, NEVER in list-API responses
 *   P4  — electoral fields in extension tables, not core groups table
 *
 * DB tables: group_electoral_extensions, political_gotv_records
 */

// ---------------------------------------------------------------------------
// Electoral extension (for groups with category = 'election' | 'political')
// DB table: group_electoral_extensions
// ---------------------------------------------------------------------------

export interface GroupElectoralExtension {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  politicianId: string | null;
  campaignOfficeId: string | null;
  electionCycleId: string | null;
  targetStateCode: string | null;
  targetLgaCode: string | null;
  targetWardCode: string | null;
  inecRegistered: boolean;
  inecRegNumber: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UpsertElectoralExtensionInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  politicianId?: string;
  campaignOfficeId?: string;
  electionCycleId?: string;
  targetStateCode?: string;
  targetLgaCode?: string;
  targetWardCode?: string;
  inecRegistered?: boolean;
  inecRegNumber?: string;
}

// ---------------------------------------------------------------------------
// GOTV (Get-Out-The-Vote) records — DB table: political_gotv_records
//
// P13: voter_ref is a hashed/anonymised voter ID.
//   - Stored in DB for deduplication purposes only.
//   - NEVER returned in list-API responses.
//   - NEVER passed to AI or logged in plain text.
//   - Only the GOTV stats aggregates (total/accredited/voted) are surfaced.
// ---------------------------------------------------------------------------

/** @P13 voter_ref is opaque. It is stored for deduplication only. Never pass to AI. */
export interface GotvRecord {
  id: string;
  groupId: string;
  workspaceId: string;
  tenantId: string;
  /** @P13 voter_ref — hashed voter ID. Stored, never surfaced in list APIs or AI context. */
  voterRef: string;
  pollingUnitCode: string;
  stateCode: string | null;
  lgaCode: string | null;
  wardCode: string | null;
  coordinatorMemberId: string;
  accredited: boolean;
  voted: boolean;
  mobilizedAt: number;
  voteConfirmedAt: number | null;
}

export interface GotvStats {
  total: number;
  accredited: number;
  voted: number;
}

export interface RecordGotvInput {
  groupId: string;
  workspaceId: string;
  tenantId: string;
  /** @P13 voter_ref — caller must hash before passing */
  voterRef: string;
  pollingUnitCode: string;
  stateCode?: string;
  lgaCode?: string;
  wardCode?: string;
  coordinatorMemberId: string;
}
