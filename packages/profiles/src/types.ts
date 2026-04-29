/**
 * @webwaka/profiles — canonical type definitions for the profiles domain.
 *
 * Schema source of truth: infra/db/migrations/
 *   0005_init_profiles.sql          — base table
 *   0014_kyc_fields.sql             — kyc_tier, bvn_verified_at, nin_verified_at
 *   0314d_extend_entity_and_seed_schemas.sql — tenant_id, workspace_id, vertical_slug, display_name, visibility
 *
 * IMPORTANT — Schema drift note (Phase 0 finding DRIFT-P3-001):
 *   apps/api/src/routes/profiles.ts and apps/tenant-public/src/index.ts query
 *   columns (entity_type, entity_id, place_id, profile_type, claim_status,
 *   avatar_url, headline, content) that have NO confirmed migration as of Phase 0
 *   audit. Resolution requires finding/creating the missing migration before
 *   Phase 1 implementation. See docs/adr/ADR-0041-wakapage-architecture.md.
 */

// ---------------------------------------------------------------------------
// Confirmed column types (from verified migrations only)
// ---------------------------------------------------------------------------

export type ProfileSubjectType = 'individual' | 'organization' | 'place';

export type ProfileClaimState =
  | 'seeded'
  | 'claimable'
  | 'claim_pending'
  | 'verified'
  | 'managed'
  | 'branded'
  | 'monetized'
  | 'delegated';

export type ProfileVerificationState =
  | 'unverified'
  | 'source_verified'
  | 'document_verified'
  | 'verified';

export type ProfilePublicationState = 'published' | 'unpublished' | 'removed';

export type ProfileVisibility = 'public' | 'semi' | 'private';

/**
 * Profile row — confirmed columns only (verified against migration files).
 * See schema drift note above for unconfirmed columns in current route code.
 */
export interface ProfileRow {
  id: string;
  subject_type: ProfileSubjectType;
  subject_id: string;
  claim_state: ProfileClaimState;
  verification_state: ProfileVerificationState;
  publication_state: ProfilePublicationState;
  primary_place_id: string | null;
  /** Added: 0014_kyc_fields */
  kyc_tier: number;
  /** Added: 0014_kyc_fields */
  bvn_verified_at: number | null;
  /** Added: 0014_kyc_fields */
  nin_verified_at: number | null;
  /** Added: 0314d_extend_entity_and_seed_schemas */
  tenant_id: string | null;
  /** Added: 0314d_extend_entity_and_seed_schemas */
  workspace_id: string | null;
  /** Added: 0314d_extend_entity_and_seed_schemas */
  vertical_slug: string | null;
  /** Added: 0314d_extend_entity_and_seed_schemas */
  display_name: string | null;
  /** Added: 0314d_extend_entity_and_seed_schemas */
  visibility: ProfileVisibility;
  created_at: number;
  updated_at: number;
}

/**
 * Public-facing profile summary for discovery endpoints.
 * Uses only confirmed columns.
 */
export interface PublicProfileSummary {
  id: string;
  subject_type: ProfileSubjectType;
  subject_id: string;
  display_name: string | null;
  claim_state: ProfileClaimState;
  verification_state: ProfileVerificationState;
  visibility: ProfileVisibility;
  primary_place_id: string | null;
  tenant_id: string | null;
  workspace_id: string | null;
  vertical_slug: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Pagination cursor for profile list queries.
 */
export interface ProfileListResult {
  profiles: PublicProfileSummary[];
  nextCursor: string | null;
  total: number;
}

/**
 * Input for slug derivation.
 * WakaPage slugs derive from display_name or entity slug (DRIFT-P3-001 note:
 * profiles.slug does NOT exist as a column — slug must be computed).
 */
export interface BuildProfileSlugInput {
  displayName: string;
  suffix?: string;
}
