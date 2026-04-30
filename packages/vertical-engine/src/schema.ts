/**
 * @webwaka/vertical-engine — VerticalConfig Schema
 *
 * This is the foundational schema that expresses any of the 159+ verticals
 * in a single configuration object. The engine uses this config to generate:
 *   - D1 CRUD operations (repos)
 *   - Hono route handlers
 *   - FSM transition logic + guards
 *   - AI capability declarations
 *   - Test assertions
 *
 * Design Principles:
 *   P1: Build Once Use Infinitely — one engine, 159 verticals
 *   T3: tenant_id always present in generated queries
 *   P9: monetary fields explicitly marked (kobo integers)
 *   P13: PII fields explicitly marked (never sent to AI)
 *   P7: AI capabilities declared, never hardcoded to provider
 */

// ---------------------------------------------------------------------------
// Core Scalar Types
// ---------------------------------------------------------------------------

export type FieldType =
  | 'string'       // TEXT in D1
  | 'integer'      // INTEGER in D1 (also for kobo, timestamps)
  | 'boolean'      // INTEGER 0/1 in D1
  | 'enum'         // TEXT with CHECK constraint in D1
  | 'timestamp'    // INTEGER (unix seconds) in D1
  | 'uuid'         // TEXT (UUID string) in D1
  | 'kobo'         // INTEGER (kobo amount — P9 enforced, never float)
  | 'scaled_int';  // INTEGER stored as value × multiplier (e.g., ×1000 for sub-units)

export type AICapabilityType =
  | 'bio_generator'
  | 'brand_copywriter'
  | 'demand_forecasting'
  | 'sentiment_analysis'
  | 'translation'
  | 'scheduling_assistant'
  | 'inventory_advisory'
  | 'price_suggest'
  | 'customer_segmentation'
  | 'route_optimizer'
  | 'compliance_checker'
  | 'document_extractor'
  | 'market_insights'
  | 'content_freshness'
  | 'anomaly_detection'
  | 'occupancy_advisory'
  | 'revenue_forecast'
  | 'venue_utilization'
  | 'member_engagement'
  | 'broadcast_scheduling'
  | 'event_planning'
  | 'curriculum_planner'
  | 'legal_summary';

export type AIAutonomyLevel = 1 | 2 | 3;
export type PillarType = 1 | 2 | 3; // 1=ops, 2=marketplace, 3=civic

// ---------------------------------------------------------------------------
// Field Definition
// ---------------------------------------------------------------------------

export interface FieldDef {
  /** Column name in D1 table (snake_case) */
  column: string;
  /** TypeScript property name (camelCase) */
  property: string;
  /** Data type */
  type: FieldType;
  /** For enum type: allowed values */
  enumValues?: readonly string[];
  /** For scaled_int: multiplier (e.g., 1000) */
  scaledMultiplier?: number;
  /** Is this field required on create? */
  required?: boolean;
  /** Default value (SQL expression or literal) */
  defaultValue?: string | number | null;
  /** Is nullable? */
  nullable?: boolean;
  /** P9: Is this a monetary field in kobo? */
  isKobo?: boolean;
  /** P13: Is this PII that must NEVER be sent to AI? */
  isPII?: boolean;
  /** Should this field be included in AI context? (default: true unless isPII) */
  aiVisible?: boolean;
  /** Human-readable label */
  label?: string;
}

// ---------------------------------------------------------------------------
// FSM Definition
// ---------------------------------------------------------------------------

export interface FSMTransitionDef {
  from: string;
  to: string;
  /** Guard function name (optional — if present, this transition requires a guard check) */
  guard?: string;
  /** Human-readable description of what this transition means */
  description?: string;
}

export interface FSMGuardDef {
  /** Guard function name (referenced by FSMTransitionDef.guard) */
  name: string;
  /** Fields required to evaluate the guard */
  requiredFields: string[];
  /** Human-readable rule description */
  rule: string;
  /** Error message when guard fails */
  failureMessage: string;
}

export interface FSMConfig {
  /** All possible states */
  states: readonly string[];
  /** Initial state (default: 'seeded') */
  initialState: string;
  /** Valid transitions */
  transitions: readonly FSMTransitionDef[];
  /** Guard definitions */
  guards?: readonly FSMGuardDef[];
}

// ---------------------------------------------------------------------------
// Sub-Entity Definition
// ---------------------------------------------------------------------------

