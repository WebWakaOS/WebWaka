export type WholesaleMarketFSMState = 'seeded' | 'claimed' | 'active';

export interface WholesaleMarketProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: WholesaleMarketFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWholesaleMarketInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateWholesaleMarketInput {
  displayName?: string | undefined;
  status?: WholesaleMarketFSMState | undefined;
}

export const VALID_WHOLESALE_MARKET_TRANSITIONS: Array<[WholesaleMarketFSMState, WholesaleMarketFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidWholesaleMarketTransition(
  from: WholesaleMarketFSMState,
  to: WholesaleMarketFSMState,
): boolean {
  return VALID_WHOLESALE_MARKET_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
