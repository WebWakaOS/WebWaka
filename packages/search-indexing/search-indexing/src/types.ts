/**
 * @webwaka/search-indexing — Search adapter type contracts.
 * (Milestone 4 scaffold only — runtime implementation is Milestone 5+)
 *
 * The D1-backed implementation is embedded in apps/api/src/lib/search-index.ts.
 * This package provides the adapter interface for future pluggable search backends.
 */

import type { EntityType, TenantId } from '@webwaka/types';

export interface SearchEntry {
  id: string;
  entityType: EntityType;
  entityId: string;
  tenantId: TenantId;
  displayName: string;
  keywords: string;
  placeId: string | null;
  ancestryPath: string[];
  visibility: 'public' | 'private' | 'unlisted';
  createdAt: number;
  updatedAt: number;
}

export interface SearchQuery {
  q: string;
  type?: EntityType;
  placeId?: string;
  limit?: number;
  cursor?: string;
}

export interface SearchResultItem {
  entityType: EntityType;
  entityId: string;
  displayName: string;
  placeId: string | null;
  placeName: string | null;
  score?: number;
}

export interface SearchResult {
  items: SearchResultItem[];
  nextCursor: string | null;
  total: number;
}

export interface SearchAdapter {
  index(entry: Omit<SearchEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  remove(entityId: string): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult>;
}
