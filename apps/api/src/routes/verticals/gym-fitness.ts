import { Hono } from 'hono';
import { GymFitnessRepository, isValidGymFitnessTransition } from '@webwaka/verticals-gym-fitness';
import type { GymFitnessFSMState } from '@webwaka/verticals-gym-fitness';
import type { Env } from '../../env.js';
export const gymFitnessRoutes = new Hono<{ Bindings: Env }>();
gymFitnessRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ gym_fitness: await new GymFitnessRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, cacRc: b['cac_rc'] as string | undefined, nasfcCert: b['nasfc_cert'] as string | undefined, capacity: b['capacity'] as number | undefined }) }, 201);
});
gymFitnessRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ gym_fitness: await new GymFitnessRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
gymFitnessRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new GymFitnessRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ gym_fitness: p }); });
gymFitnessRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new GymFitnessRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as GymFitnessFSMState; if (!isValidGymFitnessTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ gym_fitness: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to) });
});
gymFitnessRoutes.post('/:id/memberships', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ membership: await new GymFitnessRepository(c.env.DB).createMembership(c.req.param('id'), auth.tenantId, { memberRefId: b['member_ref_id'] as string, plan: b['plan'] as string, monthlyFeeKobo: b['monthly_fee_kobo'] as number, startDate: b['start_date'] as number, endDate: b['end_date'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
gymFitnessRoutes.get('/:id/memberships', async (c) => { const auth = c.get('auth') as { tenantId: string }; const memberships = await new GymFitnessRepository(c.env.DB).listMemberships(c.req.param('id'), auth.tenantId); return c.json({ memberships, count: memberships.length }); });
gymFitnessRoutes.post('/:id/sessions', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ session: await new GymFitnessRepository(c.env.DB).logSession(c.req.param('id'), auth.tenantId, { memberRefId: b['member_ref_id'] as string, sessionDate: b['session_date'] as number, durationMinutes: b['duration_minutes'] as number, sessionType: b['session_type'] as string | undefined, trainerRefId: b['trainer_ref_id'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
gymFitnessRoutes.post('/:id/equipment-log', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ log: await new GymFitnessRepository(c.env.DB).logEquipmentMaintenance(c.req.param('id'), auth.tenantId, { equipmentName: b['equipment_name'] as string, maintenanceDate: b['maintenance_date'] as number, notes: b['notes'] as string | undefined, costKobo: b['cost_kobo'] as number | undefined }) }, 201);
});