export interface SubEntityDef {
  /** Entity name (snake_case for table, PascalCase for type) */
  name: string;
  /** D1 table name */
  tableName: string;
  /** Fields for this sub-entity */
  fields: readonly FieldDef[];
  /** Foreign key to main profile */
  profileForeignKey: string;
  /** Does this sub-entity have its own FSM? */
  fsm?: FSMConfig;
  /** P13 fields that must never be sent to AI */
  piiFields?: readonly string[];
}

// ---------------------------------------------------------------------------
// AI Configuration
// ---------------------------------------------------------------------------

export interface VerticalAIConfig {
  /** Maximum AI autonomy level (1=read-only, 2=suggest, 3=auto-execute with HITL) */
  autonomyLevel: AIAutonomyLevel;
  /** Allowed capabilities for this vertical */
  allowedCapabilities: readonly AICapabilityType[];
  /** Explicitly prohibited capabilities */
  prohibitedCapabilities?: readonly AICapabilityType[];
  /** Use case descriptions for the AI agent */
  useCases: readonly string[];
  /** Context window token budget */
  contextWindowTokens?: number;
  /** Whether this vertical requires HITL for ALL AI operations */
  hitlMandatoryAll?: boolean;
  /** Specific capabilities that require HITL */
  hitlRequired?: readonly AICapabilityType[];
}

// ---------------------------------------------------------------------------
// Route Configuration
// ---------------------------------------------------------------------------

export interface RouteConfig {
  /** Base path prefix for this vertical (e.g., '/bakery') */
  basePath: string;
  /** Whether to mount under /api/v1/ prefix */
  v1Prefix?: boolean;
  /** Whether to mount under /api/v1/verticals/ prefix (set-J style) */
  verticalsPrefix?: boolean;
  /** Required entitlement layer */
  entitlementLayer?: 'Operational' | 'Commerce' | 'Transport' | 'Civic' | 'Political';
  /** Additional route aliases (deprecated slugs that still need to route here) */
  aliases?: readonly string[];
}

// ---------------------------------------------------------------------------
// Compliance & KYC Configuration
// ---------------------------------------------------------------------------

export interface ComplianceDef {
  /** Minimum KYC tier for claim */
  kycTierForClaim?: number;
  /** Minimum KYC tier for full operations */
  kycTierForActive?: number;
  /** Required licence/registration for verification */
  requiredLicences?: readonly string[];
  /** Sensitive sector classification */
  sensitiveSector?: 'health' | 'finance' | 'legal' | 'child_welfare' | 'extractives' | null;
  /** NDPR data classification level */
  ndprLevel?: 'standard' | 'sensitive' | 'critical';
}

// ---------------------------------------------------------------------------
// Main VerticalConfig — Top-Level Schema
// ---------------------------------------------------------------------------

export interface VerticalConfig {
  /** Unique slug (kebab-case) — used for routing, DB table prefix, AI lookup */
  slug: string;
  /** Human-readable display name */
  displayName: string;
  /** Primary pillar (1=ops, 2=marketplace, 3=civic) */
  primaryPillar: PillarType;
  /** Which milestone this vertical was introduced */
  milestone: string;
  /** Implementation maturity (helps prioritize engine migration) */
  maturity: 'stub' | 'basic' | 'full';
  /** D1 table name for the main profile */
  tableName: string;
  /** Profile entity fields (always includes id, workspace_id, tenant_id, status, created_at, updated_at) */
  profileFields: readonly FieldDef[];
  /** Create input fields (subset of profileFields that are user-provided) */
  createFields: readonly string[];
  /** Update input fields (subset of profileFields that are mutable) */
  updateFields: readonly string[];
  /** FSM configuration */
  fsm: FSMConfig;
  /** Sub-entities (orders, products, memberships, etc.) */
  subEntities?: readonly SubEntityDef[];
  /** AI configuration */
  ai: VerticalAIConfig;
  /** Route configuration */
  route: RouteConfig;
  /** Compliance/KYC requirements */
  compliance?: ComplianceDef;
  /** Deprecated slug aliases that should redirect to this vertical */
  deprecatedAliases?: readonly string[];
  /** Entity type classification */
  entityType?: 'organization' | 'individual' | 'place';
  /** Tags for categorization */
  tags?: readonly string[];
}

// ---------------------------------------------------------------------------
// Registry Types
// ---------------------------------------------------------------------------

export type VerticalRegistry = Record<string, VerticalConfig>;

export interface RegistryStats {
  total: number;
  byPillar: Record<PillarType, number>;
  byMaturity: Record<string, number>;
  byMilestone: Record<string, number>;
}
