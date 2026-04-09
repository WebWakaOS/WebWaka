/**
 * packages/verticals-market — Domain types
 * (M8e — Platform Invariants T3)
 *
 * FSM: seeded → claimed → active
 * Market / Trading Hub modeled as a Place entity with stall management.
 */

export type MarketFSMState = 'seeded' | 'claimed' | 'active';
export type GoodsType = 'foodstuff' | 'clothing' | 'electronics' | 'provisions' | 'hardware' | 'others';
export type StallStatus = 'active' | 'vacant' | 'suspended';

export interface MarketStall {
  id: string;
  workspaceId: string;
  tenantId: string;
  stallNumber: string;
  traderName: string;
  goodsType: GoodsType;
  phone: string | null;
  status: StallStatus;
  createdAt: number;
}

export interface CreateStallInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  stallNumber: string;
  traderName: string;
  goodsType: GoodsType;
  phone?: string;
}

export interface UpdateStallInput {
  stallNumber?: string;
  traderName?: string;
  goodsType?: GoodsType;
  phone?: string | null;
  status?: StallStatus;
}
