/**
 * Oil-gas-services routes — dual-gate FSM: ncdmb_certified → dpr_registered.
 * AI cap: L2 max, Tier 3 KYC. contract_value_kobo as INTEGER 64-bit (bigint).
 * All monetary in kobo (INTEGER). All queries scoped to tenant_id.
 */
import { Hono } from 'hono';
import { OilGasServicesRepository, isValidOilGasServicesTransition } from '@webwaka/verticals-oil-gas-services';
import type { OilGasServicesFSMState } from '@webwaka/verticals-oil-gas-services';
import type { Env } from '../../env.js';
export const oilGasServicesRoutes = new Hono<{ Bindings: Env }>();
oilGasServicesRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['workspace_id'] || !b['company_name']) return c.json({ error: 'workspace_id, company_name required' }, 400);
  return c.json({ oil_gas_services: await new OilGasServicesRepository(c.env.DB).createProfile({ workspaceId: b['workspace_id'] as string, tenantId: auth.tenantId, companyName: b['company_name'] as string, ncdmbCert: b['ncdmb_cert'] as string | undefined, dprRegistration: b['dpr_licence'] as string | undefined, cacRc: b['cac_rc'] as string | undefined, tinRef: b['tin_ref'] as string | undefined, serviceSegment: b['service_segment'] as string | undefined, lc: b['lc'] as number | undefined }) }, 201);
});
oilGasServicesRoutes.get('/workspace/:workspaceId', async (c) => { const auth = c.get('auth') as { tenantId: string }; return c.json({ oil_gas_services: await new OilGasServicesRepository(c.env.DB).findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId) }); });
oilGasServicesRoutes.get('/:id', async (c) => { const auth = c.get('auth') as { tenantId: string }; const p = await new OilGasServicesRepository(c.env.DB).findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404); return c.json({ oil_gas_services: p }); });
oilGasServicesRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new OilGasServicesRepository(c.env.DB); const p = await repo.findProfileById(c.req.param('id'), auth.tenantId); if (!p) return c.json({ error: 'Not found' }, 404);
  const to = b['status'] as OilGasServicesFSMState;
  if (!isValidOilGasServicesTransition(p.status, to)) return c.json({ error: `Invalid FSM transition ${p.status} → ${to}. Dual-gate: ncdmb_certified required before dpr_registered.` }, 422);
  return c.json({ oil_gas_services: await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { ncdmbCert: b['ncdmb_cert'] as string | undefined, dprRegistration: b['dpr_licence'] as string | undefined }) });
});
oilGasServicesRoutes.post('/:id/contracts', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!b['client_ref_id'] || !b['contract_title'] || b['contract_value_kobo'] === undefined) return c.json({ error: 'client_ref_id, contract_title, contract_value_kobo required' }, 400);
  try {
    const contract = await new OilGasServicesRepository(c.env.DB).createContract(c.req.param('id'), auth.tenantId, { clientRefId: b['client_ref_id'] as string, contractTitle: b['contract_title'] as string, contractValueKobo: Number(b['contract_value_kobo']), contractScope: b['contract_scope'] as string | undefined, startDate: b['start_date'] as number, endDate: b['end_date'] as number | undefined, performanceBondKobo: b['performance_bond_kobo'] !== undefined ? Number(b['performance_bond_kobo']) : undefined, mobilisationKobo: b['mobilisation_kobo'] !== undefined ? Number(b['mobilisation_kobo']) : undefined });
    return c.json({ contract: { ...contract, contract_value_kobo: String(contract.contractValueKobo ?? 0), performance_bond_kobo: String(contract.performanceBondKobo ?? ''), mobilisation_kobo: String(contract.mobilisationKobo ?? '') } }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
oilGasServicesRoutes.get('/:id/contracts', async (c) => {
  const auth = c.get('auth') as { tenantId: string };
  const contracts = await new OilGasServicesRepository(c.env.DB).listContracts(c.req.param('id'), auth.tenantId);
  const serialized = contracts.map((ct) => ({ ...ct, contract_value_kobo: ct.contractValueKobo?.toString(), performance_bond_kobo: ct.performanceBondKobo?.toString(), mobilisation_kobo: ct.mobilisationKobo?.toString() }));
  return c.json({ contracts: serialized, count: serialized.length });
});
oilGasServicesRoutes.post('/:id/personnel', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ personnel: await new OilGasServicesRepository(c.env.DB).addPersonnel(c.req.param('id'), auth.tenantId, { personnelRefId: b['personnel_ref_id'] as string, role: b['role'] as string, ncdmbCategory: b['ncdmb_category'] as string | undefined, expatriate: b['expatriate'] as boolean | undefined, monthlySalaryKobo: b['monthly_salary_kobo'] as number | undefined }) }, 201);
});
oilGasServicesRoutes.get('/:id/personnel', async (c) => { const auth = c.get('auth') as { tenantId: string }; const personnel = await new OilGasServicesRepository(c.env.DB).listPersonnel(c.req.param('id'), auth.tenantId); return c.json({ personnel, count: personnel.length }); });
oilGasServicesRoutes.post('/:id/equipment', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  try { return c.json({ equipment: await new OilGasServicesRepository(c.env.DB).registerEquipment(c.req.param('id'), auth.tenantId, { equipmentName: b['equipment_name'] as string, serialNumber: b['serial_number'] as string | undefined, assetTag: b['asset_tag'] as string | undefined, valuationKobo: b['valuation_kobo'] as number | undefined, lastCertDate: b['last_cert_date'] as number | undefined, certBody: b['cert_body'] as string | undefined }) }, 201); } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});
oilGasServicesRoutes.get('/:id/equipment', async (c) => { const auth = c.get('auth') as { tenantId: string }; const equipment = await new OilGasServicesRepository(c.env.DB).listEquipment(c.req.param('id'), auth.tenantId); return c.json({ equipment, count: equipment.length }); });
oilGasServicesRoutes.post('/:id/hse-log', async (c) => {
  const auth = c.get('auth') as { tenantId: string }; let b: Record<string, unknown>; try { b = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  return c.json({ log: await new OilGasServicesRepository(c.env.DB).createHseLog(c.req.param('id'), auth.tenantId, { logDate: b['log_date'] as number, incidentType: b['incident_type'] as string | undefined, manHoursWorked: b['man_hours_worked'] as number, ltifr: b['ltifr'] as number | undefined, trifr: b['trifr'] as number | undefined, nearMissCount: b['near_miss_count'] as number | undefined, notes: b['notes'] as string | undefined }) }, 201);
});
oilGasServicesRoutes.get('/:id/hse-log', async (c) => { const auth = c.get('auth') as { tenantId: string }; const logs = await new OilGasServicesRepository(c.env.DB).listHseLogs(c.req.param('id'), auth.tenantId); return c.json({ hse_logs: logs, count: logs.length }); });
