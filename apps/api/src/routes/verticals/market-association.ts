import { Hono } from 'hono';
import { MarketAssociationRepository, isValidMarketAssociationTransition } from '@webwaka/verticals-market-association';
import type { MarketAssociationFSMState } from '@webwaka/verticals-market-association';
import type { Env } from '../../env.js';
export const marketAssociationRoutes = new Hono<{ Bindings: Env }>();
marketAssociationRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['market_name']) return c.json({ error: 'workspace_id, market_name required' }, 400);
  return c.json({ market_association: await new MarketAssociationRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, marketName: b['market_name'] as string, cacScn: b['cac_scn'] as string | undefined, lgaRef: b['lga_ref'] as string | undefined, state: b['state'] as string | undefined, lga: b['lga'] as string | undefined, totalStalls: b['total_stalls'] as number | undefined }) }, 201);
});
marketAssociationRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ market_association: await new MarketAssociationRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
marketAssociationRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new MarketAssociationRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ market_association: p }); });
marketAssociationRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new MarketAssociationRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as MarketAssociationFSMState; if (!isValidMarketAssociationTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ market_association: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { cacScn: b['cac_scn'] as string | undefined }) });
});
marketAssociationRoutes.post('/:id/traders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ trader: await new MarketAssociationRepository(c.env.DB).addTrader(c.req.param('id'), auth.tenantId, { traderRefId: b['trader_ref_id'] as string, stallNumber: b['stall_number'] as string | undefined, tradeType: b['trade_type'] as string | undefined, monthlyLevyKobo: b['monthly_levy_kobo'] as number | undefined, joinDate: b['join_date'] as number | undefined }) }, 201);
});
marketAssociationRoutes.get('/:id/traders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const traders = await new MarketAssociationRepository(c.env.DB).listTraders(c.req.param('id'), auth.tenantId); return c.json({ traders, count: traders.length }); });
marketAssociationRoutes.post('/:id/levies', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ levy: await new MarketAssociationRepository(c.env.DB).recordLevy(c.req.param('id'), auth.tenantId, { traderId: b['trader_id'] as string, periodMonth: b['period_month'] as number, amountKobo: b['amount_kobo'] as number, levyType: b['levy_type'] as string | undefined, collectedDate: b['collected_date'] as number }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
marketAssociationRoutes.get('/:id/levies', async (c) => { const auth = c.get('auth') as { tenantId: string }; const levies = await new MarketAssociationRepository(c.env.DB).listLevies(c.req.param('id'), auth.tenantId); return c.json({ levies, count: levies.length }); });
marketAssociationRoutes.post('/:id/incidents', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ incident: await new MarketAssociationRepository(c.env.DB).reportIncident(c.req.param('id'), auth.tenantId, { incidentType: b['incident_type'] as string, incidentDate: b['incident_date'] as number, description: b['description'] as string | undefined, reporterRef: b['reporter_ref'] as string | undefined }) }, 201);
});
