/**
 * @webwaka/entities — CRUD layer for all 7 root entities against D1.
 * (universal-entity-model.md, TDR-0003)
 *
 * Platform Invariant T3: every exported repository function includes tenant_id in queries.
 */

export * from './ids.js';
export * from './pagination.js';

export type { CreateIndividualInput } from './repository/individuals.js';
export {
  createIndividual,
  getIndividualById,
  listIndividualsByTenant,
  updateIndividual,
} from './repository/individuals.js';

export type { CreateOrganizationInput } from './repository/organizations.js';
export {
  createOrganization,
  getOrganizationById,
  listOrganizationsByTenant,
  updateOrganization,
} from './repository/organizations.js';

export type { CreateWorkspaceInput } from './repository/workspaces.js';
export {
  createWorkspace,
  getWorkspaceById,
  addMember,
  removeMember,
} from './repository/workspaces.js';

export type { CreatePlaceInput } from './repository/places.js';
export {
  createPlace,
  getPlaceById,
  listPlacesByParent,
} from './repository/places.js';

export {
  seedProfile,
  advanceClaimState,
  getProfileBySubject,
  InvalidClaimTransitionError,
} from './repository/profiles.js';
