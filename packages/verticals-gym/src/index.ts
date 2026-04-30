/**
 * @webwaka/verticals-gym — Canonical package for the `gym` vertical (M1 merge decision)
 *
 * This package is the canonical home for the Gym / Wellness Centre vertical.
 * The deprecated `@webwaka/verticals-gym-fitness` package re-exports from here.
 *
 * Canonical slug: `gym`
 * Deprecated alias: `gym-fitness`
 * Decision reference: docs/governance/vertical-duplicates-and-merge-decisions.md (M1)
 */

export * from './types.js';
export * from './gym.js';

export const VERTICAL_SLUG = 'gym';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;

export function registerGymVertical() {
  return {
    slug: VERTICAL_SLUG,
    display_name: 'Gym / Wellness Centre',
    primary_pillars: PRIMARY_PILLARS,
    fsm_states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'] as const,
    entity_type: 'organization' as const,
    milestone: 'M9' as const,
    deprecated_aliases: ['gym-fitness'] as const,
  };
}
