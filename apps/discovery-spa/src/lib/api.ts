/**
 * Discovery API client — wraps the public-discovery Hono worker.
 * All endpoints are public (no auth required).
 */

const BASE = (import.meta.env.VITE_DISCOVERY_API ?? '').replace(/\/+$/, '');

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) {
    const d = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Place {
  id: string;
  name: string;
  slug: string;
  type: 'state' | 'lga' | 'ward';
  parentId?: string;
}

export interface Listing {
  id: string;
  name: string;
  category: string;
  description?: string;
  placeId?: string;
  placeName?: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  vertical?: string;
  claimed?: boolean;
  verified?: boolean;
}

export interface Profile {
  id: string;
  entityType: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  claimed?: boolean;
  verified?: boolean;
  wakaPageUrl?: string;
  offerings?: Array<{ id: string; name: string; price?: number; unit?: string }>;
  gallery?: string[];
}

export interface GeoChild {
  id: string;
  name: string;
  slug: string;
  type: string;
  businessCount?: number;
}

export interface DiscoverHome {
  trending: Listing[];
  states: Place[];
  categories: string[];
  featuredCount?: number;
}

export interface SearchResult {
  results: Listing[];
  total: number;
  query: string;
  place?: string;
  /** total pages at the requested limit */
  pages?: number;
  page?: number;
}

export interface ClaimRequest {
  entityType: string;
  entityId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessRole: string;
}

// ─── Endpoint helpers ─────────────────────────────────────────────────────────

export const discoveryApi = {
  home:     ()                           => get<DiscoverHome>('/discover'),
  inPlace:  (placeId: string, page = 1)  => get<{ listings: Listing[]; place: Place; total?: number }>(`/discover/in/${placeId}?page=${page}`),
  search:   (q: string, place?: string, page = 1) =>
    get<SearchResult>(`/discover/search?q=${encodeURIComponent(q)}${place ? `&place=${encodeURIComponent(place)}` : ''}&page=${page}`),
  category: (cat: string, page = 1)     => get<{ listings: Listing[]; category: string; total?: number }>(`/discover/category/${encodeURIComponent(cat)}?page=${page}`),
  geo:      (placeId: string)            => get<{ place: Place; children: GeoChild[] }>(`/discover/geo/${placeId}`),
  profile:  (entityType: string, id: string) => get<Profile>(`/discover/${entityType}/${id}`),
  submitClaim: (req: ClaimRequest)       => post<{ success: boolean; claimId: string }>('/discover/claims', req),
};
