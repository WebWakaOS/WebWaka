/**
 * Youth Organization / Student Union vertical routes — M8d Civic Extended
 *
 * POST   /youth-organization                              — Create profile
 * GET    /youth-organization/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /youth-organization/:id                          — Get profile (T3)
 * PATCH  /youth-organization/:id                          — Update profile
 * POST   /youth-organization/:id/transition               — FSM transition
 * POST   /youth-organization/:id/members                  — Create member (P9)
 * GET    /youth-organization/:id/members                  — List members (T3)
 * POST   /youth-organization/:id/events                   — Create event
 * POST   /youth-organization/:id/scholarships             — Create scholarship (P9)
 * GET    /youth-organization/:id/scholarships             — List scholarships (T3)
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import {
  YouthOrgRepository,
  isValidYouthOrgTransition,
} from '@webwaka/verticals-youth-organization';
import type { YouthOrgFSMState } from '@webwaka/verticals-youth-organization';
import type { Env } from '../../env.js';

export const youthOrganizationRoutes = new Hono<{ Bindings: Env }>();

youthOrganizationRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; org_name?: string; type?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.org_name) return c.json({ error: 'workspace_id, org_name required' }, 400);
  const repo = new YouthOrgRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, orgName: body.org_name, type: body.type as never, state: body.state, lga: body.lga });
  return c.json({ youth_organization: profile }, 201);
});

youthOrganizationRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new YouthOrgRepository(c.env.DB);
  return c.json({ youth_organizations: await repo.findByWorkspace(workspaceId, auth.tenantId) });
});

youthOrganizationRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new YouthOrgRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Youth organization not found' }, 404);
  return c.json({ youth_organization: profile });
});

youthOrganizationRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new YouthOrgRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { orgName: body['org_name'] as string | undefined, type: body['type'] as never, cacRegNumber: body['cac_reg_number'] as string | null | undefined, nyscCoordination: body['nysc_coordination'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Youth organization not found' }, 404);
  return c.json({ youth_organization: updated });
});

youthOrganizationRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new YouthOrgRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Youth organization not found' }, 404);
  if (!isValidYouthOrgTransition(current.status, body.to as YouthOrgFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ youth_organization: await repo.transition(id, auth.tenantId, body.to as YouthOrgFSMState) });
});

youthOrganizationRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_name?: string; member_phone?: string; annual_dues_kobo?: unknown; dues_paid?: boolean; membership_year?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_name || body.annual_dues_kobo === undefined) return c.json({ error: 'member_name, annual_dues_kobo required' }, 400);
  if (!Number.isInteger(body.annual_dues_kobo) || (body.annual_dues_kobo as number) < 0) return c.json({ error: 'annual_dues_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new YouthOrgRepository(c.env.DB);
  const member = await repo.createMember({ profileId: id, tenantId: auth.tenantId, memberName: body.member_name, memberPhone: body.member_phone, annualDuesKobo: body.annual_dues_kobo as number, duesPaid: body.dues_paid, membershipYear: body.membership_year });
  return c.json({ member }, 201);
});

youthOrganizationRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new YouthOrgRepository(c.env.DB);
  return c.json({ members: await repo.findMembersByProfile(id, auth.tenantId) });
});

youthOrganizationRoutes.post('/:id/events', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { event_name?: string; event_date?: number; venue?: string; description?: string; attendance_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.event_name) return c.json({ error: 'event_name required' }, 400);
  const repo = new YouthOrgRepository(c.env.DB);
  const event = await repo.createEvent({ profileId: id, tenantId: auth.tenantId, eventName: body.event_name, eventDate: body.event_date, venue: body.venue, description: body.description, attendanceCount: body.attendance_count });
  return c.json({ event }, 201);
});

youthOrganizationRoutes.post('/:id/scholarships', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { donated_amount_kobo?: unknown; award_amount_kobo?: unknown; donor_name?: string; donor_phone?: string; recipient_name?: string; academic_year?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.donated_amount_kobo === undefined || body.award_amount_kobo === undefined) return c.json({ error: 'donated_amount_kobo, award_amount_kobo required' }, 400);
  if (!Number.isInteger(body.donated_amount_kobo) || (body.donated_amount_kobo as number) < 0) return c.json({ error: 'donated_amount_kobo must be a non-negative integer (P9)' }, 422);
  if (!Number.isInteger(body.award_amount_kobo) || (body.award_amount_kobo as number) < 0) return c.json({ error: 'award_amount_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new YouthOrgRepository(c.env.DB);
  const scholarship = await repo.createScholarship({ profileId: id, tenantId: auth.tenantId, donatedAmountKobo: body.donated_amount_kobo as number, awardAmountKobo: body.award_amount_kobo as number, donorName: body.donor_name, donorPhone: body.donor_phone, recipientName: body.recipient_name, academicYear: body.academic_year });
  return c.json({ scholarship }, 201);
});

youthOrganizationRoutes.get('/:id/scholarships', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new YouthOrgRepository(c.env.DB);
  return c.json({ scholarships: await repo.findScholarshipsByProfile(id, auth.tenantId) });
});
