/**
 * Constituency Development Office vertical routes — M12 Civic Extended
 *
 * POST   /constituency-office                              — Create profile
 * GET    /constituency-office/:id                          — Get profile (T3)
 * PATCH  /constituency-office/:id                          — Update profile
 * POST   /constituency-office/:id/transition               — FSM transition
 * POST   /constituency-office/:id/projects                 — Create project (P9)
 * GET    /constituency-office/:id/projects                 — List projects (T3)
 * POST   /constituency-office/:id/complaints               — Create complaint
 * POST   /constituency-office/:id/outreach                 — Create outreach event
 *
 * Platform Invariants: T3, P9, P13 (complainant PII excluded from AI)
 * AI: L3 HITL mandatory
 */

import { Hono } from 'hono';
import {
  ConstituencyOfficeRepository,
  isValidConstituencyTransition,
} from '@webwaka/verticals-constituency-office';
import type { ConstituencyOfficeFSMState, OfficeType, ProjectCategory } from '@webwaka/verticals-constituency-office';
import type { Env } from '../../env.js';

export const constituencyOfficeRoutes = new Hono<{ Bindings: Env }>();

constituencyOfficeRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; legislator_name?: string; office_type?: string; constituency_name?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.legislator_name) return c.json({ error: 'workspace_id, legislator_name required' }, 400);
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, legislatorName: body.legislator_name, officeType: body.office_type as OfficeType | undefined, constituencyName: body.constituency_name });
  return c.json({ constituency_office: profile }, 201);
});

constituencyOfficeRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Constituency office not found' }, 404);
  return c.json({ constituency_office: profile });
});

constituencyOfficeRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { legislatorName: body['legislator_name'] as string | undefined, officeType: body['office_type'] as OfficeType | undefined, constituencyName: body['constituency_name'] as string | null | undefined, inecSeatNumber: body['inec_seat_number'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Constituency office not found' }, 404);
  return c.json({ constituency_office: updated });
});

constituencyOfficeRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Constituency office not found' }, 404);
  if (!isValidConstituencyTransition(current.status, body.to as ConstituencyOfficeFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ constituency_office: await repo.transition(id, auth.tenantId, body.to as ConstituencyOfficeFSMState) });
});

constituencyOfficeRoutes.post('/:id/projects', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { project_name?: string; category?: string; lga?: string; allocated_kobo?: unknown; disbursed_kobo?: unknown; contractor?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.project_name || body.allocated_kobo === undefined) return c.json({ error: 'project_name, allocated_kobo required' }, 400);
  if (!Number.isInteger(body.allocated_kobo) || (body.allocated_kobo as number) < 0) return c.json({ error: 'allocated_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const project = await repo.createProject({ profileId: id, tenantId: auth.tenantId, projectName: body.project_name, category: body.category as ProjectCategory | undefined, lga: body.lga, allocatedKobo: body.allocated_kobo as number, disbursedKobo: body.disbursed_kobo as number | undefined, contractor: body.contractor });
  return c.json({ project }, 201);
});

constituencyOfficeRoutes.get('/:id/projects', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  return c.json({ projects: await repo.findProjectsByProfile(id, auth.tenantId) });
});

constituencyOfficeRoutes.post('/:id/complaints', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { complaint_ref?: string; subject?: string; lga?: string; ward?: string; description?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.complaint_ref || !body.subject) return c.json({ error: 'complaint_ref, subject required' }, 400);
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const complaint = await repo.createComplaint({ profileId: id, tenantId: auth.tenantId, complaintRef: body.complaint_ref, subject: body.subject, lga: body.lga, ward: body.ward, description: body.description });
  return c.json({ complaint }, 201);
});

constituencyOfficeRoutes.post('/:id/outreach', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { event_date?: number; lga?: string; event_type?: string; attendees_count?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.attendees_count !== undefined && !Number.isInteger(body.attendees_count)) return c.json({ error: 'attendees_count must be an integer' }, 422);
  const repo = new ConstituencyOfficeRepository(c.env.DB);
  const outreach = await repo.createOutreach({ profileId: id, tenantId: auth.tenantId, eventDate: body.event_date, lga: body.lga, eventType: body.event_type, attendeesCount: body.attendees_count as number | undefined });
  return c.json({ outreach }, 201);
});
