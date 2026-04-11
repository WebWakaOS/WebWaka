/**
 * Cleaning Company (Corporate FM) vertical routes — M11 Commerce P3
 *
 * POST   /cleaning-company                         — Create profile
 * GET    /cleaning-company/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /cleaning-company/:id                     — Get profile (T3)
 * PATCH  /cleaning-company/:id                     — Update profile
 * POST   /cleaning-company/:id/transition          — FSM transition
 * POST   /cleaning-company/:id/contracts           — Create FM contract (P9)
 * GET    /cleaning-company/:id/contracts           — List FM contracts (T3)
 * PATCH  /cleaning-company/:id/contracts/:contractId/status — Update contract status
 * POST   /cleaning-company/:id/staff               — Create staff deployment (P13)
 * GET    /cleaning-company/:id/staff               — List staff deployments (T3)
 * POST   /cleaning-company/:id/supplies            — Create supply record (P9)
 * GET    /cleaning-company/:id/supplies            — List supplies (T3)
 * GET    /cleaning-company/:id/ai-advisory         — AI advisory (P13: staff PII stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  CleaningCompanyRepository,
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidCleaningCompanyTransition,
} from '@webwaka/verticals-cleaning-company';
import type { CleaningCompanyFSMState, ContractStatus } from '@webwaka/verticals-cleaning-company';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const cleaningCompanyRoutes = new Hono<{ Bindings: Env }>();

cleaningCompanyRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; cac_rc?: string; bpp_registration?: string; fmenv_cert?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, cacRc: body.cac_rc, bppRegistration: body.bpp_registration, fmenvCert: body.fmenv_cert });
  return c.json({ cleaning_company: profile }, 201);
});

cleaningCompanyRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new CleaningCompanyRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ cleaning_company: profile });
});

cleaningCompanyRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CleaningCompanyRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Cleaning company profile not found' }, 404);
  return c.json({ cleaning_company: profile });
});

cleaningCompanyRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; cac_rc?: string; bpp_registration?: string; fmenv_cert?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new CleaningCompanyRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, cacRc: body.cac_rc, bppRegistration: body.bpp_registration, fmenvCert: body.fmenv_cert });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ cleaning_company: updated });
});

cleaningCompanyRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as CleaningCompanyFSMState;
  if (!isValidCleaningCompanyTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacRc: profile.cacRc ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ cleaning_company: updated });
});

cleaningCompanyRoutes.post('/:id/contracts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_name?: string; client_phone?: string; sites_count?: number; monthly_fee_kobo?: number; contract_start?: number; contract_end?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_name || !body.client_phone || body.monthly_fee_kobo === undefined) return c.json({ error: 'client_name, client_phone, monthly_fee_kobo are required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  try {
    const contract = await repo.createContract({ workspaceId: id, tenantId: auth.tenantId, clientName: body.client_name, clientPhone: body.client_phone, sitesCount: body.sites_count, monthlyFeeKobo: body.monthly_fee_kobo, contractStart: body.contract_start, contractEnd: body.contract_end });
    return c.json({ contract }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

cleaningCompanyRoutes.get('/:id/contracts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CleaningCompanyRepository(c.env.DB);
  const contracts = await repo.listContracts(id, auth.tenantId);
  return c.json({ contracts, count: contracts.length });
});

cleaningCompanyRoutes.patch('/:id/contracts/:contractId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { contractId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  const updated = await repo.updateContractStatus(contractId, auth.tenantId, body.status as ContractStatus);
  if (!updated) return c.json({ error: 'Contract not found' }, 404);
  return c.json({ contract: updated });
});

cleaningCompanyRoutes.post('/:id/staff', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { contract_id?: string; staff_name?: string; site_name?: string; shift_type?: string; monthly_salary_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.contract_id || !body.staff_name || !body.site_name || body.monthly_salary_kobo === undefined) return c.json({ error: 'contract_id, staff_name, site_name, monthly_salary_kobo are required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  try {
    const deployment = await repo.createStaffDeployment({ workspaceId: id, tenantId: auth.tenantId, contractId: body.contract_id, staffName: body.staff_name, siteName: body.site_name, shiftType: body.shift_type, monthlySalaryKobo: body.monthly_salary_kobo });
    return c.json({ staff_deployment: deployment }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

cleaningCompanyRoutes.get('/:id/staff', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CleaningCompanyRepository(c.env.DB);
  const deployments = await repo.listStaffDeployments(id, auth.tenantId);
  return c.json({ staff_deployments: deployments, count: deployments.length });
});

cleaningCompanyRoutes.post('/:id/supplies', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { supply_name?: string; quantity?: number; unit_cost_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.supply_name || body.unit_cost_kobo === undefined) return c.json({ error: 'supply_name, unit_cost_kobo are required' }, 400);
  const repo = new CleaningCompanyRepository(c.env.DB);
  try {
    const supply = await repo.createSupply({ workspaceId: id, tenantId: auth.tenantId, supplyName: body.supply_name, quantity: body.quantity, unitCostKobo: body.unit_cost_kobo });
    return c.json({ supply }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

cleaningCompanyRoutes.get('/:id/supplies', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CleaningCompanyRepository(c.env.DB);
  const supplies = await repo.listSupplies(id, auth.tenantId);
  return c.json({ supplies, count: supplies.length });
});

// AI advisory — P13: staff PII stripped; contract value + status only
cleaningCompanyRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new CleaningCompanyRepository(c.env.DB);
    const contracts = await repo.listContracts(id, auth.tenantId);
    const advisory = contracts.map(con => ({ status: con.status, monthly_fee_kobo: con.monthlyFeeKobo, sites_count: con.sitesCount }));
    return c.json({ capability: 'CONTRACT_PIPELINE', advisory_data: advisory, count: advisory.length });
  },
);
