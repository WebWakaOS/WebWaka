/**
 * @webwaka/verticals-laundry — DEPRECATED
 *
 * This package is deprecated. The canonical package is @webwaka/verticals-laundry-service.
 * All exports are re-exported from @webwaka/verticals-laundry-service for backward compatibility.
 *
 * Decision: M2 in docs/governance/vertical-duplicates-and-merge-decisions.md
 * Canonical slug: `laundry-service`
 * This slug (`laundry`) is a deprecated alias.
 *
 * @deprecated Use @webwaka/verticals-laundry-service instead.
 */

export {
  // Types
  type LaundryServiceFSMState as LaundryFSMState,
  type LaundryServiceProfile as LaundryProfile,
  type CreateLaundryServiceInput as CreateLaundryInput,
  type LaundryServiceOrder as LaundryOrder,
  type LaundryServiceSubscription as LaundrySubscription,
  type LaundryServiceFSMState,
  type LaundryServiceProfile,
  type CreateLaundryServiceInput,
  type LaundryServiceOrder,
  type LaundryServiceSubscription,
  type LaundryServiceMachine,
  type LaundryServiceSession,
  type MachineType,
  type MachineStatus,
  type SessionStatus,
  type GuardResult,
  // Functions
  isValidLaundryServiceTransition,
  isValidLaundryServiceTransition as isValidLaundryTransition,
  guardL2AiCap,
  guardSeedToClaimed,
  // Classes
  LaundryServiceRepository,
  LaundryServiceRepository as LaundryRepository,
  // Constants
  VERTICAL_SLUG,
  PRIMARY_PILLARS,
  DEPRECATED_ALIASES,
} from '@webwaka/verticals-laundry-service';
