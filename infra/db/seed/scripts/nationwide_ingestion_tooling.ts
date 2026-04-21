import { createHash } from 'node:crypto';

export type SeedEntityType = 'individual' | 'organization' | 'place' | 'profile' | 'vertical_profile' | 'jurisdiction' | 'search_entry' | 'other';

export interface StableIdInput {
  prefix: string;
  parts: Array<string | number | null | undefined>;
  length?: number;
}

export interface KeywordInput {
  canonicalName: string;
  aliases?: string[];
  verticalSlug?: string | null;
  lgaName?: string | null;
  stateName?: string | null;
  registrationNumbers?: string[];
  serviceCategories?: string[];
}

export interface PlaceRef {
  id: string;
  name: string;
  geographyType: string;
  parentId?: string | null;
  ancestryPath?: string | null;
}

export interface PlaceResolutionInput {
  stateName?: string | null;
  lgaName?: string | null;
  wardName?: string | null;
  explicitPlaceId?: string | null;
}

export interface PlaceResolutionResult {
  placeId: string | null;
  resolutionLevel: 'explicit' | 'ward' | 'local_government_area' | 'state' | 'none';
  confidence: 'official_verified' | 'public_high_confidence' | 'market_estimate_placeholder';
  status: 'resolved' | 'unresolved' | 'ambiguous';
  candidates: string[];
}

export interface DuplicateInput {
  sourceRecordId: string;
  entityType: SeedEntityType;
  canonicalName: string;
  primaryPlaceId?: string | null;
  verticalSlug?: string | null;
  registrationNumber?: string | null;
}

