/**
 * Campaign Office vertical routes — M8b Civic Extended
 *
 * POST   /campaign-office                              — Create profile
 * GET    /campaign-office/:id                          — Get profile (T3)
 * PATCH  /campaign-office/:id                          — Update profile
 * POST   /campaign-office/:id/transition               — FSM transition
 * POST   /campaign-office/:id/budget                   — Create budget line (P9)
 * GET    /campaign-office/:id/budget                   — List budget (T3)
 * POST   /campaign-office/:id/donors                   — Create donor record (P9/P13)
 * GET    /campaign-office/:id/donors                   — List donors (T3)
 * POST   /campaign-office/:id/volunteers               — Create volunteer
 * POST   /campaign-office/:id/events                   — Create campaign event
 *
 * Platform Invariants: T3, P9, P13 (donor_name/phone not passed to AI)
 * AI: L3 HITL mandatory — all AI calls must include hitl=true flag
 */

import { Hono } from 'hono';
import {
  CampaignOfficeRepository,
  isValidCampaignTransition,
  guardInecSpendingCap,
} from '@webwaka/verticals-campaign-office';
import type { CampaignOfficeFSMState, BudgetCategory, CampaignEventType } from '@webwaka/verticals-campaign-office';
import type { Env } from '../../env.js';

export const campaignOfficeRoutes = new Hono<{ Bindings: Env }>();

campaignOfficeRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; candidate_name?: string; office_sought?: string; party?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.candidate_name || !body.office_sought) return c.json({ error: 'workspace_id, candidate_name, office_sought required' }, 400);
  const repo = new CampaignOfficeRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, candidateName: body.candidate_name, officeSought: body.office_sought as never, party: body.party });
  return c.json({ campaign_office: profile }, 201);
});

campaignOfficeRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CampaignOfficeRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Campaign office not found' }, 404);
  return c.json({ campaign_office: profile });
});

campaignOfficeRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new CampaignOfficeRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { candidateName: body['candidate_name'] as string | undefined, party: body['party'] as string | null | undefined, inecFilingRef: body['inec_filing_ref'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Campaign office not found' }, 404);
  return c.json({ campaign_office: updated });
});

campaignOfficeRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new CampaignOfficeRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Campaign office not found' }, 404);
  if (!isValidCampaignTransition(current.status, body.to as CampaignOfficeFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  if (body.to === 'active') {
    const budgets = await repo.findBudgetByProfile(id, auth.tenantId);
    const totalBudget = budgets.reduce((s, b) => s + b.budgetKobo, 0);
    const capResult = guardInecSpendingCap({ officeSought: current.officeSought, totalBudgetKobo: totalBudget });
    if (!capResult.allowed) return c.json({ error: capResult.reason }, 422);
  }
  return c.json({ campaign_office: await repo.transition(id, auth.tenantId, body.to as CampaignOfficeFSMState) });
});

campaignOfficeRoutes.post('/:id/budget', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { category?: string; budget_kobo?: unknown; spent_kobo?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.category || body.budget_kobo === undefined) return c.json({ error: 'category, budget_kobo required' }, 400);
  if (!Number.isInteger(body.budget_kobo) || (body.budget_kobo as number) < 0) return c.json({ error: 'budget_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new CampaignOfficeRepository(c.env.DB);
  const budget = await repo.createBudget({ profileId: id, tenantId: auth.tenantId, category: body.category as BudgetCategory, budgetKobo: body.budget_kobo as number, spentKobo: body.spent_kobo as number | undefined });
  return c.json({ budget }, 201);
});

campaignOfficeRoutes.get('/:id/budget', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CampaignOfficeRepository(c.env.DB);
  return c.json({ budget: await repo.findBudgetByProfile(id, auth.tenantId) });
});

campaignOfficeRoutes.post('/:id/donors', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { donor_name?: string; donor_phone?: string; amount_kobo?: unknown; donation_date?: number; inec_disclosure_required?: boolean };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.donor_name || body.amount_kobo === undefined) return c.json({ error: 'donor_name, amount_kobo required' }, 400);
  if (!Number.isInteger(body.amount_kobo) || (body.amount_kobo as number) <= 0) return c.json({ error: 'amount_kobo must be a positive integer (P9)' }, 422);
  const repo = new CampaignOfficeRepository(c.env.DB);
  const donor = await repo.createDonor({ profileId: id, tenantId: auth.tenantId, donorName: body.donor_name, donorPhone: body.donor_phone, amountKobo: body.amount_kobo as number, donationDate: body.donation_date, inecDisclosureRequired: body.inec_disclosure_required });
  return c.json({ donor }, 201);
});

campaignOfficeRoutes.get('/:id/donors', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CampaignOfficeRepository(c.env.DB);
  return c.json({ donors: await repo.findDonorsByProfile(id, auth.tenantId) });
});

campaignOfficeRoutes.post('/:id/volunteers', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { volunteer_name?: string; volunteer_phone?: string; lga?: string; ward?: string; role?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.volunteer_name) return c.json({ error: 'volunteer_name required' }, 400);
  const repo = new CampaignOfficeRepository(c.env.DB);
  const volunteer = await repo.createVolunteer({ profileId: id, tenantId: auth.tenantId, volunteerName: body.volunteer_name, volunteerPhone: body.volunteer_phone, lga: body.lga, ward: body.ward, role: body.role });
  return c.json({ volunteer }, 201);
});

campaignOfficeRoutes.post('/:id/events', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { event_type?: string; location?: string; lga?: string; event_date?: number; estimated_attendance?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new CampaignOfficeRepository(c.env.DB);
  const event = await repo.createEvent({ profileId: id, tenantId: auth.tenantId, eventType: body.event_type as CampaignEventType | undefined, location: body.location, lga: body.lga, eventDate: body.event_date, estimatedAttendance: body.estimated_attendance });
  return c.json({ event }, 201);
});
