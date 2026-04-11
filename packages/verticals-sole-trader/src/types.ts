/**
 * packages/verticals-sole-trader — Domain types
 * (M8e — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → active
 * Sole Trader / Artisan modeled as an Individual entity.
 * Uses existing individuals + social_profiles — no complex new schema.
 * P9: service prices in integer kobo.
 */

export type SoleTraderFSMState = 'seeded' | 'claimed' | 'active';

export type TradeType =
  | 'tailor' | 'cobbler' | 'welder' | 'carpenter' | 'painter'
  | 'plumber' | 'electrician' | 'mechanic' | 'barber' | 'chef' | 'others';

export interface SoleTraderProfile {
  id: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  tradeType: TradeType;
  skills: string;       // JSON array of skill tags
  lga: string;
  state: string;
  whatsappNumber: string | null;
  minFeeKobo: number | null;   // P9
  maxFeeKobo: number | null;   // P9
  ratingX10: number;           // P9: 47 = 4.7 stars
  status: SoleTraderFSMState;
  createdAt: number;
}

export interface CreateSoleTraderInput {
  id?: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  tradeType: TradeType;
  lga: string;
  state: string;
  skills?: string;
  whatsappNumber?: string;
  minFeeKobo?: number;
  maxFeeKobo?: number;
}

export interface UpdateSoleTraderInput {
  tradeType?: TradeType;
  skills?: string;
  lga?: string;
  state?: string;
  whatsappNumber?: string | null;
  minFeeKobo?: number | null;
  maxFeeKobo?: number | null;
  ratingX10?: number;
  status?: SoleTraderFSMState;
}

export const VALID_SOLE_TRADER_TRANSITIONS: Array<[SoleTraderFSMState, SoleTraderFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed','active'],
];

export function isValidSoleTraderTransition(from: SoleTraderFSMState, to: SoleTraderFSMState): boolean {
  return VALID_SOLE_TRADER_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
