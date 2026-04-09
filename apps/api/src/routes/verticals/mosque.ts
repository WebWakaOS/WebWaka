/**
 * Mosque / Islamic Centre vertical routes — M8d Civic Extended
 *
 * POST   /mosque                              — Create profile
 * GET    /mosque/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /mosque/:id                          — Get profile (T3)
 * PATCH  /mosque/:id                          — Update profile
 * POST   /mosque/:id/transition               — FSM transition
 * POST   /mosque/:id/donations                — Create donation (P9/P13 anon)
 * GET    /mosque/:id/donations                — List donations (T3)
 * POST   /mosque/:id/programmes               — Create programme
 * GET    /mosque/:id/programmes               — List programmes (T3)
 * POST   /mosque/:id/members                  — Create member
 * GET    /mosque/:id/members                  — List members (T3)
 *
 * Platform Invariants: T3, P9, P13 (donor_phone nulled for anonymous donations)
 */

import { Hono } from 'hono';
import {
  MosqueRepository,
  isValidMosqueTransition,
} from '@webwaka/verticals-mosque';
import type { MosqueFSMState, DonationType, ProgrammeType } from '@webwaka/verticals-mosque';
import type { Env } from '../../env.js';

export const mosqueRoutes = new Hono<{ Bindings: Env }>();

mosqueRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; mosque_name?: string; nscia_affiliation_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.mosque_name) return c.json({ error: 'workspace_id, mosque_name required' }, 400);
  const repo = new MosqueRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, mosqueName: body.mosque_name, nsciaAffiliationNumber: body.nscia_affiliation_number, state: body.state, lga: body.lga });
  return c.json({ mosque: profile }, 201);
});

mosqueRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new MosqueRepository(c.env.DB);
  return c.json({ mosques: await repo.findByWorkspace(workspaceId, auth.tenantId) });
});

mosqueRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new MosqueRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Mosque profile not found' }, 404);
  return c.json({ mosque: profile });
});

mosqueRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MosqueRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { mosqueName: body['mosque_name'] as string | undefined, nsciaAffiliationNumber: body['nscia_affiliation_number'] as string | null | undefined, itRegistrationNumber: body['it_registration_number'] as string | null | undefined, state: body['state'] as string | null | undefined, lga: body['lga'] as string | null | undefined, congregationSize: body['congregation_size'] as number | undefined });
  if (!updated) return c.json({ error: 'Mosque profile not found' }, 404);
  return c.json({ mosque: updated });
});

mosqueRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new MosqueRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Mosque profile not found' }, 404);
  if (!isValidMosqueTransition(current.status, body.to as MosqueFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  const updated = await repo.transition(id, auth.tenantId, body.to as MosqueFSMState);
  return c.json({ mosque: updated });
});

mosqueRoutes.post('/:id/donations', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { amount_kobo?: unknown; donation_type?: string; donor_anonymous?: boolean; donor_phone?: string; donation_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.amount_kobo === undefined) return c.json({ error: 'amount_kobo required' }, 400);
  if (!Number.isInteger(body.amount_kobo) || (body.amount_kobo as number) < 0) return c.json({ error: 'amount_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new MosqueRepository(c.env.DB);
  const donation = await repo.createDonation({ profileId: id, tenantId: auth.tenantId, amountKobo: body.amount_kobo as number, donationType: body.donation_type as DonationType | undefined, donorAnonymous: body.donor_anonymous, donorPhone: body.donor_phone, donationDate: body.donation_date });
  return c.json({ donation }, 201);
});

mosqueRoutes.get('/:id/donations', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new MosqueRepository(c.env.DB);
  return c.json({ donations: await repo.findDonationsByProfile(id, auth.tenantId) });
});

mosqueRoutes.post('/:id/programmes', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { programme_name?: string; type?: string; scheduled_date?: number; attendance_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.programme_name) return c.json({ error: 'programme_name required' }, 400);
  const repo = new MosqueRepository(c.env.DB);
  const programme = await repo.createProgramme({ profileId: id, tenantId: auth.tenantId, programmeName: body.programme_name, type: body.type as ProgrammeType | undefined, scheduledDate: body.scheduled_date, attendanceCount: body.attendance_count });
  return c.json({ programme }, 201);
});

mosqueRoutes.get('/:id/programmes', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new MosqueRepository(c.env.DB);
  return c.json({ programmes: await repo.findProgrammesByProfile(id, auth.tenantId) });
});

mosqueRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_name?: string; member_phone?: string; zakat_eligible?: boolean; joined_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_name) return c.json({ error: 'member_name required' }, 400);
  const repo = new MosqueRepository(c.env.DB);
  const member = await repo.createMember({ profileId: id, tenantId: auth.tenantId, memberName: body.member_name, memberPhone: body.member_phone, zakatEligible: body.zakat_eligible, joinedDate: body.joined_date });
  return c.json({ member }, 201);
});

mosqueRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new MosqueRepository(c.env.DB);
  return c.json({ members: await repo.findMembersByProfile(id, auth.tenantId) });
});
