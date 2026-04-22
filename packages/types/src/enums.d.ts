/**
 * Platform-wide enums derived from approved governance documents.
 * Universal Entity Model, Geography Taxonomy, Political Taxonomy, Entitlement Model.
 */
export declare const EntityType: {
    readonly Individual: "individual";
    readonly Organization: "organization";
    readonly Place: "place";
    readonly Offering: "offering";
    readonly Profile: "profile";
    readonly Workspace: "workspace";
    readonly BrandSurface: "brand_surface";
};
export type EntityType = (typeof EntityType)[keyof typeof EntityType];
export declare const GeographyLevel: {
    readonly Country: 1;
    readonly GeopoliticalZone: 2;
    readonly State: 3;
    readonly LocalGovernmentArea: 4;
    readonly Ward: 5;
    readonly Community: 6;
    readonly Household: 7;
    readonly FacilityPlace: 8;
};
export type GeographyLevel = (typeof GeographyLevel)[keyof typeof GeographyLevel];
export declare const GeographyType: {
    readonly Country: "country";
    readonly GeopoliticalZone: "geopolitical_zone";
    readonly State: "state";
    readonly LocalGovernmentArea: "local_government_area";
    readonly Ward: "ward";
    readonly Community: "community";
    readonly Household: "household";
    readonly Market: "market";
    readonly MotorPark: "motor_park";
    readonly Warehouse: "warehouse";
    readonly Office: "office";
    readonly Branch: "branch";
    readonly Hub: "hub";
    readonly ConstituencyOffice: "constituency_office";
    readonly Campus: "campus";
    readonly Clinic: "clinic";
    readonly School: "school";
};
export type GeographyType = (typeof GeographyType)[keyof typeof GeographyType];
/** Which geography types are facility-level (level 8) */
export declare const FACILITY_GEOGRAPHY_TYPES: ReadonlySet<GeographyType>;
export declare const PoliticalOfficeType: {
    readonly Councilor: "councilor";
    readonly LocalGovernmentChairman: "local_government_chairman";
    readonly StateHouseOfAssemblyMember: "state_house_of_assembly_member";
    readonly HouseOfRepresentativesMember: "house_of_representatives_member";
    readonly Senator: "senator";
    readonly Governor: "governor";
    readonly President: "president";
};
export type PoliticalOfficeType = (typeof PoliticalOfficeType)[keyof typeof PoliticalOfficeType];
export declare const PoliticalTerritoryType: {
    readonly Ward: "ward";
    readonly LocalGovernmentArea: "local_government_area";
    readonly StateConstituency: "state_constituency";
    readonly FederalConstituency: "federal_constituency";
    readonly SenatorialDistrict: "senatorial_district";
    readonly State: "state";
    readonly Country: "country";
};
export type PoliticalTerritoryType = (typeof PoliticalTerritoryType)[keyof typeof PoliticalTerritoryType];
export declare const ClaimLifecycleState: {
    readonly Seeded: "seeded";
    readonly Claimable: "claimable";
    readonly ClaimPending: "claim_pending";
    readonly Verified: "verified";
    readonly Managed: "managed";
    readonly Branded: "branded";
    readonly Monetized: "monetized";
    readonly Delegated: "delegated";
};
export type ClaimLifecycleState = (typeof ClaimLifecycleState)[keyof typeof ClaimLifecycleState];
export declare const VerificationState: {
    readonly Unverified: "unverified";
    readonly Pending: "pending";
    readonly Verified: "verified";
    readonly Rejected: "rejected";
    readonly RequiresEnhanced: "requires_enhanced";
};
export type VerificationState = (typeof VerificationState)[keyof typeof VerificationState];
export declare const PublicationState: {
    readonly Draft: "draft";
    readonly Published: "published";
    readonly Unlisted: "unlisted";
    readonly Archived: "archived";
    readonly Suspended: "suspended";
};
export type PublicationState = (typeof PublicationState)[keyof typeof PublicationState];
export declare const SubscriptionPlan: {
    readonly Free: "free";
    readonly Starter: "starter";
    readonly Growth: "growth";
    readonly Pro: "pro";
    readonly Enterprise: "enterprise";
    readonly Partner: "partner";
    readonly SubPartner: "sub_partner";
};
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];
export declare const SubscriptionStatus: {
    readonly Active: "active";
    readonly Trialing: "trialing";
    readonly PastDue: "past_due";
    readonly Cancelled: "cancelled";
    readonly Suspended: "suspended";
};
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export declare const PlatformLayer: {
    readonly Discovery: "discovery";
    readonly Operational: "operational";
    readonly Commerce: "commerce";
    readonly Transport: "transport";
    readonly Civic: "civic";
    readonly Political: "political";
    readonly Institutional: "institutional";
    readonly Professional: "professional";
    readonly Creator: "creator";
    readonly WhiteLabel: "white_label";
    readonly AI: "ai";
};
export type PlatformLayer = (typeof PlatformLayer)[keyof typeof PlatformLayer];
export declare const Role: {
    readonly SuperAdmin: "super_admin";
    readonly Admin: "admin";
    readonly Manager: "manager";
    readonly Agent: "agent";
    readonly Cashier: "cashier";
    readonly Member: "member";
    readonly Public: "public";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const RelationshipType: {
    readonly Owns: "owns";
    readonly Manages: "manages";
    readonly Claims: "claims";
    readonly AffiliatedWith: "affiliated_with";
    readonly BelongsTo: "belongs_to";
    readonly DelegatesTo: "delegates_to";
    readonly Offers: "offers";
    readonly PublishesTo: "publishes_to";
    readonly ListedIn: "listed_in";
    readonly LocatedIn: "located_in";
    readonly OperatesIn: "operates_in";
    readonly Serves: "serves";
    readonly Hosts: "hosts";
    readonly HoldsOffice: "holds_office";
    readonly JurisdictionOver: "jurisdiction_over";
};
export type RelationshipType = (typeof RelationshipType)[keyof typeof RelationshipType];
//# sourceMappingURL=enums.d.ts.map