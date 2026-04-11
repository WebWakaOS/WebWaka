/**
 * CocoaExporterRepository — M12
 * T3: all queries scoped to tenantId
 * P9: price_per_kg_kobo / fob_value_kobo are integers; weights as integer kg
 * KYC Tier 3 MANDATORY — export FX transactions
 * ADL-010: AI at L2 — commodity alerts advisory only
 */

import type {
  CocoaExporterProfile, CocoaProcurement, CocoaExport,
  CocoaExporterFSMState, CocoaGrade, ExportStatus,
  CreateCocoaExporterInput, CreateProcurementInput, CreateExportInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; company_name: string; nepc_exporter_licence: string | null; nxp_number: string | null; crin_registered: number; cbn_forex_dealer: number; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface ProcurementRow { id: string; profile_id: string; tenant_id: string; farmer_phone: string; quantity_kg: number; grade: string; price_per_kg_kobo: number; intake_date: number; created_at: number; }
interface ExportRow { id: string; profile_id: string; tenant_id: string; buyer_country: string; quantity_kg: number; quality_cert_ref: string | null; nepc_licence_ref: string | null; cbn_fx_form: string | null; fob_value_kobo: number; shipping_date: number | null; fx_repatriated_kobo: number; repatriation_date: number | null; status: string; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): CocoaExporterProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, companyName: r.company_name, nepcExporterLicence: r.nepc_exporter_licence, nxpNumber: r.nxp_number, crinRegistered: r.crin_registered === 1, cbnForexDealer: r.cbn_forex_dealer === 1, cacRc: r.cac_rc, status: r.status as CocoaExporterFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToProcurement(r: ProcurementRow): CocoaProcurement { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, farmerPhone: r.farmer_phone, quantityKg: r.quantity_kg, grade: r.grade as CocoaGrade, pricePerKgKobo: r.price_per_kg_kobo, intakeDate: r.intake_date, createdAt: r.created_at }; }
function rowToExport(r: ExportRow): CocoaExport { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerCountry: r.buyer_country, quantityKg: r.quantity_kg, qualityCertRef: r.quality_cert_ref, nepcLicenceRef: r.nepc_licence_ref, cbnFxForm: r.cbn_fx_form, fobValueKobo: r.fob_value_kobo, shippingDate: r.shipping_date, fxRepatriatedKobo: r.fx_repatriated_kobo, repatriationDate: r.repatriation_date, status: r.status as ExportStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class CocoaExporterRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateCocoaExporterInput): Promise<CocoaExporterProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cocoa_exporter_profiles (id,workspace_id,tenant_id,company_name,nepc_exporter_licence,nxp_number,crin_registered,cbn_forex_dealer,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.companyName, input.nepcExporterLicence ?? null, input.nxpNumber ?? null, input.crinRegistered ? 1 : 0, input.cbnForexDealer ? 1 : 0, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<CocoaExporterProfile | null> {
    const r = await this.db.prepare('SELECT * FROM cocoa_exporter_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: CocoaExporterFSMState): Promise<CocoaExporterProfile> {
    await this.db.prepare('UPDATE cocoa_exporter_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNepcLicence(id: string, tenantId: string, licence: string): Promise<void> {
    await this.db.prepare('UPDATE cocoa_exporter_profiles SET nepc_exporter_licence=?,updated_at=? WHERE id=? AND tenant_id=?').bind(licence, now(), id, tenantId).run();
  }

  async createProcurement(input: CreateProcurementInput): Promise<CocoaProcurement> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cocoa_procurement (id,profile_id,tenant_id,farmer_phone,quantity_kg,grade,price_per_kg_kobo,intake_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.farmerPhone, input.quantityKg, input.grade ?? 'grade1', input.pricePerKgKobo, input.intakeDate, ts).run();
    return (await this.findProcurementById(id, input.tenantId))!;
  }

  async findProcurementById(id: string, tenantId: string): Promise<CocoaProcurement | null> {
    const r = await this.db.prepare('SELECT * FROM cocoa_procurement WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProcurementRow>();
    return r ? rowToProcurement(r) : null;
  }

  async createExport(input: CreateExportInput): Promise<CocoaExport> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.fobValueKobo) || input.fobValueKobo < 0) throw new Error('P9: fobValueKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cocoa_exports (id,profile_id,tenant_id,buyer_country,quantity_kg,quality_cert_ref,nepc_licence_ref,cbn_fx_form,fob_value_kobo,shipping_date,fx_repatriated_kobo,repatriation_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerCountry, input.quantityKg, input.qualityCertRef ?? null, input.nepcLicenceRef ?? null, input.cbnFxForm ?? null, input.fobValueKobo, input.shippingDate ?? null, 0, null, 'prepared', ts, ts).run();
    return (await this.findExportById(id, input.tenantId))!;
  }

  async findExportById(id: string, tenantId: string): Promise<CocoaExport | null> {
    const r = await this.db.prepare('SELECT * FROM cocoa_exports WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ExportRow>();
    return r ? rowToExport(r) : null;
  }
}
