/**
 * @webwaka/profiles — D1-backed profile service for WebWaka OS.
 *
 * Phase 0 implementation — BUG-P3-014 resolution.
 *
 * This package replaces the stub (type-only) implementation with a real
 * D1-backed service layer. All functions are T3-compliant (tenant_id scoped).
 *
 * IMPORTANT — Schema drift note (DRIFT-P3-001):
 *   Current route code in apps/api/src/routes/profiles.ts and
 *   apps/tenant-public/src/index.ts references columns (entity_type,
 *   entity_id, place_id, profile_type, claim_status, avatar_url, headline,
 *   content) that have no confirmed migration as of Phase 0 audit.
 *   These columns MUST be confirmed or added via migration before Phase 1
 *   implements WakaPage public-surface rendering. See ADR-0041 and the
 *   Phase 0 findings ledger.
 *
 * Package boundary:
 *   - Types only: re-exported from ./types.ts
 *   - D1 queries: ./db.ts
 *   - Slug utility: this file (unchanged from stub — remains a pure function)
 *
 * Apps that own profile-specific route logic:
 *   - apps/api/src/routes/profiles.ts (workspace management)
 *   - apps/tenant-public/src/index.ts (public discovery)
 *   - apps/public-discovery (global discovery)
 */

export type {
  ProfileSubjectType,
  ProfileClaimState,
  ProfileVerificationState,
  ProfilePublicationState,
  ProfileVisibility,
  ProfileRow,
  PublicProfileSummary,
  ProfileListResult,
  BuildProfileSlugInput,
} from './types.js';

export type { D1Like } from './db.js';

export {
  getProfilesByWorkspace,
  getProfileById,
  getPublicProfilesByTenant,
  getPublicProfileById,
  getFullProfileById,
  updateProfileVisibility,
  updateProfileClaimState,
} from './db.js';

/**
 * Derive a URL-safe slug from a profile display name.
 *
 * IMPORTANT: profiles.slug does NOT exist as a database column (Phase 0 finding).
 * WakaPage slugs are computed at query time from display_name or entity slug,
 * never stored in the profiles table itself. If a stable slug is needed,
 * it must be stored in the wakapage_pages table (Phase 1 migration).
 */
export function buildProfileSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
