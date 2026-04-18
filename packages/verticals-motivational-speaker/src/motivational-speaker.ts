import type { MotivationalSpeakerProfile, CreateMotivationalSpeakerInput, MotivationalSpeakerFSMState, SpeakingEngagement, TrainingProgram, TrainingEnrollment, EnrollmentStatus } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): MotivationalSpeakerProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, speakerName: r['speaker_name'] as string, cacRc: r['cac_rc'] as string|null, specialisation: r['specialisation'] as string|null, itfTrainingAffiliate: Boolean(r['itf_training_affiliate']), status: r['status'] as MotivationalSpeakerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toEngagement(r: Record<string, unknown>): SpeakingEngagement { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, eventName: r['event_name'] as string, eventDate: r['event_date'] as number, audienceSize: r['audience_size'] as number, feeKobo: r['fee_kobo'] as number, travelKobo: r['travel_kobo'] as number, totalKobo: r['total_kobo'] as number, status: r['status'] as SpeakingEngagement['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toProgram(r: Record<string, unknown>): TrainingProgram { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, programName: r['program_name'] as string, durationDays: r['duration_days'] as number, capacity: r['capacity'] as number, feePerParticipantKobo: r['fee_per_participant_kobo'] as number, upcomingDate: r['upcoming_date'] as number|null, status: r['status'] as TrainingProgram['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class MotivationalSpeakerRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateMotivationalSpeakerInput): Promise<MotivationalSpeakerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO motivational_speaker_profiles (id,workspace_id,tenant_id,business_name,speaker_name,cac_rc,specialisation,itf_training_affiliate,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.speakerName,input.cacRc??null,input.specialisation??null,input.itfTrainingAffiliate?1:0).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[motivational-speaker] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<MotivationalSpeakerProfile|null> { const r = await this.db.prepare('SELECT * FROM motivational_speaker_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<MotivationalSpeakerProfile|null> { const r = await this.db.prepare('SELECT * FROM motivational_speaker_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: MotivationalSpeakerFSMState, _fields?: { cacRc?: string }): Promise<MotivationalSpeakerProfile> {
    await this.db.prepare('UPDATE motivational_speaker_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[motivational-speaker] not found'); return p;
  }
  async createEngagement(profileId: string, tenantId: string, input: { clientRefId: string; eventName: string; eventDate: number; audienceSize?: number; feeKobo: number; travelKobo?: number; totalKobo: number; eventType?: string }): Promise<SpeakingEngagement> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO speaking_engagements (id,profile_id,tenant_id,client_ref_id,event_name,event_date,audience_size,fee_kobo,travel_kobo,total_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,\'enquiry\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.eventName,input.eventDate,input.audienceSize??0,input.feeKobo,input.travelKobo??0,input.totalKobo).run();
    const r = await this.db.prepare('SELECT * FROM speaking_engagements WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[motivational-speaker] engagement create failed'); return toEngagement(r);
  }
  async listEngagements(profileId: string, tenantId: string): Promise<SpeakingEngagement[]> { const { results } = await this.db.prepare('SELECT * FROM speaking_engagements WHERE profile_id=? AND tenant_id=? ORDER BY event_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toEngagement); }
  async createTrainingProgram(profileId: string, tenantId: string, input: { programName: string; durationDays?: number; capacity?: number; feePerParticipantKobo: number; upcomingDate?: number }): Promise<TrainingProgram> {
    if (!Number.isInteger(input.feePerParticipantKobo)) throw new Error('fee_per_participant_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO training_programs (id,profile_id,tenant_id,program_name,duration_days,capacity,fee_per_participant_kobo,upcoming_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,\'open\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.programName,input.durationDays??1,input.capacity??20,input.feePerParticipantKobo,input.upcomingDate??null).run();
    const r = await this.db.prepare('SELECT * FROM training_programs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[motivational-speaker] program create failed'); return toProgram(r);
  }
  async listTrainingPrograms(profileId: string, tenantId: string): Promise<TrainingProgram[]> { const { results } = await this.db.prepare('SELECT * FROM training_programs WHERE profile_id=? AND tenant_id=? ORDER BY upcoming_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toProgram); }
  async enrollInProgram(programId: string, tenantId: string, input: { participantRef: string; enrollmentDate: number; feeKobo: number }): Promise<TrainingEnrollment> {
    if (!Number.isInteger(input.feeKobo)) throw new Error('fee_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO training_enrollments (id,program_id,tenant_id,participant_ref,enrollment_date,fee_kobo,status,created_at) VALUES (?,?,?,?,?,?,\'enrolled\',unixepoch())').bind(id,programId,tenantId,input.participantRef,input.enrollmentDate,input.feeKobo).run();
    const r = await this.db.prepare('SELECT * FROM training_enrollments WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[motivational-speaker] enrollment create failed');
    return { id: r['id'] as string, programId: r['program_id'] as string, tenantId: r['tenant_id'] as string, participantRef: r['participant_ref'] as string, enrollmentDate: r['enrollment_date'] as number, feeKobo: r['fee_kobo'] as number, status: r['status'] as EnrollmentStatus, createdAt: r['created_at'] as number };
  }

  async addTestimonial(profileId: string, tenantId: string, input: { clientRefId: string; testimonialText: string; rating?: number; eventDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO speaker_testimonials (id,profile_id,tenant_id,client_ref_id,testimonial_text,rating,event_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.clientRefId,input.testimonialText,input.rating??null,input.eventDate??null,ts).run();
    return { id, profileId, tenantId, ...input, rating: input.rating??null, eventDate: input.eventDate??null, createdAt: ts };
  }
  async listTestimonials(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM speaker_testimonials WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async addMediaProduct(profileId: string, tenantId: string, input: { productTitle: string; productType: string; priceKobo?: number; publishDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO speaker_media_products (id,profile_id,tenant_id,product_title,product_type,price_kobo,publish_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.productTitle,input.productType,input.priceKobo??0,input.publishDate??null,ts).run();
    return { id, profileId, tenantId, ...input, priceKobo: input.priceKobo??0, publishDate: input.publishDate??null, createdAt: ts };
  }

}
export function guardSeedToClaimed(_p: MotivationalSpeakerProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
