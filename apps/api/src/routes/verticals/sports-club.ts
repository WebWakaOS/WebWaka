/**
 * Sports Club / Amateur League vertical routes — M12 Civic Extended
 *
 * POST   /sports-club                              — Create profile
 * GET    /sports-club/:id                          — Get profile (T3)
 * PATCH  /sports-club/:id                          — Update profile
 * POST   /sports-club/:id/transition               — FSM transition
 * POST   /sports-club/:id/players                  — Create player (integer dues/age/jersey)
 * GET    /sports-club/:id/players                  — List players (T3)
 * POST   /sports-club/:id/matches                  — Create match (integer scores)
 * POST   /sports-club/:id/expenses                 — Create expense (P9)
 *
 * Platform Invariants: T3, P9, P13 (player PII not passed to AI)
 */

import { Hono } from 'hono';
import {
  SportsClubRepository,
  isValidSportsClubTransition,
} from '@webwaka/verticals-sports-club';
import type { SportsClubFSMState, SportType, MatchStatus, ExpenseType } from '@webwaka/verticals-sports-club';
import type { Env } from '../../env.js';

export const sportsClubRoutes = new Hono<{ Bindings: Env }>();

sportsClubRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; club_name?: string; sport_type?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.club_name) return c.json({ error: 'workspace_id, club_name required' }, 400);
  const repo = new SportsClubRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, clubName: body.club_name, sportType: body.sport_type as SportType | undefined });
  return c.json({ sports_club: profile }, 201);
});

sportsClubRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SportsClubRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Sports club not found' }, 404);
  return c.json({ sports_club: profile });
});

sportsClubRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new SportsClubRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { clubName: body['club_name'] as string | undefined, sportType: body['sport_type'] as SportType | undefined, nsfAffiliation: body['nsf_affiliation'] as string | null | undefined, stateSportsCouncilReg: body['state_sports_council_reg'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Sports club not found' }, 404);
  return c.json({ sports_club: updated });
});

sportsClubRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new SportsClubRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Sports club not found' }, 404);
  if (!isValidSportsClubTransition(current.status, body.to as SportsClubFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ sports_club: await repo.transition(id, auth.tenantId, body.to as SportsClubFSMState) });
});

sportsClubRoutes.post('/:id/players', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { player_name?: string; position?: string; age_years?: unknown; jersey_number?: unknown; monthly_dues_kobo?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.player_name || body.monthly_dues_kobo === undefined) return c.json({ error: 'player_name, monthly_dues_kobo required' }, 400);
  if (!Number.isInteger(body.monthly_dues_kobo) || (body.monthly_dues_kobo as number) < 0) return c.json({ error: 'monthly_dues_kobo must be a non-negative integer (P9)' }, 422);
  if (body.age_years !== undefined && !Number.isInteger(body.age_years)) return c.json({ error: 'age_years must be an integer' }, 422);
  if (body.jersey_number !== undefined && !Number.isInteger(body.jersey_number)) return c.json({ error: 'jersey_number must be an integer' }, 422);
  const repo = new SportsClubRepository(c.env.DB);
  const player = await repo.createPlayer({ profileId: id, tenantId: auth.tenantId, playerName: body.player_name, position: body.position, ageYears: body.age_years as number | undefined, jerseyNumber: body.jersey_number as number | undefined, monthlyDuesKobo: body.monthly_dues_kobo as number });
  return c.json({ player }, 201);
});

sportsClubRoutes.get('/:id/players', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new SportsClubRepository(c.env.DB);
  return c.json({ players: await repo.findPlayersByProfile(id, auth.tenantId) });
});

sportsClubRoutes.post('/:id/matches', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { opponent?: string; venue?: string; match_date?: number; result_home?: unknown; result_away?: unknown; status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.opponent) return c.json({ error: 'opponent required' }, 400);
  if (body.result_home !== undefined && !Number.isInteger(body.result_home)) return c.json({ error: 'result_home must be an integer' }, 422);
  if (body.result_away !== undefined && !Number.isInteger(body.result_away)) return c.json({ error: 'result_away must be an integer' }, 422);
  const repo = new SportsClubRepository(c.env.DB);
  const match = await repo.createMatch({ profileId: id, tenantId: auth.tenantId, opponent: body.opponent, venue: body.venue, matchDate: body.match_date, resultHome: body.result_home as number | undefined, resultAway: body.result_away as number | undefined, status: body.status as MatchStatus | undefined });
  return c.json({ match }, 201);
});

sportsClubRoutes.post('/:id/expenses', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { expense_type?: string; description?: string; amount_kobo?: unknown; expense_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.amount_kobo === undefined) return c.json({ error: 'amount_kobo required' }, 400);
  if (!Number.isInteger(body.amount_kobo) || (body.amount_kobo as number) < 0) return c.json({ error: 'amount_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new SportsClubRepository(c.env.DB);
  const expense = await repo.createExpense({ profileId: id, tenantId: auth.tenantId, expenseType: body.expense_type as ExpenseType | undefined, description: body.description, amountKobo: body.amount_kobo as number, expenseDate: body.expense_date });
  return c.json({ expense }, 201);
});
