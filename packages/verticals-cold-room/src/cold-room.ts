/**
 * ColdRoomRepository — M10
 * T3: all queries scoped to tenantId
 * P9: daily_rate_kobo / total_charged_kobo are integers
 * Temperature stored as integer millidegrees Celsius (no floats)
 * Capacity as integer kg
 */

import type {
  ColdRoomProfile, ColdRoomUnit, ColdStorageAgreement, ColdTempLog,
  ColdRoomFSMState, UnitStatus, AgreementStatus,
  CreateColdRoomInput, CreateUnitInput, CreateAgreementInput, CreateTempLogInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; facility_name: string; nafdac_cold_chain_cert: string | null; son_cert: string | null; capacity_kg: number; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface UnitRow { id: string; profile_id: string; tenant_id: string; unit_number: string; capacity_kg: number; current_temp_mc: number; status: string; created_at: number; updated_at: number; }
interface AgreementRow { id: string; profile_id: string; tenant_id: string; client_phone: string; commodity_type: string; quantity_kg: number; daily_rate_kobo: number; entry_date: number; exit_date: number | null; total_charged_kobo: number; status: string; created_at: number; updated_at: number; }
interface TempLogRow { id: string; profile_id: string; tenant_id: string; unit_id: string; log_time: number; temperature_mc: number; alert_flag: number; created_at: number; }

function rowToProfile(r: ProfileRow): ColdRoomProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, facilityName: r.facility_name, nafdacColdChainCert: r.nafdac_cold_chain_cert, sonCert: r.son_cert, capacityKg: r.capacity_kg, cacRc: r.cac_rc, status: r.status as ColdRoomFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToUnit(r: UnitRow): ColdRoomUnit { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, unitNumber: r.unit_number, capacityKg: r.capacity_kg, currentTempMc: r.current_temp_mc, status: r.status as UnitStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToAgreement(r: AgreementRow): ColdStorageAgreement { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientPhone: r.client_phone, commodityType: r.commodity_type, quantityKg: r.quantity_kg, dailyRateKobo: r.daily_rate_kobo, entryDate: r.entry_date, exitDate: r.exit_date, totalChargedKobo: r.total_charged_kobo, status: r.status as AgreementStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToTempLog(r: TempLogRow): ColdTempLog { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, unitId: r.unit_id, logTime: r.log_time, temperatureMc: r.temperature_mc, alertFlag: r.alert_flag === 1, createdAt: r.created_at }; }

export class ColdRoomRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateColdRoomInput): Promise<ColdRoomProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cold_room_profiles (id,workspace_id,tenant_id,facility_name,nafdac_cold_chain_cert,son_cert,capacity_kg,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.facilityName, input.nafdacColdChainCert ?? null, input.sonCert ?? null, input.capacityKg ?? 0, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<ColdRoomProfile | null> {
    const r = await this.db.prepare('SELECT * FROM cold_room_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: ColdRoomFSMState): Promise<ColdRoomProfile> {
    await this.db.prepare('UPDATE cold_room_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNafdacCert(id: string, tenantId: string, cert: string): Promise<void> {
    await this.db.prepare('UPDATE cold_room_profiles SET nafdac_cold_chain_cert=?,updated_at=? WHERE id=? AND tenant_id=?').bind(cert, now(), id, tenantId).run();
  }

  async createUnit(input: CreateUnitInput): Promise<ColdRoomUnit> {
    if (!Number.isInteger(input.capacityKg) || input.capacityKg < 0) throw new Error('Capacity must be a non-negative integer kg');
    const currentTemp = input.currentTempMc ?? 0;
    if (!Number.isInteger(currentTemp)) throw new Error('Temperature must be an integer millidegrees Celsius');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cold_room_units (id,profile_id,tenant_id,unit_number,capacity_kg,current_temp_mc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.unitNumber, input.capacityKg, currentTemp, 'active', ts, ts).run();
    return (await this.findUnitById(id, input.tenantId))!;
  }

  async findUnitById(id: string, tenantId: string): Promise<ColdRoomUnit | null> {
    const r = await this.db.prepare('SELECT * FROM cold_room_units WHERE id=? AND tenant_id=?').bind(id, tenantId).first<UnitRow>();
    return r ? rowToUnit(r) : null;
  }

  async createAgreement(input: CreateAgreementInput): Promise<ColdStorageAgreement> {
    if (!Number.isInteger(input.dailyRateKobo) || input.dailyRateKobo < 0) throw new Error('P9: dailyRateKobo must be a non-negative integer');
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cold_storage_agreements (id,profile_id,tenant_id,client_phone,commodity_type,quantity_kg,daily_rate_kobo,entry_date,exit_date,total_charged_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientPhone, input.commodityType, input.quantityKg, input.dailyRateKobo, input.entryDate, null, 0, 'active', ts, ts).run();
    return (await this.findAgreementById(id, input.tenantId))!;
  }

  async findAgreementById(id: string, tenantId: string): Promise<ColdStorageAgreement | null> {
    const r = await this.db.prepare('SELECT * FROM cold_storage_agreements WHERE id=? AND tenant_id=?').bind(id, tenantId).first<AgreementRow>();
    return r ? rowToAgreement(r) : null;
  }

  async logTemperature(input: CreateTempLogInput): Promise<ColdTempLog> {
    if (!Number.isInteger(input.temperatureMc)) throw new Error('Temperature must be an integer millidegrees Celsius (no floats)');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cold_temp_log (id,profile_id,tenant_id,unit_id,log_time,temperature_mc,alert_flag,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.unitId, input.logTime, input.temperatureMc, input.alertFlag ? 1 : 0, ts).run();
    return (await this.findTempLogById(id, input.tenantId))!;
  }

  async findTempLogById(id: string, tenantId: string): Promise<ColdTempLog | null> {
    const r = await this.db.prepare('SELECT * FROM cold_temp_log WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TempLogRow>();
    return r ? rowToTempLog(r) : null;
  }
}
