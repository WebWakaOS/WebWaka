/**
 * @webwaka/verticals-gym-fitness — DEPRECATED
 *
 * This package is deprecated. The canonical package is @webwaka/verticals-gym.
 * All exports are re-exported from @webwaka/verticals-gym for backward compatibility.
 *
 * Decision: M1 in docs/governance/vertical-duplicates-and-merge-decisions.md
 * Canonical slug: `gym`
 * This slug (`gym-fitness`) is a deprecated alias.
 *
 * @deprecated Use @webwaka/verticals-gym instead.
 */

export {
  // Types
  type GymFSMState,
  type GymFitnessFSMState,
  type GymProfile,
  type GymFitnessProfile,
  type CreateGymInput,
  type CreateGymFitnessInput,
  type GymMembership,
  type GymEquipment,
  type GymClassSchedule,
  type GymSession,
  type GymEquipmentLog,
  type MembershipType,
  type MembershipStatus,
  type EquipmentCondition,
  type GuardResult,
  // Functions
  isValidGymTransition,
  isValidGymFitnessTransition,
  guardL2AiCap,
  guardNoHealthMetricsToAi,
  // Classes
  GymRepository,
  GymFitnessRepository,
  // Constants
  VERTICAL_SLUG,
  PRIMARY_PILLARS,
  VALID_GYM_TRANSITIONS,
  // Registration
  registerGymVertical,
  guardSeedToClaimed,
} from '@webwaka/verticals-gym';
