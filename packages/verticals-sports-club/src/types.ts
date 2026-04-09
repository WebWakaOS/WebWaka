/**
 * @webwaka/verticals-sports-club — Domain types
 * M12 — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → nsf_registered → active → suspended
 * KYC gates:
 *   seeded → claimed:         KYC Tier 1
 *   nsf_registered → active:  KYC Tier 2 (prize money > ₦200k)
 * P9: All monetary amounts in integer kobo; age and jersey as integers
 * P13: player PII never passed to AI layer
 */

export type SportsClubFSMState =
  | 'seeded'
  | 'claimed'
  | 'nsf_registered'
  | 'active'
  | 'suspended';

export type SportType = 'football' | 'basketball' | 'athletics' | 'other';

export type MatchStatus = 'scheduled' | 'played' | 'cancelled';

export type ExpenseType = 'kit' | 'equipment' | 'transport' | 'fees';

export interface SportsClubProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  clubName: string;
  sportType: SportType;
  nsfAffiliation: string | null;
  stateSportsCouncilReg: string | null;
  status: SportsClubFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSportsClubInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clubName: string;
  sportType?: SportType | undefined;
}

export interface UpdateSportsClubInput {
  clubName?: string | undefined;
  sportType?: SportType | undefined;
  nsfAffiliation?: string | null | undefined;
  stateSportsCouncilReg?: string | null | undefined;
  status?: SportsClubFSMState | undefined;
}

export interface SportsClubPlayer {
  id: string;
  profileId: string;
  tenantId: string;
  playerName: string;
  position: string | null;
  ageYears: number | null;
  jerseyNumber: number | null;
  monthlyDuesKobo: number;
  duesStatus: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePlayerInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  playerName: string;
  position?: string | undefined;
  ageYears?: number | undefined;
  jerseyNumber?: number | undefined;
  monthlyDuesKobo: number;
}

export interface SportsClubMatch {
  id: string;
  profileId: string;
  tenantId: string;
  opponent: string;
  venue: string | null;
  matchDate: number | null;
  resultHome: number | null;
  resultAway: number | null;
  status: MatchStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMatchInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  opponent: string;
  venue?: string | undefined;
  matchDate?: number | undefined;
  resultHome?: number | undefined;
  resultAway?: number | undefined;
  status?: MatchStatus | undefined;
}

export interface SportsClubExpense {
  id: string;
  profileId: string;
  tenantId: string;
  expenseType: ExpenseType;
  description: string | null;
  amountKobo: number;
  expenseDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateExpenseInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  expenseType?: ExpenseType | undefined;
  description?: string | undefined;
  amountKobo: number;
  expenseDate?: number | undefined;
}

export const VALID_SPORTS_CLUB_TRANSITIONS: Record<SportsClubFSMState, SportsClubFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['nsf_registered', 'suspended'],
  nsf_registered: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidSportsClubTransition(from: SportsClubFSMState, to: SportsClubFSMState): boolean {
  return VALID_SPORTS_CLUB_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToNsfRegistered(ctx: { nsfAffiliation: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.nsfAffiliation) return { allowed: false, reason: 'NSF affiliation required for nsf_registered transition' };
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required' };
  return { allowed: true };
}

export function guardPrizeMoney(ctx: { amountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.amountKobo > 20_000_000 && ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for prize money distribution above ₦200k' };
  return { allowed: true };
}
