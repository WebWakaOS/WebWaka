/**
 * Civic vertical routes — M8d
 *
 * POST /civic/church                          — Create church profile
 * GET  /civic/church/:id                      — Get church (T3)
 * PATCH /civic/church/:id                     — Update church
 * POST /civic/church/:id/transition           — FSM transition
 * POST /civic/church/:id/tithe               — Record tithe/offering
 * GET  /civic/church/:id/tithe               — List tithe records
 *
 * POST /civic/ngo                             — Create NGO
 * GET  /civic/ngo/:id                         — Get NGO
 * POST /civic/ngo/:id/transition              — FSM transition
 * POST /civic/ngo/:id/funding                 — Record funding
 *
 * POST /civic/cooperative/members             — Create member
 * POST /civic/cooperative/contributions       — Create contribution
 * POST /civic/cooperative/loans               — Create loan
 * POST /civic/cooperative/loans/:id/approve   — Approve loan
 *
 * POST /civic/mosque                          — Create mosque (scaffold)
 * POST /civic/youth-org                       — Create youth org (scaffold)
 * POST /civic/womens-assoc                    — Create women's assoc (scaffold)
 * POST /civic/ministry                        — Create ministry (scaffold)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import { ChurchRepository, TitheRepository } from '@webwaka/verticals-church';
import { NgoRepository } from '@webwaka/verticals-ngo';
import { CooperativeRepository } from '@webwaka/verticals-cooperative';
import { MosqueRepository } from '@webwaka/verticals-mosque';
import { YouthOrgRepository } from '@webwaka/verticals-youth-organization';
import { WomensAssocRepository } from '@webwaka/verticals-womens-association';
import { MinistryRepository } from '@webwaka/verticals-ministry-mission';
import type { ChurchFSMState, Denomination, PaymentType } from '@webwaka/verticals-church';
import type { NgoFSMState, NgoSector } from '@webwaka/verticals-ngo';
import type { Env } from '../env.js';

export const civicRoutes = new Hono<{ Bindings: Env }>();

// ── Church ──────────────────────────────────────────────────────────────────

civicRoutes.post('/church', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.denomination) {
    return c.json({ error: 'organization_id, workspace_id, denomination required' }, 400);
  }
  const repo = new ChurchRepository(c.env.DB);
  const church = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    denomination: body.denomination as Denomination,
    ...(body.founding_year !== undefined ? { foundingYear: Number(body.founding_year) } : {}),
    ...(body.senior_pastor !== undefined ? { seniorPastor: body.senior_pastor as string } : {}),
  });
  return c.json({ church }, 201);
});

civicRoutes.get('/church/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new ChurchRepository(c.env.DB);
  const church = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!church) return c.json({ error: 'Not found' }, 404);
  return c.json({ church });
});

civicRoutes.post('/church/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new ChurchRepository(c.env.DB);
  const church = await repo.transition(c.req.param('id'), auth.tenantId, body.status as ChurchFSMState);
  if (!church) return c.json({ error: 'Not found' }, 404);
  return c.json({ church });
});

civicRoutes.post('/church/:id/tithe', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.member_id || !body.amount_kobo || !body.payment_type) {
    return c.json({ error: 'member_id, amount_kobo, payment_type required' }, 400);
  }
  const repo = new TitheRepository(c.env.DB);
  try {
    const record = await repo.create({
      workspaceId: c.req.param('id'),
      tenantId: auth.tenantId,
      memberId: body.member_id as string,
      amountKobo: Number(body.amount_kobo),
      paymentType: body.payment_type as PaymentType,
      ...(body.paystack_ref !== undefined ? { paystackRef: body.paystack_ref as string } : {}),
    });
    return c.json({ tithe: record }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('P9')) return c.json({ error: msg }, 422);
    throw e;
  }
});

civicRoutes.get('/church/:id/tithe', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new TitheRepository(c.env.DB);
  const records = await repo.listByWorkspace(c.req.param('id'), auth.tenantId);
  return c.json({ tithe_records: records });
});

// ── NGO ─────────────────────────────────────────────────────────────────────

civicRoutes.post('/ngo', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.sector) {
    return c.json({ error: 'organization_id, workspace_id, sector required' }, 400);
  }
  const repo = new NgoRepository(c.env.DB);
  const ngo = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    sector: body.sector as NgoSector,
    ...(body.cac_reg_number !== undefined ? { cacRegNumber: body.cac_reg_number as string } : {}),
    ...(body.country_partner !== undefined ? { countryPartner: body.country_partner as string } : {}),
  });
  return c.json({ ngo }, 201);
});

civicRoutes.get('/ngo/:id', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new NgoRepository(c.env.DB);
  const ngo = await repo.findById(c.req.param('id'), auth.tenantId);
  if (!ngo) return c.json({ error: 'Not found' }, 404);
  return c.json({ ngo });
});

civicRoutes.post('/ngo/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status required' }, 400);
  const repo = new NgoRepository(c.env.DB);
  const ngo = await repo.transition(c.req.param('id'), auth.tenantId, body.status as NgoFSMState);
  if (!ngo) return c.json({ error: 'Not found' }, 404);
  return c.json({ ngo });
});

civicRoutes.post('/ngo/:id/funding', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.donor_name || !body.amount_kobo) return c.json({ error: 'donor_name, amount_kobo required' }, 400);
  const repo = new NgoRepository(c.env.DB);
  try {
    const record = await repo.createFunding({
      workspaceId: c.req.param('id'),
      tenantId: auth.tenantId,
      donorName: body.donor_name as string,
      amountKobo: Number(body.amount_kobo),
      ...(body.purpose !== undefined ? { purpose: body.purpose as string } : {}),
      ...(body.paystack_ref !== undefined ? { paystackRef: body.paystack_ref as string } : {}),
    });
    return c.json({ funding: record }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('P9')) return c.json({ error: msg }, 422);
    throw e;
  }
});

// ── Cooperative ──────────────────────────────────────────────────────────────

civicRoutes.post('/cooperative/members', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.user_id || !body.member_number) {
    return c.json({ error: 'workspace_id, user_id, member_number required' }, 400);
  }
  const repo = new CooperativeRepository(c.env.DB);
  const member = await repo.createMember({
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    userId: body.user_id as string,
    memberNumber: body.member_number as string,
    ...(body.shares_count !== undefined ? { sharesCount: Number(body.shares_count) } : {}),
  });
  return c.json({ member }, 201);
});

civicRoutes.post('/cooperative/contributions', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.member_id || !body.amount_kobo || !body.cycle_month) {
    return c.json({ error: 'workspace_id, member_id, amount_kobo, cycle_month required' }, 400);
  }
  const repo = new CooperativeRepository(c.env.DB);
  try {
    const contribution = await repo.createContribution({
      workspaceId: body.workspace_id as string,
      tenantId: auth.tenantId,
      memberId: body.member_id as string,
      amountKobo: Number(body.amount_kobo),
      cycleMonth: body.cycle_month as string,
    });
    return c.json({ contribution }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('P9') || msg.includes('positive')) return c.json({ error: msg }, 422);
    throw e;
  }
});

civicRoutes.post('/cooperative/loans', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.member_id || !body.amount_kobo || !body.interest_rate || !body.duration_months) {
    return c.json({ error: 'workspace_id, member_id, amount_kobo, interest_rate, duration_months required' }, 400);
  }
  const repo = new CooperativeRepository(c.env.DB);
  try {
    const loan = await repo.createLoan({
      workspaceId: body.workspace_id as string,
      tenantId: auth.tenantId,
      memberId: body.member_id as string,
      amountKobo: Number(body.amount_kobo),
      interestRate: Number(body.interest_rate),
      durationMonths: Number(body.duration_months),
      ...(body.guarantor_id !== undefined ? { guarantorId: body.guarantor_id as string } : {}),
    });
    return c.json({ loan }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('P9') || msg.includes('positive') || msg.includes('negative')) return c.json({ error: msg }, 422);
    throw e;
  }
});

civicRoutes.post('/cooperative/loans/:id/approve', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const repo = new CooperativeRepository(c.env.DB);
  const loan = await repo.approveLoan(c.req.param('id'), auth.tenantId);
  if (!loan) return c.json({ error: 'Not found' }, 404);
  return c.json({ loan });
});

// ── Scaffolds ────────────────────────────────────────────────────────────────

civicRoutes.post('/mosque', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.mosque_name) {
    return c.json({ error: 'organization_id, workspace_id, mosque_name required' }, 400);
  }
  const repo = new MosqueRepository(c.env.DB);
  const mosque = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    mosqueName: body.mosque_name as string,
  });
  return c.json({ mosque }, 201);
});

civicRoutes.post('/youth-org', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.org_name) {
    return c.json({ error: 'organization_id, workspace_id, org_name required' }, 400);
  }
  const repo = new YouthOrgRepository(c.env.DB);
  const org = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    orgName: body.org_name as string,
  });
  return c.json({ youth_org: org }, 201);
});

civicRoutes.post('/womens-assoc', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.assoc_name || !body.lga || !body.state) {
    return c.json({ error: 'organization_id, workspace_id, assoc_name, lga, state required' }, 400);
  }
  const repo = new WomensAssocRepository(c.env.DB);
  const assoc = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    assocName: body.assoc_name as string,
    lga: body.lga as string,
    state: body.state as string,
  });
  return c.json({ womens_assoc: assoc }, 201);
});

civicRoutes.post('/ministry', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.organization_id || !body.workspace_id || !body.ministry_name) {
    return c.json({ error: 'organization_id, workspace_id, ministry_name required' }, 400);
  }
  const repo = new MinistryRepository(c.env.DB);
  const ministry = await repo.create({
    organizationId: body.organization_id as string,
    workspaceId: body.workspace_id as string,
    tenantId: auth.tenantId,
    ministryName: body.ministry_name as string,
    ...(body.founding_year !== undefined ? { foundingYear: Number(body.founding_year) } : {}),
  });
  return c.json({ ministry }, 201);
});
