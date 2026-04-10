import { Hono } from 'hono';
import { ItSupportRepository, isValidItSupportTransition } from '@webwaka/verticals-it-support';
import type { ItSupportFSMState } from '@webwaka/verticals-it-support';
import type { Env } from '../../env.js';
export const itSupportRoutes = new Hono<{ Bindings: Env }>();
itSupportRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ it_support: await new ItSupportRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, nitnCert: b['nitn_cert'] as string | undefined, ndprConformance: b['ndpr_conformance'] as boolean | undefined, serviceScope: b['service_scope'] as string | undefined }) }, 201);
});
itSupportRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ it_support: await new ItSupportRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
itSupportRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new ItSupportRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ it_support: p }); });
itSupportRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ItSupportRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as ItSupportFSMState; if (!isValidItSupportTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ it_support: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacRc: b['cac_rc'] as string | undefined }) });
});
itSupportRoutes.post('/:id/tickets', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ ticket: await new ItSupportRepository(c.env.DB).createTicket(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, issueType: b['issue_type'] as string, priority: b['priority'] as string | undefined, description: b['description'] as string | undefined, slaHours: b['sla_hours'] as number | undefined, labourCostKobo: b['labour_cost_kobo'] as number | undefined }) }, 201);
});
itSupportRoutes.get('/:id/tickets', async (c) => { const auth = c.get('auth') as { tenantId: string }; const tickets = await new ItSupportRepository(c.env.DB).listTickets(c.req.param('id'), auth.tenantId); return c.json({ tickets, count: tickets.length }); });
itSupportRoutes.post('/:id/contracts', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ contract: await new ItSupportRepository(c.env.DB).createServiceContract(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, annualFeeKobo: b['annual_fee_kobo'] as number, startDate: b['start_date'] as number, endDate: b['end_date'] as number, slaDescription: b['sla_description'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
