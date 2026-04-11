/**
 * ID generation for all 7 root entity types.
 * Uses crypto.randomUUID() (Web Crypto — available in Cloudflare Workers, Node 18+, browsers).
 * Uses branded IDs from @webwaka/types to prevent entity conflation at compile time.
 */

import { asId } from '@webwaka/types';
import type {
  IndividualId,
  OrganizationId,
  PlaceId,
  OfferingId,
  ProfileId,
  WorkspaceId,
  BrandSurfaceId,
} from '@webwaka/types';

function uuid(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function generateIndividualId(): IndividualId {
  return asId<IndividualId>(`ind_${uuid()}`);
}

export function generateOrganizationId(): OrganizationId {
  return asId<OrganizationId>(`org_${uuid()}`);
}

export function generatePlaceId(): PlaceId {
  return asId<PlaceId>(`plc_${uuid()}`);
}

export function generateOfferingId(): OfferingId {
  return asId<OfferingId>(`off_${uuid()}`);
}

export function generateProfileId(): ProfileId {
  return asId<ProfileId>(`prf_${uuid()}`);
}

export function generateWorkspaceId(): WorkspaceId {
  return asId<WorkspaceId>(`wsp_${uuid()}`);
}

export function generateBrandSurfaceId(): BrandSurfaceId {
  return asId<BrandSurfaceId>(`brs_${uuid()}`);
}
