/**
 * Professional Association (NBA/NMA/ICAN) vertical routes — M12 Civic Extended
 *
 * POST   /professional-association                              — Create profile
 * GET    /professional-association/:id                          — Get profile (T3)
 * PATCH  /professional-association/:id                          — Update profile
 * POST   /professional-association/:id/transition               — FSM transition
 * POST   /professional-association/:id/members                  — Create member (P9)
 * GET    /professional-association/:id/members                  — List members (T3)
 * PATCH  /professional-association/:id/members/:mid             — Update member (CPD, status)
 * POST   /professional-association/:id/cpd                      — Create CPD record
 * GET    /professional-association/:id/members/:mid/cpd         — List CPD (T3)
 *
 * Platform Invariants: T3, P9; P13 — disciplinary case details NEVER passed to AI
 */

import { Hono } from 'hono';
import {
  ProfessionalAssocRepository,
  isValidProfessionalAssocTransition,
} from '@webwaka/verticals-professional-association';
import type { ProfessionalAssocFSMState, AssocType } from '@webwaka/verticals-professional-association';
import type { Env } from '../../env.js';

export const professionalAssociationRoutes = new Hono<{ Bindings: Env }>();

professionalAssociationRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; assoc_name?: string; assoc_type?: string; regulatory_body?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.assoc_name) return c.json({ error: 'workspace_id, assoc_name required' }, 400);
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, assocName: body.assoc_name, assocType: body.assoc_type as AssocType | undefined, regulatoryBody: body.regulatory_body });
  return c.json({ professional_association: profile }, 201);
});

professionalAssociationRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Professional association not found' }, 404);
  return c.json({ professional_association: profile });
});

professionalAssociationRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { assocName: body['assoc_name'] as string | undefined, assocType: body['assoc_type'] as AssocType | undefined, regulatoryBody: body['regulatory_body'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Professional association not found' }, 404);
  return c.json({ professional_association: updated });
});

professionalAssociationRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Professional association not found' }, 404);
  if (!isValidProfessionalAssocTransition(current.status, body.to as ProfessionalAssocFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ professional_association: await repo.transition(id, auth.tenantId, body.to as ProfessionalAssocFSMState) });
});

professionalAssociationRoutes.post('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_name?: string; member_number?: string; specialisation?: string; annual_dues_kobo?: unknown; cert_valid_until?: number; cpd_credits_required?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_name || body.annual_dues_kobo === undefined) return c.json({ error: 'member_name, annual_dues_kobo required' }, 400);
  if (!Number.isInteger(body.annual_dues_kobo) || (body.annual_dues_kobo as number) < 0) return c.json({ error: 'annual_dues_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const member = await repo.createMember({ profileId: id, tenantId: auth.tenantId, memberName: body.member_name, memberNumber: body.member_number, specialisation: body.specialisation, annualDuesKobo: body.annual_dues_kobo as number, certValidUntil: body.cert_valid_until, cpdCreditsRequired: body.cpd_credits_required });
  return c.json({ member }, 201);
});

professionalAssociationRoutes.get('/:id/members', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ProfessionalAssocRepository(c.env.DB);
  return c.json({ members: await repo.findMembersByProfile(id, auth.tenantId) });
});

professionalAssociationRoutes.patch('/:id/members/:mid', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { mid } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const updated = await repo.updateMember(mid, auth.tenantId, { annualDuesKobo: body['annual_dues_kobo'] as number | undefined, certValidUntil: body['cert_valid_until'] as number | null | undefined, cpdCreditsRequired: body['cpd_credits_required'] as number | undefined, cpdCreditsEarned: body['cpd_credits_earned'] as number | undefined, status: body['status'] as never });
  if (!updated) return c.json({ error: 'Member not found' }, 404);
  return c.json({ member: updated });
});

professionalAssociationRoutes.post('/:id/cpd', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { member_id?: string; training_name?: string; provider?: string; credits_earned?: unknown; completion_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_id || !body.training_name || body.credits_earned === undefined) return c.json({ error: 'member_id, training_name, credits_earned required' }, 400);
  if (!Number.isInteger(body.credits_earned) || (body.credits_earned as number) < 0) return c.json({ error: 'credits_earned must be a non-negative integer' }, 422);
  const repo = new ProfessionalAssocRepository(c.env.DB);
  const cpd = await repo.createCpd({ memberId: body.member_id, profileId: id, tenantId: auth.tenantId, trainingName: body.training_name, provider: body.provider, creditsEarned: body.credits_earned as number, completionDate: body.completion_date });
  return c.json({ cpd }, 201);
});

professionalAssociationRoutes.get('/:id/members/:mid/cpd', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { mid } = c.req.param();
  const repo = new ProfessionalAssocRepository(c.env.DB);
  return c.json({ cpd: await repo.findCpdByMember(mid, auth.tenantId) });
});