export interface SearchEntryInput {
  profileId: string;
  subjectType: 'individual' | 'organization' | 'place';
  subjectId: string;
  tenantId: string;
  displayName: string;
  primaryPlaceId: string | null;
  place?: PlaceRef | null;
  keywordInput: KeywordInput;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface SearchEntryOutput {
  id: string;
  entityType: string;
  entityId: string;
  tenantId: string;
  displayName: string;
  keywords: string;
  placeId: string | null;
  ancestryPath: string;
  visibility: string;
}

export function normalizeSourcePart(value: string | number | null | undefined): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stableWebwakaId(input: StableIdInput): string {
  const normalized = input.parts.map(normalizeSourcePart).filter(Boolean);
  if (!input.prefix || normalized.length === 0) throw new Error('stableWebwakaId requires a prefix and at least one non-empty identity part');
  const digest = createHash('sha256').update(normalized.join('|')).digest('hex').slice(0, input.length ?? 20);
  return `${normalizeSourcePart(input.prefix).replace(/-/g, '_')}_${digest}`;
}

export function sourceStableKey(sourceKey: string, sourceRecordId: string, entityType: SeedEntityType): string {
  return [sourceKey, sourceRecordId, entityType].map(normalizeSourcePart).join('|');
}

export function normalizeKeywordInput(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildKeywords(input: KeywordInput): string {
  const values = [
    input.canonicalName,
    ...(input.aliases ?? []),
    input.verticalSlug ?? '',
    input.lgaName ?? '',
    input.stateName ?? '',
    ...(input.registrationNumbers ?? []),
    ...(input.serviceCategories ?? []),
  ];
  const tokens = values.flatMap((value) => normalizeKeywordInput(value).split(' ').filter(Boolean));
  return Array.from(new Set(tokens)).join(' ');
}

function parseAncestry(place?: PlaceRef | null): string[] {
  if (!place) return [];
  if (!place.ancestryPath) return [place.id];
  try {
    const parsed = JSON.parse(place.ancestryPath);
    if (!Array.isArray(parsed)) return [place.id];
    return [...parsed.filter((item): item is string => typeof item === 'string'), place.id];
  } catch {
    return [place.id];
  }
}

function namesEqual(a?: string | null, b?: string | null): boolean {
  return Boolean(a && b && normalizeKeywordInput(a) === normalizeKeywordInput(b));
}

export function resolveMostSpecificPlace(input: PlaceResolutionInput, places: PlaceRef[]): PlaceResolutionResult {
  if (input.explicitPlaceId) {
    const exact = places.find((place) => place.id === input.explicitPlaceId);
    return exact
      ? { placeId: exact.id, resolutionLevel: 'explicit', confidence: 'official_verified', status: 'resolved', candidates: [exact.id] }
      : { placeId: null, resolutionLevel: 'none', confidence: 'market_estimate_placeholder', status: 'unresolved', candidates: [] };
  }

  const states = places.filter((place) => place.geographyType === 'state' && namesEqual(place.name, input.stateName));
  const lgas = places.filter((place) => place.geographyType === 'local_government_area' && namesEqual(place.name, input.lgaName) && (states.length === 0 || states.some((state) => state.id === place.parentId)));
  const wards = places.filter((place) => place.geographyType === 'ward' && namesEqual(place.name, input.wardName) && (lgas.length === 0 || lgas.some((lga) => lga.id === place.parentId)));

  if (wards.length === 1) return { placeId: wards[0].id, resolutionLevel: 'ward', confidence: 'official_verified', status: 'resolved', candidates: [wards[0].id] };
  if (wards.length > 1) return { placeId: null, resolutionLevel: 'ward', confidence: 'public_high_confidence', status: 'ambiguous', candidates: wards.map((ward) => ward.id) };
  if (lgas.length === 1) return { placeId: lgas[0].id, resolutionLevel: 'local_government_area', confidence: 'official_verified', status: 'resolved', candidates: [lgas[0].id] };
  if (lgas.length > 1) return { placeId: null, resolutionLevel: 'local_government_area', confidence: 'public_high_confidence', status: 'ambiguous', candidates: lgas.map((lga) => lga.id) };
  if (states.length === 1) return { placeId: states[0].id, resolutionLevel: 'state', confidence: 'official_verified', status: 'resolved', candidates: [states[0].id] };
  if (states.length > 1) return { placeId: null, resolutionLevel: 'state', confidence: 'public_high_confidence', status: 'ambiguous', candidates: states.map((state) => state.id) };
  return { placeId: null, resolutionLevel: 'none', confidence: 'market_estimate_placeholder', status: 'unresolved', candidates: [] };
}

export function duplicateKey(input: DuplicateInput): string {
  const registration = normalizeSourcePart(input.registrationNumber);
  if (registration) return [input.entityType, 'registration', registration].join('|');
  return [input.entityType, normalizeSourcePart(input.verticalSlug), normalizeSourcePart(input.primaryPlaceId), normalizeSourcePart(input.canonicalName)].join('|');
}

export function findDuplicateCandidates(records: DuplicateInput[]): Array<{ key: string; sourceRecordIds: string[] }> {
  const grouped = new Map<string, string[]>();
  for (const record of records) {
    const key = duplicateKey(record);
    grouped.set(key, [...(grouped.get(key) ?? []), record.sourceRecordId]);
  }
  return Array.from(grouped.entries())
    .filter(([, sourceRecordIds]) => sourceRecordIds.length > 1)
    .map(([key, sourceRecordIds]) => ({ key, sourceRecordIds }));
}

export function buildSearchEntry(input: SearchEntryInput): SearchEntryOutput {
  if (!input.primaryPlaceId) throw new Error('buildSearchEntry requires primaryPlaceId for seeded profiles');
  const ancestryPath = JSON.stringify(parseAncestry(input.place));
  return {
    id: stableWebwakaId({ prefix: 'srch', parts: [input.tenantId, input.subjectType, input.subjectId, input.profileId] }),
    entityType: input.subjectType,
    entityId: input.subjectId,
    tenantId: input.tenantId,
    displayName: input.displayName,
    keywords: buildKeywords(input.keywordInput),
    placeId: input.primaryPlaceId,
    ancestryPath,
    visibility: input.visibility ?? 'public',
  };
}

export const SEARCH_FTS_REBUILD_SQL = "INSERT INTO search_fts(search_fts) VALUES('rebuild')";

export const S04_QA_QUERIES = {
  rootEntitiesMissingSourceLinks: "SELECT COUNT(*) AS failures FROM (SELECT 'individual' AS entity_type, id AS entity_id FROM individuals WHERE tenant_id = 'tenant_platform_seed' UNION ALL SELECT 'organization', id FROM organizations WHERE tenant_id = 'tenant_platform_seed') e WHERE NOT EXISTS (SELECT 1 FROM seed_entity_sources s WHERE s.entity_type = e.entity_type AND s.entity_id = e.entity_id)",
  profilesMissingPrimaryPlace: "SELECT COUNT(*) AS failures FROM profiles p WHERE p.claim_state IN ('seeded','claimable') AND p.primary_place_id IS NULL",
  profilesWithInvalidPrimaryPlace: "SELECT COUNT(*) AS failures FROM profiles p LEFT JOIN places pl ON pl.id = p.primary_place_id WHERE p.primary_place_id IS NOT NULL AND pl.id IS NULL",
  seededProfilesMissingSearchEntry: "SELECT COUNT(*) AS failures FROM profiles p WHERE p.publication_state = 'published' AND p.primary_place_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM search_entries s WHERE s.entity_type = p.subject_type AND s.entity_id = p.subject_id)",
  unresolvedPlaceResolutions: "SELECT COUNT(*) AS failures FROM seed_place_resolutions WHERE status <> 'resolved'",
  duplicateSourceIdentityMaps: "SELECT COUNT(*) AS failures FROM (SELECT source_id, source_record_id, entity_type FROM seed_identity_map GROUP BY source_id, source_record_id, entity_type HAVING COUNT(*) > 1)",
};

function assertSelfTest(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

if (process.argv.includes('--self-test')) {
  const first = stableWebwakaId({ prefix: 'org', parts: ['inec', 'party', 'APC'] });
  const second = stableWebwakaId({ prefix: 'org', parts: [' INEC ', 'party', 'apc'] });
  assertSelfTest(first === second, 'stable IDs must repeat for equivalent source identity');
  const places: PlaceRef[] = [
    { id: 'place_state_lagos', name: 'Lagos', geographyType: 'state', ancestryPath: '["place_nigeria_001","place_zone_south_west"]' },
    { id: 'place_lga_ikeja', name: 'Ikeja', geographyType: 'local_government_area', parentId: 'place_state_lagos', ancestryPath: '["place_nigeria_001","place_zone_south_west","place_state_lagos"]' },
    { id: 'place_ward_ikeja_ward_a', name: 'Ward A', geographyType: 'ward', parentId: 'place_lga_ikeja', ancestryPath: '["place_nigeria_001","place_zone_south_west","place_state_lagos","place_lga_ikeja"]' },
  ];
  const resolved = resolveMostSpecificPlace({ stateName: 'Lagos', lgaName: 'Ikeja', wardName: 'Ward A' }, places);
  assertSelfTest(resolved.placeId === 'place_ward_ikeja_ward_a', 'resolver must choose the most specific valid place');
  const keywords = buildKeywords({ canonicalName: 'Ikeja Model School', aliases: ['IMS'], verticalSlug: 'school', lgaName: 'Ikeja', stateName: 'Lagos', registrationNumbers: ['REG-123'], serviceCategories: ['UBE'] });
  assertSelfTest(keywords.includes('ikeja') && keywords.includes('reg') && keywords.includes('123'), 'keywords must include canonical safe discovery terms');
  const duplicates = findDuplicateCandidates([
    { sourceRecordId: 'a', entityType: 'organization', canonicalName: 'Alpha Clinic', primaryPlaceId: 'place_lga_ikeja', verticalSlug: 'clinic' },
    { sourceRecordId: 'b', entityType: 'organization', canonicalName: 'Alpha Clinic', primaryPlaceId: 'place_lga_ikeja', verticalSlug: 'clinic' },
  ]);
  assertSelfTest(duplicates.length === 1, 'duplicate detector must group equivalent records');
  const entry = buildSearchEntry({ profileId: 'prof_1', subjectType: 'organization', subjectId: 'org_1', tenantId: 'tenant_platform_seed', displayName: 'Alpha Clinic', primaryPlaceId: 'place_lga_ikeja', place: places[1], keywordInput: { canonicalName: 'Alpha Clinic', verticalSlug: 'clinic', lgaName: 'Ikeja', stateName: 'Lagos' } });
  assertSelfTest(entry.ancestryPath.includes('place_lga_ikeja'), 'search entry must include ancestry plus primary place');
  console.log(JSON.stringify({ stableId: first, resolvedPlaceId: resolved.placeId, duplicateGroups: duplicates.length, searchEntryId: entry.id }));
}
