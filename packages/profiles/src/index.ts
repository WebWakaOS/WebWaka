/**
 * @webwaka/profiles — public profile management type contracts.
 *
 * BUG-P3-014 note: This package is currently a scaffold (stub).
 * No app or package currently imports from @webwaka/profiles.
 * Actual profile management is done via raw D1 queries in:
 *   - apps/api/src/routes/profiles.ts
 *   - apps/tenant-public/src/index.ts
 *
 * Resolution options (tracked in backlog):
 *   (a) Implement the package as a D1-backed profile service and import
 *       it from all profile-management routes (preferred — aligns with P1).
 *   (b) Remove the package and document the decision in an ADR.
 *
 * Until resolved, this file documents the shared type contract only.
 */
export type ProfileType = 'individual' | 'organization' | 'workspace';

export interface PublicProfile {
  id: string;
  tenant_id: string;
  type: ProfileType;
  slug: string;
  display_name: string;
  bio?: string;
  place_id?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export function buildProfileSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
