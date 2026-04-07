/**
 * @webwaka/relationships — Typed relationship primitives.
 * (relationship-schema.md, TDR-0013)
 */

export {
  RelationshipKind,
} from './types.js';

export type {
  Relationship,
  CreateRelationshipInput,
  RelationshipFilter,
} from './types.js';

export {
  createRelationship,
  listRelationships,
  deleteRelationship,
} from './repository.js';
