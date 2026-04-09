/**
 * Women's Association vertical routes — M8d Civic Extended
 *
 * POST   /womens-association                              — Create profile
 * GET    /womens-association/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /womens-association/:id                          — Get profile (T3)
 * PATCH  /womens-association/:id                          — Update profile
 * POST   /womens-association/:id/transition               — FSM transition
 * POST   /womens-association/:id/members                  — Create member (P9)
 * GET    /womens-association/:id/members                  — List members (T3)
 * POST   /womens-association/:id/welfare                  — Create welfare disbursement (P9)
 * GET    /womens-association/:id/welfare                  — List welfare (T3)
 * POST   /womens-association/:id/meetings                 — Create meeting record
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import {
  WomensAssocRepository,
  isValidWomensAssocTransition,
} from '@webwaka/verticals-womens-association';
import type { WomensAssocFSMState, WelfareType } from '@webwaka/verticals-womens-association';
import type { Env } from '../../env.js';

export const womensAssociationRoutes = new Hono<{ Bindings: Env }>();

womensAssociationRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; assoc_name?: string; type?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.assoc_name) return c.json({ error: 'workspace_id, assoc_name required' }, 400);
  const repo = new WomensAssocRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, assocName: body.assoc_name, type: body.type as never, state: body.state, lga: body.lga });
  return c.json({ womens_association: profile }, 201);
});

womensAssociationRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new WomensAssocRepository(c.env.DB);
  return c.json({ womens_associations: await repo.findByWorkspace(workspaceId, auth.tenantId) });
});

womensAssociationRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WomensAssocRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: "Women's association not found" }, 404);
  return c.json({ womens_association: profile });
});

womensAssociationRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new WomensAssocRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { assocName: body['assoc_name'] as string | undefined, type: body['type'] as never, cacReg: body['cac_reg'] as string | null | undefined, nwecAffiliation: body['nwec_affiliation'] as string | null | undefined });
  if (!updated) return c.json({ error: "Women's association not found" }, 404);
  return c.json({ womens_association: updated });
});

womensAssociationRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new WomensAssocRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: "Women's association not found" }, 404);
  if (!isValidWomensAssocTransition(current.status, body.to as WomensAssocFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ womens_association: await repo.transition(id, auth.tenantId, body.to as WomensAssocFSMState) });
});

womensAssociationRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_name?: string; member_phone?: string; monthly_contribution_kobo?: unknown; contribution_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_name || body.monthly_contribution_kobo === undefined) return c.json({ error: 'member_name, monthly_contribution_kobo required' }, 400);
  if (!Number.isInteger(body.monthly_contribution_kobo) || (body.monthly_contribution_kobo as number) < 0) return c.json({ error: 'monthly_contribution_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new WomensAssocRepository(c.env.DB);
  const member = await repo.createMember({ profileId: id, tenantId: auth.tenantId, memberName: body.member_name, memberPhone: body.member_phone, monthlyContributionKobo: body.monthly_contribution_kobo as number, contributionStatus: body.contribution_status });
  return c.json({ member }, 201);
});

womensAssociationRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WomensAssocRepository(c.env.DB);
  return c.json({ members: await repo.findMembersByProfile(id, auth.tenantId) });
});

womensAssociationRoutes.post('/:id/welfare', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_id?: string; welfare_type?: string; amount_kobo?: unknown; repayment_schedule?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_id || body.amount_kobo === undefined) return c.json({ error: 'member_id, amount_kobo required' }, 400);
  if (!Number.isInteger(body.amount_kobo) || (body.amount_kobo as number) <= 0) return c.json({ error: 'amount_kobo must be a positive integer (P9)' }, 422);
  const repo = new WomensAssocRepository(c.env.DB);
  const welfare = await repo.createWelfare({ profileId: id, memberId: body.member_id, tenantId: auth.tenantId, welfareType: body.welfare_type as WelfareType | undefined, amountKobo: body.amount_kobo as number, repaymentSchedule: body.repayment_schedule });
  return c.json({ welfare }, 201);
});

womensAssociationRoutes.get('/:id/welfare', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WomensAssocRepository(c.env.DB);
  return c.json({ welfare: await repo.findWelfareByProfile(id, auth.tenantId) });
});

womensAssociationRoutes.post('/:id/meetings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { meeting_date?: number; agenda?: string; minutes_text?: string; attendance_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new WomensAssocRepository(c.env.DB);
  const meeting = await repo.createMeeting({ profileId: id, tenantId: auth.tenantId, meetingDate: body.meeting_date, agenda: body.agenda, minutesText: body.minutes_text, attendanceCount: body.attendance_count });
  return c.json({ meeting }, 201);
});
