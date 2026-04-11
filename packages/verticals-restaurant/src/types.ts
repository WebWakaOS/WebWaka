/**
 * packages/verticals-restaurant — Domain types (P2 sample / M9 template)
 * (M8e — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → active
 * Restaurant / Eatery modeled as an Organization entity.
 * P9: All prices in integer kobo.
 */

export type RestaurantFSMState = 'seeded' | 'claimed' | 'active';

export type MenuCategory = 'starter' | 'main' | 'dessert' | 'drink' | 'snack' | 'special';

export interface MenuItem {
  id: string;
  workspaceId: string;
  tenantId: string;
  name: string;
  description: string | null;
  priceKobo: number;
  category: MenuCategory;
  available: boolean;
  photoUrl: string | null;
  createdAt: number;
}

export interface CreateMenuItemInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  name: string;
  priceKobo: number;
  category?: MenuCategory;
  description?: string;
  photoUrl?: string;
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string | null;
  priceKobo?: number;
  category?: MenuCategory;
  available?: boolean;
  photoUrl?: string | null;
}
