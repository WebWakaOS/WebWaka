/**
 * @webwaka/verticals-book-club — Domain types
 * M12 — Platform Invariants T3, P9
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 only
 * P9: All monetary amounts in integer kobo
 */

export type BookClubFSMState =
  | 'seeded'
  | 'claimed'
  | 'active';

export interface BookClubProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  clubName: string;
  cacOrInformal: string | null;
  nlnAffiliation: string | null;
  state: string | null;
  status: BookClubFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBookClubInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clubName: string;
  cacOrInformal?: string | undefined;
  nlnAffiliation?: string | undefined;
  state?: string | undefined;
}

export interface UpdateBookClubInput {
  clubName?: string | undefined;
  cacOrInformal?: string | null | undefined;
  nlnAffiliation?: string | null | undefined;
  state?: string | null | undefined;
  status?: BookClubFSMState | undefined;
}

export interface BookClubMember {
  id: string;
  profileId: string;
  tenantId: string;
  memberPhone: string | null;
  memberName: string;
  monthlyDuesKobo: number;
  duesStatus: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBookClubMemberInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  memberPhone?: string | undefined;
  memberName: string;
  monthlyDuesKobo: number;
  duesStatus?: string | undefined;
}

export interface BookClubReading {
  id: string;
  profileId: string;
  tenantId: string;
  bookTitle: string;
  author: string | null;
  month: number | null;
  purchaseCostKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateReadingInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  bookTitle: string;
  author?: string | undefined;
  month?: number | undefined;
  purchaseCostKobo: number;
}

export interface BookClubMeeting {
  id: string;
  profileId: string;
  tenantId: string;
  meetingDate: number | null;
  bookDiscussed: string | null;
  attendanceCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMeetingInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  meetingDate?: number | undefined;
  bookDiscussed?: string | undefined;
  attendanceCount?: number | undefined;
}

export const VALID_BOOK_CLUB_TRANSITIONS: Record<BookClubFSMState, BookClubFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidBookClubTransition(from: BookClubFSMState, to: BookClubFSMState): boolean {
  return VALID_BOOK_CLUB_TRANSITIONS[from]?.includes(to) ?? false;
}
