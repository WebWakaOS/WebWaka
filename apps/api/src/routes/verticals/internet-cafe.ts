import { Hono } from 'hono';
import { InternetCafeRepository, isValidInternetCafeTransition } from '@webwaka/verticals-internet-cafe';
import type { InternetCafeFSMState } from '@webwaka/verticals-internet-cafe';
import type { Env } from '../../env.js';
export const internetCafeRoutes = new Hono<{ Bindings: Env }>();
internetCafeRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ internet_cafe: await new InternetCafeRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, nccReg: b['ncc_reg'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, workstationCount: b['workstation_count'] as number | undefined }) }, 201);
});
internetCafeRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ internet_cafe: await new InternetCafeRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
internetCafeRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new InternetCafeRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ internet_cafe: p }); });
internetCafeRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new InternetCafeRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as InternetCafeFSMState; if (!isValidInternetCafeTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ internet_cafe: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { nccReg: b['ncc_reg'] as string | undefined }) });
});
internetCafeRoutes.post('/:id/stations', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ station: await new InternetCafeRepository(c.env.DB).addStation(c.req.param('id'), auth.tenantId, { stationNumber: b['station_number'] as string, stationType: b['station_type'] as string | undefined }) }, 201);
});
internetCafeRoutes.get('/:id/stations', async (c) => { const auth = c.get('auth') as { tenantId: string }; const stations = await new InternetCafeRepository(c.env.DB).listStations(c.req.param('id'), auth.tenantId); return c.json({ stations, count: stations.length }); });
internetCafeRoutes.post('/:id/sessions', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ session: await new InternetCafeRepository(c.env.DB).startSession(c.req.param('id'), auth.tenantId, { stationId: b['station_id'] as string, customerRefId: b['customer_ref_id'] as string, durationMinutes: b['duration_minutes'] as number, perMinuteKobo: b['per_minute_kobo'] as number, sessionTotalKobo: b['session_total_kobo'] as number }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
internetCafeRoutes.get('/:id/sessions', async (c) => { const auth = c.get('auth') as { tenantId: string }; const sessions = await new InternetCafeRepository(c.env.DB).listSessions(c.req.param('id'), auth.tenantId); return c.json({ sessions, count: sessions.length }); });
internetCafeRoutes.post('/:id/service-orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new InternetCafeRepository(c.env.DB).recordServiceOrder(c.req.param('id'), auth.tenantId, { customerRefId: b['customer_ref_id'] as string, serviceType: b['service_type'] as string, quantity: b['quantity'] as number ?? 1, unitPriceKobo: b['unit_price_kobo'] as number, totalKobo: b['total_kobo'] as number }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
