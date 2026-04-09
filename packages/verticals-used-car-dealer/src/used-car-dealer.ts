import type {
  UsedCarDealerProfile, CreateUsedCarDealerInput, UpdateUsedCarDealerInput,
  UsedCarDealerFSMState, CarListing, CreateCarListingInput, CarListingStatus,
  InspectionStatus, TestDriveBooking, CreateTestDriveBookingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, dealership_name, cac_rc, frsc_dealer_licence, mssn_membership, status, created_at, updated_at';
const LISTING_COLS = 'id, workspace_id, tenant_id, make, model, year, vin, mileage_km, asking_price_kobo, colour_exterior, inspection_status, status, created_at, updated_at';
const BOOKING_COLS = 'id, workspace_id, tenant_id, listing_id, client_phone, scheduled_at, completed, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): UsedCarDealerProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, dealershipName: r['dealership_name'] as string, cacRc: r['cac_rc'] as string | null, frscDealerLicence: r['frsc_dealer_licence'] as string | null, mssnMembership: r['mssn_membership'] as string | null, status: r['status'] as UsedCarDealerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToListing(r: Record<string, unknown>): CarListing {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, make: r['make'] as string, model: r['model'] as string, year: r['year'] as number, vin: r['vin'] as string | null, mileageKm: r['mileage_km'] as number, askingPriceKobo: r['asking_price_kobo'] as number, colourExterior: r['colour_exterior'] as string | null, inspectionStatus: r['inspection_status'] as InspectionStatus, status: r['status'] as CarListingStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToBooking(r: Record<string, unknown>): TestDriveBooking {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, listingId: r['listing_id'] as string, clientPhone: r['client_phone'] as string, scheduledAt: r['scheduled_at'] as number, completed: r['completed'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class UsedCarDealerRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateUsedCarDealerInput): Promise<UsedCarDealerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO used_car_dealer_profiles (id, workspace_id, tenant_id, dealership_name, cac_rc, frsc_dealer_licence, mssn_membership, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.dealershipName, input.cacRc ?? null, input.frscDealerLicence ?? null, input.mssnMembership ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[used-car-dealer] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<UsedCarDealerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM used_car_dealer_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<UsedCarDealerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM used_car_dealer_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateUsedCarDealerInput): Promise<UsedCarDealerProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.dealershipName !== undefined) { sets.push('dealership_name = ?'); vals.push(input.dealershipName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.frscDealerLicence !== undefined) { sets.push('frsc_dealer_licence = ?'); vals.push(input.frscDealerLicence); }
    if (input.mssnMembership !== undefined) { sets.push('mssn_membership = ?'); vals.push(input.mssnMembership); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE used_car_dealer_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: UsedCarDealerFSMState): Promise<UsedCarDealerProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createListing(input: CreateCarListingInput): Promise<CarListing> {
    if (!Number.isInteger(input.year) || input.year < 1900) throw new Error('[used-car-dealer] year must be valid integer (P9)');
    if (!Number.isInteger(input.mileageKm) || input.mileageKm < 0) throw new Error('[used-car-dealer] mileageKm must be non-negative integer (P9)');
    if (!Number.isInteger(input.askingPriceKobo) || input.askingPriceKobo <= 0) throw new Error('[used-car-dealer] askingPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO car_listings (id, workspace_id, tenant_id, make, model, year, vin, mileage_km, asking_price_kobo, colour_exterior, inspection_status, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'available', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.make, input.model, input.year, input.vin ?? null, input.mileageKm, input.askingPriceKobo, input.colourExterior ?? null).run();
    const l = await this.findListingById(id, input.tenantId);
    if (!l) throw new Error('[used-car-dealer] listing create failed');
    return l;
  }

  async findListingById(id: string, tenantId: string): Promise<CarListing | null> {
    const row = await this.db.prepare(`SELECT ${LISTING_COLS} FROM car_listings WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToListing(row) : null;
  }

  async listListings(workspaceId: string, tenantId: string): Promise<CarListing[]> {
    const { results } = await this.db.prepare(`SELECT ${LISTING_COLS} FROM car_listings WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToListing);
  }

  async updateListingStatus(id: string, tenantId: string, status: CarListingStatus): Promise<CarListing | null> {
    await this.db.prepare(`UPDATE car_listings SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findListingById(id, tenantId);
  }

  async updateInspectionStatus(id: string, tenantId: string, inspectionStatus: InspectionStatus): Promise<CarListing | null> {
    await this.db.prepare(`UPDATE car_listings SET inspection_status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(inspectionStatus, id, tenantId).run();
    return this.findListingById(id, tenantId);
  }

  async createTestDriveBooking(input: CreateTestDriveBookingInput): Promise<TestDriveBooking> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO test_drive_bookings (id, workspace_id, tenant_id, listing_id, client_phone, scheduled_at, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.listingId, input.clientPhone, input.scheduledAt).run();
    const b = await this.findBookingById(id, input.tenantId);
    if (!b) throw new Error('[used-car-dealer] booking create failed');
    return b;
  }

  async findBookingById(id: string, tenantId: string): Promise<TestDriveBooking | null> {
    const row = await this.db.prepare(`SELECT ${BOOKING_COLS} FROM test_drive_bookings WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToBooking(row) : null;
  }

  async listBookings(workspaceId: string, tenantId: string): Promise<TestDriveBooking[]> {
    const { results } = await this.db.prepare(`SELECT ${BOOKING_COLS} FROM test_drive_bookings WHERE workspace_id = ? AND tenant_id = ? ORDER BY scheduled_at ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToBooking);
  }
}
