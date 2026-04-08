/**
 * Community-specific entitlement dimension helpers.
 * Platform Invariant T5 — Subscription-Gated.
 * Delegates to @webwaka/entitlements for plan evaluation.
 */

/**
 * Dimensions added by the community module.
 * These extend the base entitlement plan evaluation.
 */
export interface CommunityEntitlementDimensions {
  /** Maximum number of community spaces per workspace */
  maxCommunitySpaces: number;
  /** Maximum members per community space */
  maxCommunityMembers: number;
  /** Whether paid membership tiers are enabled */
  paidTiersEnabled: boolean;
  /** Whether course modules are enabled */
  coursesEnabled: boolean;
  /** Maximum course modules per community */
  maxCourseModules: number;
  /** Whether events are enabled */
  eventsEnabled: boolean;
}

/** Free tier community entitlements */
export const FREE_COMMUNITY_ENTITLEMENTS: CommunityEntitlementDimensions = {
  maxCommunitySpaces: 1,
  maxCommunityMembers: 100,
  paidTiersEnabled: false,
  coursesEnabled: false,
  maxCourseModules: 0,
  eventsEnabled: true,
};

/** Growth tier community entitlements */
export const GROWTH_COMMUNITY_ENTITLEMENTS: CommunityEntitlementDimensions = {
  maxCommunitySpaces: 5,
  maxCommunityMembers: 1000,
  paidTiersEnabled: true,
  coursesEnabled: true,
  maxCourseModules: 10,
  eventsEnabled: true,
};

/** Enterprise tier community entitlements */
export const ENTERPRISE_COMMUNITY_ENTITLEMENTS: CommunityEntitlementDimensions = {
  maxCommunitySpaces: -1, // unlimited
  maxCommunityMembers: -1, // unlimited
  paidTiersEnabled: true,
  coursesEnabled: true,
  maxCourseModules: -1, // unlimited
  eventsEnabled: true,
};

/**
 * Assert that paid tiers are enabled for a workspace plan.
 * Throws if the plan does not allow paid membership tiers (T5).
 */
export function assertPaidTiersEnabled(dimensions: CommunityEntitlementDimensions): void {
  if (!dimensions.paidTiersEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Paid membership tiers require a Growth or Enterprise plan (T5)');
  }
}

/**
 * Assert that courses are enabled for a workspace plan.
 */
export function assertCoursesEnabled(dimensions: CommunityEntitlementDimensions): void {
  if (!dimensions.coursesEnabled) {
    throw new Error('ENTITLEMENT_DENIED: Course modules require a Growth or Enterprise plan (T5)');
  }
}

/**
 * Assert maximum community spaces not exceeded.
 */
export function assertMaxSpaces(current: number, dimensions: CommunityEntitlementDimensions): void {
  if (dimensions.maxCommunitySpaces !== -1 && current >= dimensions.maxCommunitySpaces) {
    throw new Error(
      `ENTITLEMENT_DENIED: Plan allows maximum ${dimensions.maxCommunitySpaces} community space(s) (T5)`,
    );
  }
}
