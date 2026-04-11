/**
 * Book Club / Reading Circle vertical routes — M12 Civic Extended
 *
 * POST   /book-club                              — Create profile
 * GET    /book-club/:id                          — Get profile (T3)
 * PATCH  /book-club/:id                          — Update profile
 * POST   /book-club/:id/transition               — FSM transition
 * POST   /book-club/:id/members                  — Create member (P9)
 * GET    /book-club/:id/members                  — List members (T3)
 * POST   /book-club/:id/readings                 — Create reading entry (P9)
 * GET    /book-club/:id/readings                 — List readings (T3)
 * POST   /book-club/:id/meetings                 — Create meeting record
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import {
  BookClubRepository,
  isValidBookClubTransition,
} from '@webwaka/verticals-book-club';
import type { BookClubFSMState } from '@webwaka/verticals-book-club';
import type { Env } from '../../env.js';

export const bookClubRoutes = new Hono<{ Bindings: Env }>();

bookClubRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; club_name?: string; cac_or_informal?: string; nln_affiliation?: string; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.club_name) return c.json({ error: 'workspace_id, club_name required' }, 400);
  const repo = new BookClubRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, clubName: body.club_name, cacOrInformal: body.cac_or_informal, nlnAffiliation: body.nln_affiliation, state: body.state });
  return c.json({ book_club: profile }, 201);
});

bookClubRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BookClubRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Book club not found' }, 404);
  return c.json({ book_club: profile });
});

bookClubRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BookClubRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { clubName: body['club_name'] as string | undefined, cacOrInformal: body['cac_or_informal'] as string | null | undefined, nlnAffiliation: body['nln_affiliation'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Book club not found' }, 404);
  return c.json({ book_club: updated });
});

bookClubRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new BookClubRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Book club not found' }, 404);
  if (!isValidBookClubTransition(current.status, body.to as BookClubFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ book_club: await repo.transition(id, auth.tenantId, body.to as BookClubFSMState) });
});

bookClubRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_name?: string; member_phone?: string; monthly_dues_kobo?: unknown; dues_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_name || body.monthly_dues_kobo === undefined) return c.json({ error: 'member_name, monthly_dues_kobo required' }, 400);
  if (!Number.isInteger(body.monthly_dues_kobo) || (body.monthly_dues_kobo as number) < 0) return c.json({ error: 'monthly_dues_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new BookClubRepository(c.env.DB);
  const member = await repo.createMember({ profileId: id, tenantId: auth.tenantId, memberName: body.member_name, memberPhone: body.member_phone, monthlyDuesKobo: body.monthly_dues_kobo as number, duesStatus: body.dues_status });
  return c.json({ member }, 201);
});

bookClubRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BookClubRepository(c.env.DB);
  return c.json({ members: await repo.findMembersByProfile(id, auth.tenantId) });
});

bookClubRoutes.post('/:id/readings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { book_title?: string; author?: string; month?: number; purchase_cost_kobo?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.book_title || body.purchase_cost_kobo === undefined) return c.json({ error: 'book_title, purchase_cost_kobo required' }, 400);
  if (!Number.isInteger(body.purchase_cost_kobo) || (body.purchase_cost_kobo as number) < 0) return c.json({ error: 'purchase_cost_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new BookClubRepository(c.env.DB);
  const reading = await repo.createReading({ profileId: id, tenantId: auth.tenantId, bookTitle: body.book_title, author: body.author, month: body.month, purchaseCostKobo: body.purchase_cost_kobo as number });
  return c.json({ reading }, 201);
});

bookClubRoutes.get('/:id/readings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BookClubRepository(c.env.DB);
  return c.json({ readings: await repo.findReadingsByProfile(id, auth.tenantId) });
});

bookClubRoutes.post('/:id/meetings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { meeting_date?: number; book_discussed?: string; attendance_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BookClubRepository(c.env.DB);
  const meeting = await repo.createMeeting({ profileId: id, tenantId: auth.tenantId, meetingDate: body.meeting_date, bookDiscussed: body.book_discussed, attendanceCount: body.attendance_count });
  return c.json({ meeting }, 201);
});
