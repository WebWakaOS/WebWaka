import { Hono } from 'hono';
import { OpticianRepository, isValidOpticianTransition } from '@webwaka/verticals-optician';
import type { OpticianFSMState } from '@webwaka/verticals-optician';
import type { Env } from '../../env.js';
export const opticianRoutes = new Hono<{ Bindings: Env }>();
opticianRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['business_name']) return c.json({ error: 'workspace_id, business_name required' }, 400);
  return c.json({ optician: await new OpticianRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, businessName: b['business_name'] as string, coaLicence: b['coa_licence'] as string | undefined, mdcnVerification: b['mdcn_verification'] as string | undefined, cacRc: b['cac_rc'] as string | undefined }) }, 201);
});
opticianRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ optician: await new OpticianRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
opticianRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new OpticianRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ optician: p }); });
opticianRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new OpticianRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as OpticianFSMState; if (!isValidOpticianTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}` }, 422);
  return c.json({ optician: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { coaLicence: b['coa_licence'] as string | undefined }) });
});
opticianRoutes.post('/:id/vision-tests', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ test: await new OpticianRepository(c.env.DB).recordVisionTest(c.req.param('id'), auth.tenantId, { patientRefId: b['patient_ref_id'] as string, testDate: b['test_date'] as number, rightEyeSphX100: b['right_eye_sph_x100'] as number, leftEyeSphX100: b['left_eye_sph_x100'] as number, rightEyeCylX100: b['right_eye_cyl_x100'] as number | undefined, leftEyeCylX100: b['left_eye_cyl_x100'] as number | undefined, pdMmX10: b['pd_mm_x10'] as number | undefined, optometristRefId: b['optometrist_ref_id'] as string | undefined, requiresReferral: b['requires_referral'] as boolean | undefined, notes: b['notes'] as string | undefined, consultationFeeKobo: b['consultation_fee_kobo'] as number | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
opticianRoutes.get('/:id/vision-tests', async (c) => { const auth = c.get('auth') as { tenantId: string }; const tests = await new OpticianRepository(c.env.DB).listVisionTests(c.req.param('id'), auth.tenantId); return c.json({ tests, count: tests.length }); });
opticianRoutes.post('/:id/eyewear-orders', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ order: await new OpticianRepository(c.env.DB).createEyewearOrder(c.req.param('id'), auth.tenantId, { patientRefId: b['patient_ref_id'] as string, testId: b['test_id'] as string | undefined, eyewearType: b['eyewear_type'] as string, frameBrand: b['frame_brand'] as string | undefined, lensBrand: b['lens_brand'] as string | undefined, totalKobo: b['total_kobo'] as number, depositKobo: b['deposit_kobo'] as number | undefined, orderDate: b['order_date'] as number }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
opticianRoutes.get('/:id/eyewear-orders', async (c) => { const auth = c.get('auth') as { tenantId: string }; const orders = await new OpticianRepository(c.env.DB).listEyewearOrders(c.req.param('id'), auth.tenantId); return c.json({ orders, count: orders.length }); });
