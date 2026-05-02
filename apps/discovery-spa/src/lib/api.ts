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
}

// ─── Endpoint helpers ─────────────────────────────────────────────────────────

export const discoveryApi = {
  home:     ()                           => get<DiscoverHome>('/discover'),
  inPlace:  (placeId: string)            => get<{ listings: Listing[]; place: Place }>(`/discover/in/${placeId}`),
  search:   (q: string, place?: string)  => get<SearchResult>(`/discover/search?q=${encodeURIComponent(q)}${place ? `&place=${encodeURIComponent(place)}` : ''}`),
  category: (cat: string)                => get<{ listings: Listing[]; category: string }>(`/discover/category/${encodeURIComponent(cat)}`),
  geo:      (placeId: string)            => get<{ place: Place; children: GeoChild[] }>(`/discover/geo/${placeId}`),
  profile:  (entityType: string, id: string) => get<Profile>(`/discover/${entityType}/${id}`),
};
