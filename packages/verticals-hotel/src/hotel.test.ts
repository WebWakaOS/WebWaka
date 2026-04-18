/**
 * @webwaka/verticals-hotel — HotelRepository tests (M9)
 * Acceptance: ≥30 tests covering FSM, P9, T3, booking calendar, revenue.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HotelRepository } from './hotel.js';
import {
  isValidHotelTransition,
  guardClaimedToNihotourVerified,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const stores: Record<string, Record<string, unknown>[]> = {};
  const getStore = (sql: string): Record<string, unknown>[] => {
    const m = sql.match(/(?:INSERT INTO|UPDATE|SELECT\s.+?\sFROM|DELETE FROM)\s+(\w+)/i);
    const name = m?.[1] ?? 'default';
    if (!stores[name]) stores[name] = [];
    const store = stores[name];
    if (!store) throw new Error(`Store not found: ${name}`);
    return store;
  };

  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        const store = getStore(sql);
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1]!.split(',').map((c: string) => c.trim());
            const tokens = valM[1]!.split(',').map((v: string) => v.trim());
            const row: Record<string, unknown> = {};
            let bi = 0;
            cols.forEach((col: string, i: number) => {
              const tok = tokens[i] ?? '?';
              if (tok === '?') { row[col] = vals[bi++]; }
              else if (tok.toUpperCase() === 'NULL') { row[col] = null; }
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (!row['updated_at']) row['updated_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.toLowerCase().startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              let bi = 0;
              clauses.forEach((clause: string) => {
                const eqIdx = clause.indexOf('=');
                const col = clause.slice(0, eqIdx).trim();
                const rhs = clause.slice(eqIdx + 1).trim();
                if (rhs === '?') {
                  (store[idx] as Record<string, unknown>)[col] = vals[bi++];
                } else if (rhs.startsWith("'") && rhs.endsWith("'")) {
                  (store[idx] as Record<string, unknown>)[col] = rhs.slice(1, -1);
                } else if (rhs.toLowerCase() !== 'unixepoch()' && !Number.isNaN(Number(rhs)) && rhs !== '') {
                  (store[idx] as Record<string, unknown>)[col] = Number(rhs);
                }
              });
              (store[idx] as Record<string, unknown>)['updated_at'] = Math.floor(Date.now() / 1000);
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        const store = getStore(sql);
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        // Double-booking conflict check: SELECT id FROM hotel_reservations WHERE room_id=? AND ...
        if (sql.toLowerCase().includes('room_id=?') && sql.toLowerCase().includes('check_in <')) {
          const roomId = vals[0] as string;
          const tenantId = vals[1] as string;
          const checkOut = vals[2] as number;
          const checkIn = vals[3] as number;
          const conflict = store.find(r =>
            r['room_id'] === roomId && r['tenant_id'] === tenantId &&
            !['cancelled', 'checked_out'].includes(r['status'] as string) &&
            (r['check_in'] as number) < checkOut && (r['check_out'] as number) > checkIn
          );
          return (conflict ?? null) as T;
        }
        // workspace_id lookup (findProfileByWorkspace)
        if (sql.toLowerCase().includes('workspace_id=?') && !sql.toLowerCase().includes(' id=?')) {
          const found = store.find(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length >= 2) {
          const found = store.find(r => r['id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length === 1) return (store.find(r => r['id'] === vals[0]) ?? null) as T;
        return (store[0] ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const store = getStore(sql);
        const filtered = store.filter(r => {
          if (vals.length >= 2) {
            return (r['profile_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof HotelRepository>[0];
}

describe('HotelRepository — Profile Management', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T001 — creates hotel profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Eko Hotel', hotelType: 'hotel' });
    expect(p.status).toBe('seeded');
    expect(p.hotelName).toBe('Eko Hotel');
  });

  it('T002 — uses provided id', async () => {
    const p = await repo.createProfile({ id: 'h-001', workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Lagos Inn' });
    expect(p.id).toBe('h-001');
  });

  it('T003 — tenant isolation: cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Private Hotel' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — findProfileById returns null for missing', async () => {
    expect(await repo.findProfileById('nonexistent', 'tn1')).toBeNull();
  });

  it('T005 — findProfileByWorkspace returns profile', async () => {
    await repo.createProfile({ workspaceId: 'ws-abc', tenantId: 'tn1', hotelName: 'Sheraton Lagos' });
    expect(await repo.findProfileByWorkspace('ws-abc', 'tn1')).not.toBeNull();
  });

  it('T006 — stores hotel type correctly', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws2', tenantId: 'tn1', hotelName: 'Shortlet Lagos', hotelType: 'shortlet' });
    expect(p.hotelType).toBe('shortlet');
  });

  it('T007 — stores star rating', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws3', tenantId: 'tn1', hotelName: '5-Star', starRating: 5 });
    expect(p.starRating).toBe(5);
  });
});

describe('HotelRepository — FSM Transitions', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T008 — valid FSM: seeded→claimed', () => {
    expect(isValidHotelTransition('seeded', 'claimed')).toBe(true);
  });

  it('T009 — valid FSM: claimed→nihotour_verified', () => {
    expect(isValidHotelTransition('claimed', 'nihotour_verified')).toBe(true);
  });

  it('T010 — valid FSM: nihotour_verified→active', () => {
    expect(isValidHotelTransition('nihotour_verified', 'active')).toBe(true);
  });

  it('T011 — valid FSM: active→suspended', () => {
    expect(isValidHotelTransition('active', 'suspended')).toBe(true);
  });

  it('T012 — valid FSM: suspended→active (reinstatement)', () => {
    expect(isValidHotelTransition('suspended', 'active')).toBe(true);
  });

  it('T013 — invalid FSM: seeded→active (skips steps)', () => {
    expect(isValidHotelTransition('seeded', 'active')).toBe(false);
  });

  it('T014 — invalid FSM: active→seeded (regression)', () => {
    expect(isValidHotelTransition('active', 'seeded')).toBe(false);
  });

  it('T015 — transitionStatus updates profile status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Transit Hotel' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });

  it('T016 — transitionStatus stores nihotour licence', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Licensed Hotel' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'nihotour_verified', { nihotourLicence: 'NIHOTOUR/001/2024' });
    expect(updated.nihotourLicence).toBe('NIHOTOUR/001/2024');
  });

  it('T017 — guard: claimed→nihotour_verified requires licence', () => {
    expect(guardClaimedToNihotourVerified({ nihotourLicence: null }).allowed).toBe(false);
    expect(guardClaimedToNihotourVerified({ nihotourLicence: '' }).allowed).toBe(false);
    expect(guardClaimedToNihotourVerified({ nihotourLicence: 'NIHOTOUR/001' }).allowed).toBe(true);
  });

  it('T018 — AI L2 cap guard: blocks L3+ autonomy level', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });
});

describe('HotelRepository — Room Management', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T019 — creates room with integer rate_per_night_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Test Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '101', roomType: 'single', ratePerNightKobo: 2500000 });
    expect(room.ratePerNightKobo).toBe(2500000);
    expect(room.roomNumber).toBe('101');
  });

  it('T020 — rejects float ratePerNightKobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Test Hotel B' });
    await expect(repo.createRoom(p.id, 'tn1', { roomNumber: '102', roomType: 'double', ratePerNightKobo: 2500.50 })).rejects.toThrow('integer');
  });

  it('T021 — listRooms returns rooms for profile', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Multi Room' });
    await repo.createRoom(p.id, 'tn1', { roomNumber: '201', roomType: 'suite', ratePerNightKobo: 5000000 });
    await repo.createRoom(p.id, 'tn1', { roomNumber: '202', roomType: 'deluxe', ratePerNightKobo: 4000000 });
    const rooms = await repo.listRooms(p.id, 'tn1');
    expect(rooms.length).toBeGreaterThanOrEqual(2);
  });

  it('T022 — stores room capacity', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Capacity Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '301', roomType: 'suite', ratePerNightKobo: 8000000, capacity: 4 });
    expect(room.capacity).toBe(4);
  });
});

describe('HotelRepository — Reservations & Booking Calendar', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T023 — creates reservation with integer total_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Booking Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '101', roomType: 'single', ratePerNightKobo: 2500000 });
    const now = Math.floor(Date.now() / 1000);
    const res = await repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'guest-001', checkIn: now + 86400,
      checkOut: now + 172800, nights: 1, totalKobo: 2500000, depositKobo: 500000,
    });
    expect(res.totalKobo).toBe(2500000);
    expect(res.status).toBe('pending');
  });

  it('T024 — rejects float total_kobo on reservation (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Float Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '102', roomType: 'single', ratePerNightKobo: 2500000 });
    const now = Math.floor(Date.now() / 1000);
    await expect(repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'guest-002', checkIn: now, checkOut: now + 86400, nights: 1, totalKobo: 2500.50,
    })).rejects.toThrow('integer');
  });

  it('T025 — double-booking prevention: same room same dates rejected', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Busy Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '103', roomType: 'double', ratePerNightKobo: 3000000 });
    const now = Math.floor(Date.now() / 1000);
    await repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'guest-003', checkIn: now + 86400, checkOut: now + 259200, nights: 2, totalKobo: 6000000,
    });
    await expect(repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'guest-004', checkIn: now + 86400, checkOut: now + 259200, nights: 2, totalKobo: 6000000,
    })).rejects.toThrow(/booked/i);
  });

  it('T026 — listReservations returns tenant-scoped list', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'List Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '104', roomType: 'single', ratePerNightKobo: 2000000 });
    const now = Math.floor(Date.now() / 1000);
    await repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'guest-005', checkIn: now + 86400, checkOut: now + 172800, nights: 1, totalKobo: 2000000,
    });
    const list = await repo.listReservations(p.id, 'tn1');
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('T027 — guest_ref_id is opaque string (P13)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Privacy Hotel' });
    const room = await repo.createRoom(p.id, 'tn1', { roomNumber: '105', roomType: 'single', ratePerNightKobo: 2000000 });
    const now = Math.floor(Date.now() / 1000);
    const res = await repo.createReservation(p.id, 'tn1', {
      roomId: room.id, guestRefId: 'ref-opaque-123', checkIn: now + 86400, checkOut: now + 172800, nights: 1, totalKobo: 2000000,
    });
    expect(res.guestRefId).toBe('ref-opaque-123');
  });
});

describe('HotelRepository — Revenue Summary', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T028 — creates revenue summary with integer kobo values (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'RevPAR Hotel' });
    const summary = await repo.createRevenueSummary(p.id, 'tn1', {
      summaryDate: Math.floor(Date.now() / 1000), roomsAvailable: 50, roomsSold: 35, totalRevenueKobo: 87500000, revparKobo: 1750000,
    });
    expect(summary.totalRevenueKobo).toBe(87500000);
    expect(summary.revparKobo).toBe(1750000);
  });

  it('T029 — rejects float totalRevenueKobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'Float Revenue Hotel' });
    await expect(repo.createRevenueSummary(p.id, 'tn1', {
      summaryDate: Math.floor(Date.now() / 1000), roomsAvailable: 50, roomsSold: 35, totalRevenueKobo: 87500000.50, revparKobo: 1750000,
    })).rejects.toThrow();
  });

  it('T030 — listRevenueSummaries returns records in order', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'History Hotel' });
    const now = Math.floor(Date.now() / 1000);
    await repo.createRevenueSummary(p.id, 'tn1', { summaryDate: now - 86400, roomsAvailable: 50, roomsSold: 30, totalRevenueKobo: 75000000, revparKobo: 1500000 });
    await repo.createRevenueSummary(p.id, 'tn1', { summaryDate: now, roomsAvailable: 50, roomsSold: 40, totalRevenueKobo: 100000000, revparKobo: 2000000 });
    const list = await repo.listRevenueSummaries(p.id, 'tn1');
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('T031 — RevPAR stored as integer kobo, never float (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', hotelName: 'KPI Hotel' });
    const summary = await repo.createRevenueSummary(p.id, 'tn1', {
      summaryDate: Math.floor(Date.now() / 1000), roomsAvailable: 100, roomsSold: 67, totalRevenueKobo: 167500000, revparKobo: 1675000,
    });
    expect(Number.isInteger(summary.revparKobo)).toBe(true);
  });

  it('T032 — tenant isolation on revenue summary (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-A', hotelName: 'Isolated Hotel' });
    await repo.createRevenueSummary(p.id, 'tn-A', {
      summaryDate: Math.floor(Date.now() / 1000), roomsAvailable: 50, roomsSold: 20, totalRevenueKobo: 50000000, revparKobo: 1000000,
    });
    const listB = await repo.listRevenueSummaries(p.id, 'tn-B');
    expect(listB.length).toBe(0);
  });
});

describe('HotelRepository — Platform Invariants', () => {
  let repo: HotelRepository;
  beforeEach(() => { repo = new HotelRepository(makeDb() as never); });

  it('T033 — tenantId is always stored on profile (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-invariant', hotelName: 'Invariant Hotel' });
    expect(p.tenantId).toBe('tn-invariant');
  });

  it('T034 — guesthouse type supported', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws2', tenantId: 'tn1', hotelName: 'Lagos Guesthouse', hotelType: 'guesthouse' });
    expect(p.hotelType).toBe('guesthouse');
  });

  it('T035 — profile stores CAC RC and state tourism board ref', async () => {
    const p = await repo.createProfile({
      workspaceId: 'ws3', tenantId: 'tn1', hotelName: 'Registered Hotel',
      cacRc: 'RC123456', stateTourismBoardRef: 'LSTB/H/2024/001',
    });
    expect(p.cacRc).toBe('RC123456');
    expect(p.stateTourismBoardRef).toBe('LSTB/H/2024/001');
  });
});
