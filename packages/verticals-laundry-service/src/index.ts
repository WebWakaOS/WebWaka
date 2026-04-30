/**
 * @webwaka/verticals-laundry-service — Canonical package for the laundry vertical (M2 merge decision)
 *
 * This package is the canonical home for the Laundry / Laundromat vertical.
 * The deprecated `@webwaka/verticals-laundry` package re-exports from here.
 *
 * Canonical slug: `laundry-service`
 * Deprecated alias: `laundry`
 * Decision reference: docs/governance/vertical-duplicates-and-merge-decisions.md (M2)
 */

export * from './laundry-service.js';
export * from './types.js';

export const VERTICAL_SLUG = 'laundry-service';
export const PRIMARY_PILLARS = ['ops', 'marketplace'] as const;
export const DEPRECATED_ALIASES = ['laundry'] as const;

// Backward-compat type aliases for @webwaka/verticals-laundry consumers
export type { LaundryServiceFSMState as LaundryFSMState } from './types.js';
export type { LaundryServiceProfile as LaundryProfile } from './types.js';
export type { CreateLaundryServiceInput as CreateLaundryInput } from './types.js';
export type { LaundryServiceOrder as LaundryOrder } from './types.js';
export type { LaundryServiceSubscription as LaundrySubscription } from './types.js';
export { isValidLaundryServiceTransition as isValidLaundryTransition } from './types.js';
export { LaundryServiceRepository as LaundryRepository } from './laundry-service.js';
