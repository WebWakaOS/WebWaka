/**
 * Typed relationship primitives for WebWaka OS.
 * (relationship-schema.md, TDR-0013)
 *
 * All entity-to-entity connections are expressed as typed relationships.
 * This avoids foreign key sprawl and enables a universal graph traversal model.
 */

import type { EntityType } from '@webwaka/types';
import type { TenantId } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Relationship kind — mirrors RelationshipType in @webwaka/types (enums.ts)
// Re-exported here as a const object for use in repository filter expressions.
// ---------------------------------------------------------------------------

export const RelationshipKind = {
  Owns:            'owns',
  Manages:         'manages',
  Claims:          'claims',
  AffiliatedWith:  'affiliated_with',
  BelongsTo:       'belongs_to',
  DelegatesTo:     'delegates_to',
  Offers:          'offers',
  PublishesTo:     'publishes_to',
  ListedIn:        'listed_in',
  LocatedIn:       'located_in',
  OperatesIn:      'operates_in',
  Serves:          'serves',
  Hosts:           'hosts',
  HoldsOffice:     'holds_office',
  JurisdictionOver: 'jurisdiction_over',
} as const;

export type RelationshipKind = (typeof RelationshipKind)[keyof typeof RelationshipKind];

// ---------------------------------------------------------------------------
// Relationship record
// ---------------------------------------------------------------------------

export interface Relationship {
  /** Unique relationship ID */
  readonly id: string;
  /** Relationship kind */
  readonly kind: RelationshipKind;
  /** Subject entity type */
  readonly subjectType: EntityType;
  /** Subject entity ID */
  readonly subjectId: string;
  /** Object entity type */
  readonly objectType: EntityType;
  /** Object entity ID */
  readonly objectId: string;
  /** Tenant scope — required (T3) */
  readonly tenantId: TenantId;
  /** Optional structured metadata (e.g. role, start date, notes) */
  readonly metadata?: Record<string, unknown>;
  /** ISO 8601 creation timestamp */
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Input / filter types
// ---------------------------------------------------------------------------

export interface CreateRelationshipInput {
  kind: RelationshipKind;
  subjectType: EntityType;
  subjectId: string;
  objectType: EntityType;
  objectId: string;
  metadata?: Record<string, unknown>;
}

export interface RelationshipFilter {
  subjectId?: string;
  subjectType?: EntityType;
  objectId?: string;
  objectType?: EntityType;
  kind?: RelationshipKind;
}
