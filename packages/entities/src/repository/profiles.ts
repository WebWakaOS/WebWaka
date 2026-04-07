/**
 * D1-backed CRUD for profiles (claim-first model).
 * (claim-first-onboarding.md, TDR-0006)
 *
 * Profiles are seeded for entities before they are claimed.
 * Claim lifecycle: seeded → claimable → claim_pending → verified → managed → branded → monetized
 */

import type { Profile, TenantId, ProfileId, PlaceId } from '@webwaka/types';
import { EntityType, ClaimLifecycleState } from '@webwaka/types';
import { generateProfileId } from '../ids.js';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> };
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

type ClaimState = (typeof ClaimLifecycleState)[keyof typeof ClaimLifecycleState];

// Valid claim state transitions (claim-first-onboarding.md §4)
const VALID_TRANSITIONS: Readonly<Record<ClaimState, ClaimState[]>> = {
  [ClaimLifecycleState.Seeded]:       [ClaimLifecycleState.Claimable],
  [ClaimLifecycleState.Claimable]:    [ClaimLifecycleState.ClaimPending],
  [ClaimLifecycleState.ClaimPending]: [ClaimLifecycleState.Verified, ClaimLifecycleState.Claimable],
  [ClaimLifecycleState.Verified]:     [ClaimLifecycleState.Managed],
  [ClaimLifecycleState.Managed]:      [ClaimLifecycleState.Branded, ClaimLifecycleState.Monetized],
  [ClaimLifecycleState.Branded]:      [ClaimLifecycleState.Monetized, ClaimLifecycleState.Delegated],
  [ClaimLifecycleState.Monetized]:    [ClaimLifecycleState.Delegated],
  [ClaimLifecycleState.Delegated]:    [],
};

export class InvalidClaimTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid claim state transition: '${from}' → '${to}'`);
    this.name = 'InvalidClaimTransitionError';
  }
}

interface ProfileRow {
  id: string;
  subject_type: string;
  subject_id: string;
  primary_place_id: string | null;
  claim_state: string;
  verified_by: string | null;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id as ProfileId,
    subjectType: row.subject_type as EntityType,
    subjectId: row.subject_id,
    primaryPlaceId: row.primary_place_id as PlaceId | undefined,
    claimState: row.claim_state as ClaimState,
    verifiedBy: row.verified_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Profile;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

/**
 * Seed a profile for an entity. Initial state: 'seeded'.
 * Seeded profiles are visible in discovery but not yet claimed.
 */
export async function seedProfile(
  db: D1Like,
  subjectType: EntityType,
  subjectId: string,
  primaryPlaceId?: PlaceId,
): Promise<Profile> {
  const id = generateProfileId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO profiles (id, subject_type, subject_id, primary_place_id, claim_state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(id, subjectType, subjectId, primaryPlaceId ?? null, ClaimLifecycleState.Seeded)
    .run();

  return {
    id,
    subjectType,
    subjectId,
    primaryPlaceId,
    claimState: ClaimLifecycleState.Seeded,
    createdAt: now,
    updatedAt: now,
  } as unknown as Profile;
}

/**
 * Advance a profile to the next claim lifecycle state.
 * Validates the transition against the allowed transition map.
 */
export async function advanceClaimState(
  db: D1Like,
  profileId: ProfileId,
  nextState: ClaimState,
  verifiedBy?: string,
): Promise<Profile | null> {
  const profile = await db
    .prepare(
      `SELECT id, subject_type, subject_id, primary_place_id, claim_state, verified_by, tenant_id, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
       FROM profiles WHERE id = ?`,
    )
    .bind(profileId)
    .first<ProfileRow>();

  if (!profile) return null;

  const currentState = profile.claim_state as ClaimState;
  const allowedNext = VALID_TRANSITIONS[currentState] ?? [];

  if (!allowedNext.includes(nextState)) {
    throw new InvalidClaimTransitionError(currentState, nextState);
  }

  await db
    .prepare(
      `UPDATE profiles SET claim_state = ?, verified_by = ?, updated_at = unixepoch() WHERE id = ?`,
    )
    .bind(nextState, verifiedBy ?? profile.verified_by, profileId)
    .run();

  return rowToProfile({ ...profile, claim_state: nextState, verified_by: verifiedBy ?? profile.verified_by });
}

/**
 * Lookup a profile by its subject entity. Used for discovery.
 */
export async function getProfileBySubject(
  db: D1Like,
  subjectType: EntityType,
  subjectId: string,
): Promise<Profile | null> {
  const row = await db
    .prepare(
      `SELECT id, subject_type, subject_id, primary_place_id, claim_state, verified_by, tenant_id, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
       FROM profiles WHERE subject_type = ? AND subject_id = ? LIMIT 1`,
    )
    .bind(subjectType, subjectId)
    .first<ProfileRow>();

  return row ? rowToProfile(row) : null;
}
